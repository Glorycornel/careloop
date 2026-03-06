from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.models.user import User
from app.schemas.habit import HabitCompleteOut, HabitCreate, HabitOut, HabitTodayOut, HabitUpdate
from app.services.streaks import calculate_streak
from app.utils.deps import get_current_user

router = APIRouter(prefix="/habits", tags=["habits"])


@router.post("", response_model=HabitOut, status_code=status.HTTP_201_CREATED)
def create_habit(
    payload: HabitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = Habit(user_id=current_user.id, **payload.model_dump())
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit


@router.get("", response_model=list[HabitOut])
def list_habits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Habit)
        .filter(Habit.user_id == current_user.id)
        .order_by(Habit.created_at.desc())
        .all()
    )


@router.get("/today", response_model=list[HabitTodayOut])
def today_habits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    habits = (
        db.query(Habit)
        .filter(Habit.user_id == current_user.id, Habit.is_active.is_(True))
        .order_by(Habit.created_at.desc())
        .all()
    )

    results: list[HabitTodayOut] = []
    for habit in habits:
        completed_today = (
            db.query(HabitLog)
            .filter(
                HabitLog.habit_id == habit.id,
                HabitLog.user_id == current_user.id,
                HabitLog.completed_date == today,
            )
            .first()
            is not None
        )
        streak = calculate_streak(db, habit.id, today)
        results.append(
            HabitTodayOut(
                id=habit.id,
                title=habit.title,
                description=habit.description,
                frequency_type=habit.frequency_type,
                reminder_time=habit.reminder_time,
                is_active=habit.is_active,
                created_at=habit.created_at,
                completed_today=completed_today,
                streak=streak,
            )
        )
    return results


@router.get("/{habit_id}", response_model=HabitOut)
def get_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = (
        db.query(Habit)
        .filter(Habit.id == habit_id, Habit.user_id == current_user.id)
        .first()
    )
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit


@router.patch("/{habit_id}", response_model=HabitOut)
def update_habit(
    habit_id: int,
    payload: HabitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = (
        db.query(Habit)
        .filter(Habit.id == habit_id, Habit.user_id == current_user.id)
        .first()
    )
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(habit, key, value)
    db.commit()
    db.refresh(habit)
    return habit


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = (
        db.query(Habit)
        .filter(Habit.id == habit_id, Habit.user_id == current_user.id)
        .first()
    )
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    db.delete(habit)
    db.commit()
    return None


@router.post("/{habit_id}/complete", response_model=HabitCompleteOut)
def complete_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = (
        db.query(Habit)
        .filter(Habit.id == habit_id, Habit.user_id == current_user.id)
        .first()
    )
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    today = date.today()
    existing = (
        db.query(HabitLog)
        .filter(
            HabitLog.habit_id == habit_id,
            HabitLog.user_id == current_user.id,
            HabitLog.completed_date == today,
        )
        .first()
    )
    if not existing:
        log = HabitLog(
            habit_id=habit_id,
            user_id=current_user.id,
            completed_date=today,
            status="completed",
        )
        db.add(log)
        db.commit()

    streak = calculate_streak(db, habit_id, today)
    return HabitCompleteOut(habit_id=habit_id, completed_date=today, streak=streak)
