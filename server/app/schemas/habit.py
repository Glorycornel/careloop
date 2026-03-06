from datetime import date, time, datetime

from pydantic import BaseModel


class HabitBase(BaseModel):
    title: str
    description: str | None = None
    frequency_type: str = "daily"
    reminder_time: time | None = None
    is_active: bool = True


class HabitCreate(HabitBase):
    pass


class HabitUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    frequency_type: str | None = None
    reminder_time: time | None = None
    is_active: bool | None = None


class HabitOut(HabitBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class HabitTodayOut(HabitOut):
    completed_today: bool
    streak: int


class HabitCompleteOut(BaseModel):
    habit_id: int
    completed_date: date
    streak: int
