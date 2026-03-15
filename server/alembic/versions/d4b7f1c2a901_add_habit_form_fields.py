"""add habit form fields

Revision ID: d4b7f1c2a901
Revises: 9c3f42d7b6aa
Create Date: 2026-03-07 18:05:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d4b7f1c2a901"
down_revision: Union[str, None] = "9c3f42d7b6aa"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "habits",
        sa.Column(
            "active_days",
            sa.String(length=40),
            nullable=False,
            server_default="mon,tue,wed,thu,fri,sat,sun",
        ),
    )
    op.add_column(
        "habits",
        sa.Column("daily_target", sa.Integer(), nullable=True),
    )
    op.add_column(
        "habits",
        sa.Column("icon", sa.String(length=8), nullable=False, server_default="✅"),
    )


def downgrade() -> None:
    op.drop_column("habits", "icon")
    op.drop_column("habits", "daily_target")
    op.drop_column("habits", "active_days")
