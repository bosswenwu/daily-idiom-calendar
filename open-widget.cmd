@echo off
rem ============================================================
rem  daily-idiom-calendar - Windows widget launcher (app mode)
rem  NOTE: keep this file ASCII-only so it runs on any code page.
rem ============================================================
setlocal
set "URL=file:///C:/Users/ty00545/Desktop/chengyu-calendar/index.html"
set "EDGE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
set "APP="
if exist "%EDGE%"   set "APP=%EDGE%"
if not defined APP if exist "%CHROME%" set "APP=%CHROME%"

if not defined APP (
    echo [INFO] Edge / Chrome not found. Opening with the default browser...
    start "" "%URL%"
    goto :eof
)

echo [INFO] Opening in standalone (app) window mode...
start "" "%APP%" --app="%URL%" --window-size=480,880 --window-position=1200,140
echo [DONE] The idiom widget window is now open. Keep it on your desktop.
endlocal
