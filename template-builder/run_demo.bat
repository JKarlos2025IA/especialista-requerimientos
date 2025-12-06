@echo off
title Template Builder Demo
echo ==========================================
echo      INICIANDO DEMO TEMPLATE BUILDER
echo ==========================================

:: Cambiar al directorio donde esta este archivo
cd /d "%~dp0"

:: Verificar si node_modules existe, si no, instalar
IF NOT EXIST "node_modules" (
    echo [INFO] Instalando dependencias por primera vez...
    call npm install
)

echo.
echo [INFO] Iniciando servidor...
echo [INFO] La aplicacion se abrira en tu navegador automaticamente.
echo.

:: Abrir el navegador (espera un poco para asegurar que vite inicie)
timeout /t 3 >nul
start "" "http://localhost:5173"

:: Ejecutar el servidor
call npm run dev
pause
