import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from app.core.config import BASE_DIR
from app.core.database import Base, get_db, make_engine
from app.core.security import hash_pin
from app.main import app
from app.models import Classroom, User
from app.services import rate_limit
from app.services.seed import seed_module

PIN = "111222"


@pytest.fixture(autouse=True)
def _no_real_ai(monkeypatch):
    """Tes tidak boleh memakai kunci Gemini asli dari .env (tidak ada panggilan jaringan sungguhan)."""
    from app.core.config import get_settings
    from app.services import ai

    monkeypatch.setattr(get_settings(), "gemini_api_key", "")
    monkeypatch.setattr(get_settings(), "gemini_fallback_models", "")
    ai.reset_rate_limit()


@pytest.fixture()
def db_session(tmp_path):
    engine = make_engine(f"sqlite:///{(tmp_path / 'test.db').as_posix()}")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with Session() as s:
        seed_module(s, BASE_DIR / "content" / "pgl")
        c = Classroom(code="UJI", label="Kelas uji")
        s.add(c)
        s.flush()
        s.add_all([
            User(username="UJI-01", pin_hash=hash_pin(PIN), role="student", class_id=c.id),
            User(username="UJI-02", pin_hash=hash_pin(PIN), role="student", class_id=c.id),
            User(username="PENELITI-UJI", pin_hash=hash_pin(PIN), role="researcher"),
        ])
        s.commit()
    yield Session
    engine.dispose()


@pytest.fixture()
def client(db_session):
    def _get_db():
        s = db_session()
        try:
            yield s
        finally:
            s.close()

    app.dependency_overrides[get_db] = _get_db
    rate_limit.reset_all()
    yield TestClient(app)
    app.dependency_overrides.clear()


def login(client, username="UJI-01", pin=PIN) -> dict:
    r = client.post("/api/v1/auth/login", json={"username": username, "pin": pin})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}
