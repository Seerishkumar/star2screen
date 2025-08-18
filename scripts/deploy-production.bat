@echo off
REM Production Deployment Script for Stars2Screen (Windows)
REM This script will build and deploy your Next.js application

echo 🚀 Starting production deployment...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo 📦 Node.js version: %NODE_VERSION%

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Error: Failed to install dependencies.
    pause
    exit /b 1
)

echo 🔨 Building application for production...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Error: Build failed. Please check the error messages above.
    pause
    exit /b 1
)

REM Check if build was successful
if not exist ".next" (
    echo ❌ Error: .next directory not found after build.
    pause
    exit /b 1
)

if not exist ".next\BUILD_ID" (
    echo ❌ Error: BUILD_ID not found. Build may have failed.
    pause
    exit /b 1
)

echo ✅ Build completed successfully!
echo 📁 Build files created in .next/ directory

REM Show build info
echo 📊 Build Information:
for /f "tokens=*" %%i in ('type .next\BUILD_ID') do set BUILD_ID=%%i
echo    - Build ID: %BUILD_ID%
echo    - Build time: %date% %time%
echo    - .next directory: .next\

echo.
echo 🚀 To start the production server, run:
echo    npm start
echo.
echo 🌐 To start in development mode, run:
echo    npm run dev
echo.
echo 📝 To check the build output, run:
echo    npm run build
echo.
echo 🎯 Deployment completed successfully!
pause 