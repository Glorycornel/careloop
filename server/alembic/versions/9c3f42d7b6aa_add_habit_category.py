"""add habit category

Revision ID: 9c3f42d7b6aa
Revises: a8d756155783
Create Date: 2026-03-07 17:35:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9c3f42d7b6aa"
down_revision: Union[str, None] = "a8d756155783"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "habits",
        sa.Column("category", sa.String(length=20), nullable=False, server_default="build"),
    )


def downgrade() -> None:
    op.drop_column("habits", "category")
