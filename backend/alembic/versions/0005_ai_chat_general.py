"""ai_chats: activity_id & step_key boleh kosong untuk obrolan umum dari bilah samping (ADR-021)

Revision ID: 0005
Revises: 0004
Create Date: 2026-11-26 10:00:00

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = '0005'
down_revision: str | Sequence[str] | None = '0004'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table('ai_chats', schema=None) as batch_op:
        batch_op.alter_column('activity_id', existing_type=sa.Integer(), nullable=True)
        batch_op.alter_column('step_key', existing_type=sa.String(length=40), nullable=True)


def downgrade() -> None:
    op.execute("DELETE FROM ai_chats WHERE activity_id IS NULL")
    with op.batch_alter_table('ai_chats', schema=None) as batch_op:
        batch_op.alter_column('step_key', existing_type=sa.String(length=40), nullable=False)
        batch_op.alter_column('activity_id', existing_type=sa.Integer(), nullable=False)
