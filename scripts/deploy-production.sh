#!/bin/bash

# Production Deployment Script for Stars2Screen
# This script will build and deploy your Next.js application

echo "🚀 Starting production deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v)
echo "📦 Node.js version: $NODE_VERSION"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies."
    exit 1
fi

echo "🔨 Building application for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed. Please check the error messages above."
    exit 1
fi

# Check if build was successful
if [ ! -d ".next" ]; then
    echo "❌ Error: .next directory not found after build."
    exit 1
fi

if [ ! -f ".next/BUILD_ID" ]; then
    echo "❌ Error: BUILD_ID not found. Build may have failed."
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Build files created in .next/ directory"

# Show build info
echo "📊 Build Information:"
echo "   - Build ID: $(cat .next/BUILD_ID)"
echo "   - Build time: $(date)"
echo "   - .next directory size: $(du -sh .next | cut -f1)"

echo ""
echo "🚀 To start the production server, run:"
echo "   npm start"
echo ""
echo "🌐 To start in development mode, run:"
echo "   npm run dev"
echo ""
echo "📝 To check the build output, run:"
echo "   npm run build"
echo ""
echo "🎯 Deployment completed successfully!" 