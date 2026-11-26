"""Titik masuk FastAPI."""

import logging

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.errors import register_error_handlers
from app.core.web import SecurityHeaders, mount_frontend
from app.routers import assessments, auth, learning, researcher, tutor

VERSION = "0.1.0"


def create_app() -> FastAPI:
    settings = get_settings()
    logging.basicConfig(level=settings.log_level)
    app = FastAPI(
        title="JelajahGaris API",
        version=VERSION,
        docs_url=None if settings.is_production else "/docs",
        redoc_url=None,
        openapi_url=None if settings.is_production else "/openapi.json",
    )
    app.add_middleware(SecurityHeaders, https=settings.is_production)
    if settings.cors_origin_list:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origin_list,
            allow_methods=["GET", "POST", "PUT", "PATCH"],
            allow_headers=["Authorization", "Content-Type"],
        )
    register_error_handlers(app)

    api = APIRouter(prefix="/api/v1")

    @api.get("/health", tags=["health"])
    def health():
        return {"status": "ok", "version": VERSION}

    for r in (auth.router, learning.router, assessments.router, researcher.router, tutor.router):
        api.include_router(r)
    app.include_router(api)

    # Harus terakhir: rute penangkap-semua untuk SPA.
    if settings.static_path:
        mount_frontend(app, settings.static_path)
    return app


app = create_app()
