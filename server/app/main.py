import logging
from time import perf_counter

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import ALLOWED_ORIGINS, LOG_LEVEL, validate_runtime_config
from app.core.observability import (
    clear_request_id,
    configure_logging,
    report_exception,
    set_request_id,
)
from app.routers import auth, habits

configure_logging(LOG_LEVEL)
logger = logging.getLogger("careloop.api")


def create_app() -> FastAPI:
    validate_runtime_config()

    app = FastAPI(title="CareLoop API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(ALLOWED_ORIGINS),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        request_id = set_request_id(request.headers.get("X-Request-ID"))
        started_at = perf_counter()
        try:
            response = await call_next(request)
        except Exception as exc:
            duration_ms = (perf_counter() - started_at) * 1000
            logger.exception(
                "%s %s -> 500 %.2fms",
                request.method,
                request.url.path,
                duration_ms,
            )
            report_exception(
                exc,
                {
                    "method": request.method,
                    "path": request.url.path,
                    "request_id": request_id,
                },
            )
            clear_request_id()
            raise

        duration_ms = (perf_counter() - started_at) * 1000
        response.headers["X-Request-ID"] = request_id
        logger.info(
            "%s %s -> %s %.2fms",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        clear_request_id()
        return response

    app.include_router(auth.router)
    app.include_router(habits.router)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app


app = create_app()
