"""init

Revision ID: a8d756155783
Revises:
Create Date: 2026-03-06 12:05:40
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a8d756155783"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_id", "users", ["id"], unique=False)

    op.create_table(
        "habits",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=140), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("frequency_type", sa.String(length=20), nullable=False),
        sa.Column("reminder_time", sa.Time(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_habits_id", "habits", ["id"], unique=False)
    op.create_index("ix_habits_user_id", "habits", ["user_id"], unique=False)

    op.create_table(
        "habit_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("habit_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("completed_date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["habit_id"], ["habits.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_habit_logs_completed_date", "habit_logs", ["completed_date"], unique=False)
    op.create_index("ix_habit_logs_habit_id", "habit_logs", ["habit_id"], unique=False)
    op.create_index("ix_habit_logs_id", "habit_logs", ["id"], unique=False)
    op.create_index("ix_habit_logs_user_id", "habit_logs", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_habit_logs_user_id", table_name="habit_logs")
    op.drop_index("ix_habit_logs_id", table_name="habit_logs")
    op.drop_index("ix_habit_logs_habit_id", table_name="habit_logs")
    op.drop_index("ix_habit_logs_completed_date", table_name="habit_logs")
    op.drop_table("habit_logs")

    op.drop_index("ix_habits_user_id", table_name="habits")
    op.drop_index("ix_habits_id", table_name="habits")
    op.drop_table("habits")

    op.drop_index("ix_users_id", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
