@echo off
echo 🔍 Checking Vercel Blob Configuration...
echo ========================================

REM Check if .env.local exists
if exist ".env.local" (
    echo ✅ .env.local file exists
    
    REM Check if BLOB_READ_WRITE_TOKEN is in .env.local
    findstr /C:"BLOB_READ_WRITE_TOKEN" .env.local >nul
    if %errorlevel% equ 0 (
        echo ✅ BLOB_READ_WRITE_TOKEN found in .env.local
    ) else (
        echo ❌ BLOB_READ_WRITE_TOKEN not found in .env.local
    )
) else (
    echo ❌ .env.local file does not exist
)

echo.
echo 🔧 Quick Fix Instructions:
echo ==========================
echo 1. Create .env.local file if it doesn't exist:
echo    echo. > .env.local
echo.
echo 2. Add your Vercel Blob token:
echo    echo BLOB_READ_WRITE_TOKEN=your_token_here >> .env.local
echo.
echo 3. Restart your development server:
echo    npm run dev
echo.
echo 4. Test upload at: http://localhost:3000/profile
echo.
echo 📖 For detailed setup instructions, see: docs/BLOB_SETUP.md
pause