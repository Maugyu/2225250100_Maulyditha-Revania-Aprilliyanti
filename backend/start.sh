#!/bin/sh
# Skrip start produksi: migrasi → muat konten (idempoten) → server.
# Satu worker: SQLite + pembatasan login di memori (SECURITY_AND_PRIVACY §3).
set -e
mkdir -p data
alembic upgrade head
python -m app.cli seed-content
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --workers 1 --proxy-headers --forwarded-allow-ips="*"
