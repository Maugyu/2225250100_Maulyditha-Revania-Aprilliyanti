"""Engine & sesi SQLAlchemy. FK SQLite diaktifkan agar perilaku sama dengan PostgreSQL."""

from collections.abc import Iterator

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


def normalize_db_url(url: str) -> str:
    """Neon/Render memberi `postgres://` atau `postgresql://`; SQLAlchemy butuh nama driver psycopg 3."""
    url = url.strip()
    for prefix in ("postgres://", "postgresql://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix):]
    return url


def make_engine(url: str) -> Engine:
    url = normalize_db_url(url)
    if url.startswith("sqlite"):
        kwargs = {"connect_args": {"check_same_thread": False}}
    else:
        # pool_pre_ping: PostgreSQL terkelola (mis. Neon) menutup koneksi menganggur; cek sebelum dipakai.
        kwargs = {"pool_pre_ping": True, "pool_recycle": 300}
    engine = create_engine(url, **kwargs)
    if url.startswith("sqlite"):

        @event.listens_for(engine, "connect")
        def _fk_on(dbapi_conn, _record):  # noqa: ANN001
            cur = dbapi_conn.cursor()
            cur.execute("PRAGMA foreign_keys=ON")
            cur.close()

    return engine


engine = make_engine(get_settings().database_url)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
