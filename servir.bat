@echo off
rem GPS HCQ - enciende un servidor local para probar la app desde celulares en la misma red wifi.
setlocal enabledelayedexpansion
cd /d "%~dp0"
title GPS HCQ - servidor local (cierra esta ventana para detenerlo)
set PY=
where python >nul 2>nul && set PY=python
if "%PY%"=="" ( where py >nul 2>nul && set PY=py -3 )
if "%PY%"=="" (
  echo.
  echo  No se encontro Python en este PC. Opciones:
  echo   - Instalar Python desde https://www.python.org/downloads/  (marcar "Add python to PATH"^)
  echo   - O pedir a Informatica que publique la carpeta "app" en la intranet (ver LEEME-instalar.txt^)
  echo.
  pause
  exit /b 1
)
echo.
echo  GPS Hospital de Cauquenes - servidor local
echo  ------------------------------------------
echo  En este PC:        http://localhost:8080
echo  Desde un celular en el mismo wifi, usa la IP de este PC:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  set ip=%%a
  set ip=!ip: =!
  echo                     http://!ip!:8080
)
echo.
echo  Mientras esta ventana siga abierta, la app esta disponible. Cierrala para detener.
echo.
start "" "http://localhost:8080/index.html"
%PY% -m http.server 8080
