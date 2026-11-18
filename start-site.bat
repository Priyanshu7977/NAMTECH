@echo off
title NAMTECH - setup
cd /d "%~dp0"
echo === Checking tools ===
where php || (echo PHP is NOT installed or not on PATH & pause & exit /b 1)
where npm || (echo Node.js / npm is NOT installed or not on PATH & pause & exit /b 1)
php -v
echo.
echo === Installing front-end packages (Inter font) ===
pushd frontend
call npm install --no-audit --no-fund
popd
echo.
echo === Applying design content ===
pushd backend
php artisan db:seed --class=DesignContentSeeder --force
php artisan optimize:clear
popd
echo.
echo === Starting servers ===
start "NAMTECH - Vite" cmd /k "cd /d "%~dp0frontend" && npm run dev"
start "NAMTECH - Laravel :4000" cmd /k "cd /d "%~dp0backend" && php artisan serve --port=4000"
echo.
echo Site starting at http://localhost:4000  (keep the two new windows open)
timeout /t 8 >nul
start http://localhost:4000
pause
