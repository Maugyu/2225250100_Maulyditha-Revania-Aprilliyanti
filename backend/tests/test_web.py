import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.config import DEV_SECRET, Settings
from app.core.web import SecurityHeaders, mount_frontend


def test_production_rejects_default_secret():
    with pytest.raises(ValueError):
        Settings(env="production", jwt_secret=DEV_SECRET)
    with pytest.raises(ValueError):
        Settings(env="production", jwt_secret="pendek")
    assert Settings(env="production", jwt_secret="x" * 40).is_production


@pytest.fixture()
def spa_client(tmp_path):
    (tmp_path / "index.html").write_text("<html>APP</html>", encoding="utf-8")
    (tmp_path / "sw.js").write_text("// sw", encoding="utf-8")
    (tmp_path / "assets").mkdir()
    (tmp_path / "assets" / "app-123.js").write_text("console.log(1)", encoding="utf-8")
    (tmp_path.parent / "rahasia.txt").write_text("JANGAN", encoding="utf-8")
    app = FastAPI()
    app.add_middleware(SecurityHeaders, https=True)

    @app.get("/api/v1/health")
    def health():
        return {"status": "ok"}

    mount_frontend(app, tmp_path)
    return TestClient(app)


def test_spa_fallback_and_cache_headers(spa_client):
    r = spa_client.get("/beranda")
    assert r.status_code == 200 and "APP" in r.text
    assert r.headers["cache-control"] == "no-cache"
    assert "default-src 'self'" in r.headers["content-security-policy"]
    assert r.headers["strict-transport-security"]
    assert spa_client.get("/sw.js").headers["cache-control"] == "no-cache"
    assert "immutable" in spa_client.get("/assets/app-123.js").headers["cache-control"]


def test_api_routes_not_swallowed(spa_client):
    assert spa_client.get("/api/v1/health").json() == {"status": "ok"}
    r = spa_client.get("/api/v1/tidak-ada")
    assert r.status_code == 404 and r.json()["error"]["code"] == "NOT_FOUND"


def test_path_traversal_blocked(spa_client):
    r = spa_client.get("/..%2Frahasia.txt")
    assert "JANGAN" not in r.text
