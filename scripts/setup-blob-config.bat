@echo off
echo 🔧 Setting up Vercel Blob Storage...
echo ====================================

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo Creating .env.local file...
    (
        echo # Vercel Blob Storage Configuration
        echo # Get your token from: https://vercel.com/storage
        echo BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        echo.
        echo # Supabase Configuration (replace with your actual values)
        echo NEXT_PUBLIC_SUPABASE_URL=https://dlljqwfdwismorqcgjpw.supabase.co
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
        echo SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
        echo.
        echo # JWT Secret for admin authentication
        echo JWT_SECRET=your_jwt_secret_here
    ) > .env.local
    echo ✅ .env.local file created
) else (
    echo ✅ .env.local file already exists
)

echo.
echo 📝 Next Steps:
echo ==============
echo 1. Get your Vercel Blob token from: https://vercel.com/storage
echo 2. Replace the placeholder token in .env.local with your actual token
echo 3. Update other environment variables with your actual values
echo 4. Restart your development server: npm run dev
echo 5. Test upload at: http://localhost:3000/profile
echo.
echo 🔍 To check configuration: scripts\check-blob-config.bat
pause