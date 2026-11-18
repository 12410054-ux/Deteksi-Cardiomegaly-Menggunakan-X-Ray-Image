@echo off
title Ruang Rontgen - Online via ngrok
cd /d "%~dp0"
echo ========================================================
echo   Menjalankan Aplikasi Ruang Rontgen + ngrok Tunnel
echo ========================================================
if exist tools\start_ngrok.js (
    node tools\start_ngrok.js
) else (
    node start_ngrok.js
)
pause
