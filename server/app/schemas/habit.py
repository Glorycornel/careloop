from datetime import date, time, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class HabitBase(BaseModel):
    title: str
    description: str | None = None
    category: Literal["build", "quit"] = "build"
    frequency_type: str = "daily"
    active_days: str = "mon,tue,wed,thu,fri,sat,sun"
    daily_target: int | None = None
    icon: str = "✅"
    reminder_time: time | None = None
    is_active: bool = True


class HabitCreate(HabitBase):
    pass


class HabitUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: Literal["build", "quit"] | None = None
    frequency_type: str | None = None
    active_days: str | None = None
    daily_target: int | None = None
    icon: str | None = None
    reminder_time: time | None = None
    is_active: bool | None = None


class HabitOut(HabitBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HabitTodayOut(HabitOut):
    completed_today: bool
    streak: int


class HabitCompleteOut(BaseModel):
    habit_id: int
    completed_date: date
    streak: int
