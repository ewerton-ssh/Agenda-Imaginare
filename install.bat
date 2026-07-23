@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"

cd /d "%ROOT%"

echo =====================================
echo Instalando PM2 atualizado
echo =====================================

call npm.cmd uninstall -g pm2 >nul 2>&1

call npm.cmd install -g pm2@latest

if errorlevel 1 (
    echo ERRO: falha ao instalar PM2.
    pause
    exit /b 1
)

echo.
echo Versao instalada:
call pm2 -v


echo.
echo =====================================
echo Instalando dependencias backend
echo =====================================

cd /d "%ROOT%Backend"

call npm.cmd run setup

if errorlevel 1 (
    echo ERRO: falha no setup do backend.
    pause
    exit /b 1
)


echo.
echo =====================================
echo Instalando dependencias frontend
echo =====================================

cd /d "%ROOT%Frontend"

call npm.cmd run setup

if errorlevel 1 (
    echo ERRO: falha no setup do frontend.
    pause
    exit /b 1
)


echo.
echo =====================================
echo Limpando processos antigos PM2
echo =====================================

call pm2 delete agenda-backend >nul 2>&1
call pm2 delete agenda-frontend >nul 2>&1


echo.
echo =====================================
echo Iniciando backend
echo =====================================

cd /d "%ROOT%Backend"

call pm2 start app.js ^
    --name agenda-backend ^
    --time

if errorlevel 1 (
    echo ERRO: falha ao iniciar backend.
    pause
    exit /b 1
)


echo.
echo =====================================
echo Iniciando frontend
echo =====================================

cd /d "%ROOT%Frontend\server"

call pm2 start server.js ^
    --name agenda-frontend ^
    --time

if errorlevel 1 (
    echo ERRO: falha ao iniciar frontend.
    pause
    exit /b 1
)


echo.
echo =====================================
echo Salvando processos PM2
echo =====================================

call pm2 save


echo.
echo =====================================
echo Servicos iniciados
echo =====================================

echo.
echo Backend:
echo http://localhost:3010

echo.
echo Frontend:
echo http://localhost:3000

echo.
echo Comandos:
echo pm2 list
echo pm2 logs agenda-backend
echo pm2 logs agenda-frontend
echo pm2 restart agenda-backend
echo pm2 restart agenda-frontend

echo.
pause

endlocal
exit /b 0