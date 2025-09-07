#!/bin/bash

echo "🔍 Checking Vercel Blob Configuration..."
echo "========================================"

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"
    
    # Check if BLOB_READ_WRITE_TOKEN is in .env.local
    if grep -q "BLOB_READ_WRITE_TOKEN" .env.local; then
        echo "✅ BLOB_READ_WRITE_TOKEN found in .env.local"
        
        # Extract and show token (masked)
        TOKEN=$(grep "BLOB_READ_WRITE_TOKEN" .env.local | cut -d'=' -f2)
        if [ ! -z "$TOKEN" ]; then
            MASKED_TOKEN="${TOKEN:0:20}...${TOKEN: -10}"
            echo "✅ Token value: $MASKED_TOKEN"
        else
            echo "❌ Token value is empty"
        fi
    else
        echo "❌ BLOB_READ_WRITE_TOKEN not found in .env.local"
    fi
else
    echo "❌ .env.local file does not exist"
fi

echo ""
echo "🔧 Quick Fix Instructions:"
echo "=========================="
echo "1. Create .env.local file if it doesn't exist:"
echo "   touch .env.local"
echo ""
echo "2. Add your Vercel Blob token:"
echo "   echo 'BLOB_READ_WRITE_TOKEN=your_token_here' >> .env.local"
echo ""
echo "3. Restart your development server:"
echo "   npm run dev"
echo ""
echo "4. Test upload at: http://localhost:3000/profile"
echo ""
echo "📖 For detailed setup instructions, see: docs/BLOB_SETUP.md"