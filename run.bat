@echo off
title Gumart bot @thic_autu
chcp 65001 >nul

setlocal
cd /d %~dp0
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js chưa được cài đặt. Vui lòng cài đặt Node.js từ https://nodejs.org/
    exit /b 1
)

if not exist node_modules (
    echo Thư mục node_modules không tồn tại. Đang cài đặt các gói cần thiết...
    npm install
) else (
    echo Đã cài đặt các gói cần thiết.
)
echo Đang chạy bot...
node gumart.js

:: pause
pause

endlocal
