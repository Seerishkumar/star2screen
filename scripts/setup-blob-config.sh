#!/bin/bash

echo "🔧 Setting up Vercel Blob Storage..."
echo "===================================="

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cat > .env.local << 'EOF'
# Vercel Blob Storage Configuration
# Get your token from: https://vercel.com/storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase Configuration (replace with your actual values)
NEXT_PUBLIC_SUPABASE_URL=https://dlljqwfdwismorqcgjpw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Secret for admin authentication
JWT_SECRET=your_jwt_secret_here
EOF
    echo "✅ .env.local file created"
else
    echo "✅ .env.local file already exists"
fi

echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Get your Vercel Blob token from: https://vercel.com/storage"
echo "2. Replace the placeholder token in .env.local with your actual token"
echo "3. Update other environment variables with your actual values"
echo "4. Restart your development server: npm run dev"
echo "5. Test upload at: http://localhost:3000/profile"
echo ""
echo "🔍 To check configuration: npm run check-blob-config"