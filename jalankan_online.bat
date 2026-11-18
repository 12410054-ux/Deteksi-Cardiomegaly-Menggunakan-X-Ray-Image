@echo off
title Ruang Rontgen - Online Public Tunnel
cd /d "%~dp0"
echo ========================================================
echo   Menjalankan Aplikasi Ruang Rontgen (Online Public)
echo ========================================================
if exist tools\run_online.py (
    .venv\Scripts\python.exe tools\run_online.py
) else (
    .venv\Scripts\python.exe run_online.py
)
pause
