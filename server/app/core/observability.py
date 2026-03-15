import json
import logging
from contextvars import ContextVar
from datetime import datetime, timezone
from urllib import request
from uuid import uuid4

from app.core.config import ERROR_REPORTING_WEBHOOK_URL, LOG_FORMAT

request_id_ctx_var: ContextVar[str] = ContextVar("request_id", default="-")


class RequestContextFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_ctx_var.get()
        return True


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": getattr(record, "request_id", "-"),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload)


def configure_logging(log_level: str) -> None:
    handler = logging.StreamHandler()
    handler.addFilter(RequestContextFilter())
    if LOG_FORMAT == "json":
        handler.setFormatter(JsonFormatter())
    else:
        handler.setFormatter(
            logging.Formatter(
                "%(asctime)s %(levelname)s [%(name)s] [request_id=%(request_id)s] %(message)s"
            )
        )

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.setLevel(getattr(logging, log_level, logging.INFO))
    root_logger.addHandler(handler)


def set_request_id(request_id: str | None = None) -> str:
    current_request_id = request_id or str(uuid4())
    request_id_ctx_var.set(current_request_id)
    return current_request_id


def clear_request_id() -> None:
    request_id_ctx_var.set("-")


def report_exception(exc: Exception, context: dict[str, str]) -> None:
    if not ERROR_REPORTING_WEBHOOK_URL:
        return

    payload = json.dumps(
        {
            "error": str(exc),
            "context": context,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    ).encode("utf-8")
    webhook_request = request.Request(
        ERROR_REPORTING_WEBHOOK_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with request.urlopen(webhook_request, timeout=2):
            return
    except Exception:
        logging.getLogger("careloop.error_reporting").exception("error reporting hook failed")
