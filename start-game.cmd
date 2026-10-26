@echo off
setlocal
cd /d "%~dp0"
set "GAME_NODE=node"
where node >nul 2>nul
if not errorlevel 1 goto run
if exist "%ProgramFiles%\nodejs\node.exe" (
  set "GAME_NODE=%ProgramFiles%\nodejs\node.exe"
  goto run
)
if exist "D:\nodejs\node.exe" (
  set "GAME_NODE=D:\nodejs\node.exe"
  goto run
)
echo Node.js 24 is required. Install Node.js and try again.
pause
exit /b 1
:run
"%GAME_NODE%" scripts\start-preview.mjs
if errorlevel 1 (
  pause
  exit /b 1
)
start "" "http://127.0.0.1:4174/"
