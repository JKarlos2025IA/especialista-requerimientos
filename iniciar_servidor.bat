@echo off
echo =========================================
echo  SERVIDOR HTTP - Especialista Requerimientos
echo =========================================
echo.
echo Iniciando servidor web local...
echo.
cd /d "%~dp0"
echo Directorio: %CD%
echo.
echo Servidor activo en:
echo   http://localhost:8000
echo.
echo Abriendo navegador...
start http://localhost:8000
echo.
echo Para detener el servidor presione Ctrl+C
echo =========================================
echo.
python -m http.server 8000
pause
