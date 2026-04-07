@echo off
echo ====================================
echo   YOUR LOCAL IP ADDRESS FOR MOBILE
echo ====================================
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    echo.
    echo   Open on your phone:
    echo   http://%%a:3000
    echo.
)
echo ====================================
pause
