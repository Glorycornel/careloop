from datetime import date

from app.models.habit_log import HabitLog
from app.services.streaks import calculate_streak


def add_log(db, habit_id: int, completed_date: date):
    db.add(
        HabitLog(
            habit_id=habit_id,
            user_id=1,
            completed_date=completed_date,
            status="completed",
        )
    )
    db.commit()


def test_calculate_streak_returns_zero_when_no_logs(db_session):
    assert calculate_streak(db_session, habit_id=1, today=date(2026, 3, 12)) == 0


def test_calculate_streak_counts_contiguous_days_from_today(db_session):
    add_log(db_session, habit_id=1, completed_date=date(2026, 3, 12))
    add_log(db_session, habit_id=1, completed_date=date(2026, 3, 11))
    add_log(db_session, habit_id=1, completed_date=date(2026, 3, 10))

    assert calculate_streak(db_session, habit_id=1, today=date(2026, 3, 12)) == 3


def test_calculate_streak_breaks_on_missing_day(db_session):
    add_log(db_session, habit_id=1, completed_date=date(2026, 3, 12))
    add_log(db_session, habit_id=1, completed_date=date(2026, 3, 10))
    add_log(db_session, habit_id=1, completed_date=date(2026, 3, 9))

    assert calculate_streak(db_session, habit_id=1, today=date(2026, 3, 12)) == 1


def test_calculate_streak_ignores_future_logs(db_session):
    add_log(db_session, habit_id=1, completed_date=date(2026, 3, 13))
    add_log(db_session, habit_id=1, completed_date=date(2026, 3, 12))

    assert calculate_streak(db_session, habit_id=1, today=date(2026, 3, 12)) == 1
