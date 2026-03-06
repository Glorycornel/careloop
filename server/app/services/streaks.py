from datetime import date, timedelta
from sqlalchemy.orm import Session

from app.models.habit_log import HabitLog


def calculate_streak(db: Session, habit_id: int, today: date) -> int:
    logs = (
        db.query(HabitLog)
        .filter(HabitLog.habit_id == habit_id, HabitLog.completed_date <= today)
        .order_by(HabitLog.completed_date.desc())
        .all()
    )
    if not logs:
        return 0

    log_dates = {log.completed_date for log in logs}
    streak = 0
    cursor = today
    while cursor in log_dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak
