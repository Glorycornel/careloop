from datetime import datetime, time

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Time, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Habit(Base):
    __tablename__ = "habits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(140))
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    frequency_type: Mapped[str] = mapped_column(String(20), default="daily")
    reminder_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user = relationship("User", back_populates="habits")
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")
