"""Konfigurasi Alembic: URL basis data diambil dari pengaturan aplikasi (DATABASE_URL)."""

from logging.config import fileConfig

import app.models  # noqa: F401  (mendaftarkan semua tabel)
from alembic import context
from app.core.config import get_settings
from app.core.database import Base, make_engine

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata
DB_URL = get_settings().database_url


def run_migrations_offline() -> None:
    context.configure(
        url=DB_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        render_as_batch=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    engine = make_engine(DB_URL)
    with engine.connect() as connection:
        # render_as_batch: ALTER TABLE yang aman untuk SQLite
        context.configure(connection=connection, target_metadata=target_metadata, render_as_batch=True)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
