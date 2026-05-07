@echo off
cd /d "%~dp0"
echo Iniciando servidor robusto de download...
node interno\download_server.cjs
pause
