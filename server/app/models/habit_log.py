from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class HabitLog(Base):
    __tablename__ = "habit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    habit_id: Mapped[int] = mapped_column(ForeignKey("habits.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    completed_date: Mapped[date] = mapped_column(Date, index=True)
    status: Mapped[str] = mapped_column(String(20), default="completed")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    habit = relationship("Habit", back_populates="logs")
    user = relationship("User", back_populates="habit_logs")
