"""Header keamanan (SECURITY_AND_PRIVACY §5) dan penyajian frontend statis (mode satu layanan)."""

from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

# KaTeX butuh style inline; gambar data: dipakai CSS dekorasi.
CSP = (
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
    "img-src 'self' data:; font-src 'self' data:; connect-src 'self'; "
    "manifest-src 'self'; worker-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
)
NO_CACHE = {"/sw.js", "/index.html", "/manifest.webmanifest", "/registerSW.js"}


class SecurityHeaders(BaseHTTPMiddleware):
    def __init__(self, app, https: bool):
        super().__init__(app)
        self.https = https

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        h = response.headers
        h.setdefault("X-Content-Type-Options", "nosniff")
        h.setdefault("Referrer-Policy", "no-referrer")
        h.setdefault("X-Frame-Options", "DENY")
        h.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        if "text/html" in h.get("content-type", ""):
            h.setdefault("Content-Security-Policy", CSP)
        if self.https:
            h.setdefault("Strict-Transport-Security", "max-age=31536000")
        return response


def mount_frontend(app: FastAPI, root: Path) -> None:
    """Sajikan build Vite; rute SPA yang tidak dikenal jatuh ke index.html."""
    root = root.resolve()
    index = root / "index.html"

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa(full_path: str):
        if full_path.startswith("api/"):
            return JSONResponse(
                {"error": {"code": "NOT_FOUND", "message": "Endpoint tidak ditemukan.", "details": []}},
                status_code=404,
            )
        candidate = (root / full_path).resolve()
        # Cegah path traversal: file harus berada di dalam root.
        if full_path and candidate.is_file() and candidate.is_relative_to(root):
            path = "/" + full_path
            if path in NO_CACHE:
                headers = {"Cache-Control": "no-cache"}
            elif path.startswith("/assets/"):
                headers = {"Cache-Control": "public, max-age=31536000, immutable"}
            else:
                headers = {"Cache-Control": "public, max-age=3600"}
            return FileResponse(candidate, headers=headers)
        return FileResponse(index, headers={"Cache-Control": "no-cache"})
