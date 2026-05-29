@echo off
setlocal ENABLEDELAYEDEXPANSION
chcp 65001 >nul
title EcoColeta - Iniciar projeto

REM ============================================================
REM  EcoColeta - Inicia Apache + MySQL do XAMPP e abre o projeto
REM  Coloque este .bat dentro de  htdocs\projeto_pi
REM ============================================================

cd /d "%~dp0"

echo ============================================================
echo  EcoColeta - iniciando o ambiente local...
echo ============================================================
echo.

REM ---- 1) Localizar o XAMPP --------------------------------------------------
set "XAMPP="
if exist "D:\XAMPP\xampp-control.exe" set "XAMPP=D:\XAMPP"
if not defined XAMPP if exist "D:\xampp\xampp-control.exe" set "XAMPP=D:\xampp"
if not defined XAMPP if exist "C:\xampp\xampp-control.exe" set "XAMPP=C:\xampp"
if not defined XAMPP if exist "C:\XAMPP\xampp-control.exe" set "XAMPP=C:\XAMPP"
if not defined XAMPP if exist "%LocalAppData%\Programs\XAMPP\xampp-control.exe" set "XAMPP=%LocalAppData%\Programs\XAMPP"

if not defined XAMPP (
  echo [ERRO] Nao encontrei o XAMPP nos locais padrao.
  echo        Procurei em: D:\XAMPP, D:\xampp, C:\xampp, C:\XAMPP, %LocalAppData%\Programs\XAMPP
  echo        Instale o XAMPP ou edite este .bat e ajuste a variavel XAMPP.
  echo.
  pause
  exit /b 1
)
echo [OK] XAMPP encontrado em: %XAMPP%
echo.

REM ---- 2) Garantir que a porta 80 esta livre (parar IIS se estiver ligado) --
sc query W3SVC 2>nul | findstr /i "STATE" | findstr /i "RUNNING" >nul
if not errorlevel 1 (
  echo [AVISO] O servico do IIS (W3SVC) esta rodando e ocupa a porta 80.
  echo         Vou tentar parar (pode pedir permissao de administrador).
  net stop W3SVC
  echo.
)

REM ---- 3) Iniciar Apache -----------------------------------------------------
echo [PASSO 1/3] Iniciando Apache...
if exist "%XAMPP%\apache_start.bat" (
  start "" /min "%XAMPP%\apache_start.bat"
) else if exist "%XAMPP%\apache\bin\httpd.exe" (
  start "" /min "%XAMPP%\apache\bin\httpd.exe" -k start
) else (
  echo [ERRO] Nao encontrei o Apache em %XAMPP%\apache
)

REM ---- 4) Iniciar MySQL ------------------------------------------------------
echo [PASSO 2/3] Iniciando MySQL...
if exist "%XAMPP%\mysql_start.bat" (
  start "" /min "%XAMPP%\mysql_start.bat"
) else if exist "%XAMPP%\mysql\bin\mysqld.exe" (
  start "" /min "%XAMPP%\mysql\bin\mysqld.exe" --defaults-file="%XAMPP%\mysql\bin\my.ini"
) else (
  echo [ERRO] Nao encontrei o MySQL em %XAMPP%\mysql
)

echo.
echo Aguardando os servicos subirem (6s)...
ping -n 7 127.0.0.1 >nul

REM ---- 5) Testar se o Apache respondeu na porta 80 ---------------------------
set "APACHE_OK=0"
powershell -NoProfile -Command "try { (Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 http://localhost/ ) | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if not errorlevel 1 set "APACHE_OK=1"

REM ---- 6) Abrir o navegador --------------------------------------------------
echo [PASSO 3/3] Abrindo o projeto no navegador...
if "%APACHE_OK%"=="1" (
  echo.
  echo  >>>  http://localhost/projeto_pi/
  echo.
  start "" http://localhost/projeto_pi/
) else (
  echo.
  echo [AVISO] O Apache nao respondeu em http://localhost/ .
  echo         Vou tentar com a porta padrao do XAMPP (8080)...
  start "" http://localhost:8080/projeto_pi/
  echo.
  echo Se ainda nao abrir, abra manualmente o XAMPP Control Panel
  echo ("%XAMPP%\xampp-control.exe") e clique em Start no Apache e no MySQL.
)

echo.
echo ============================================================
echo  Pronto! Se for a PRIMEIRA vez nesta maquina, rode tambem:
echo     INSTALAR-BANCO.bat
echo  para criar o banco "ecocoleta" no MySQL.
echo ============================================================
echo.
pause
endlocal
