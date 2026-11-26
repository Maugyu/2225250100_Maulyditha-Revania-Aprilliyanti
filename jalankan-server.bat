@echo off
rem Menjalankan JelajahGaris di komputer ini (http://localhost:8000).
rem Klik dua kali file ini. Biarkan jendela ini terbuka selama web dipakai; tutup jendela untuk mematikan server.
title JelajahGaris - server
cd /d "%~dp0backend"
if not exist ".venv\Scripts\python.exe" (
  echo [!] Folder backend\.venv belum ada. Lihat README.md bagian "Menjalankan aplikasi".
  pause
  exit /b 1
)
if not exist "..\frontend\dist\index.html" (
  echo [!] Tampilan web belum dibuild. Jalankan: cd frontend ^&^& npm install ^&^& npm run build
  pause
  exit /b 1
)
echo Menyiapkan basis data...
".venv\Scripts\python.exe" -m alembic upgrade head
echo.
echo  Web siap di:  http://localhost:8000
echo  (Jangan tutup jendela ini selama web dipakai)
echo.
start "" http://localhost:8000
".venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000
pause
