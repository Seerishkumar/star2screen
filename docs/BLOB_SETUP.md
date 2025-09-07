# Vercel Blob Storage Setup Guide

## Issue: Missing BLOB_READ_WRITE_TOKEN

The image upload functionality requires Vercel Blob storage to be configured with a proper token.

## Solution: Configure BLOB_READ_WRITE_TOKEN

### Step 1: Get Vercel Blob Token

1. **If using Vercel for deployment:**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Go to "Environment Variables"
   - Add `BLOB_READ_WRITE_TOKEN` with your Vercel Blob token

2. **If using Vercel Blob standalone:**
   - Go to [vercel.com/storage](https://vercel.com/storage)
   - Create a new Blob store
   - Copy the `BLOB_READ_WRITE_TOKEN` from the store settings

### Step 2: Set Environment Variables

#### For Local Development (.env.local):
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### For Production (Vercel Dashboard):
1. Go to your project in Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Your Vercel Blob token
   - **Environment**: Production, Preview, Development

### Step 3: Verify Configuration

You can check if the token is configured by visiting:
- Local: `http://localhost:3000/api/debug/environment`
- Production: `https://your-domain.com/api/debug/environment`

Look for `hasBlobToken: true` in the response.

## Alternative: Use Supabase Storage

If you prefer not to use Vercel Blob, you can modify the upload system to use Supabase Storage instead:

### Benefits of Supabase Storage:
- Already integrated with your database
- No additional token required
- Built-in RLS (Row Level Security)
- More cost-effective for large files

### Implementation:
1. Enable Supabase Storage in your project
2. Create a storage bucket for media files
3. Update the upload API to use Supabase Storage instead of Vercel Blob

## Current Error Message

When `BLOB_READ_WRITE_TOKEN` is missing, users will see:
```
File upload service not configured. Please contact administrator to set up BLOB_READ_WRITE_TOKEN environment variable.
```

## Files That Need the Token

- `app/api/upload/route.ts` - Main upload endpoint
- `app/api/blob-delete/route.ts` - File deletion endpoint  
- `app/actions/upload-media.ts` - Server action for uploads

## Testing Upload After Setup

1. Set the `BLOB_READ_WRITE_TOKEN` environment variable
2. Restart your development server: `npm run dev`
3. Go to `/profile` → "Media & Portfolio" tab
4. Try uploading an image
5. Check the browser console for any remaining errors

## Troubleshooting

### Still getting token errors?
1. Verify the token is correctly set in environment variables
2. Restart your development server after adding the token
3. Check that the token has the correct permissions (read/write)
4. Verify the token is not expired

### Upload still failing?
1. Check browser network tab for detailed error messages
2. Look at server logs for additional error details
3. Verify file size is under 50MB limit
4. Check file type is supported (JPG, PNG, GIF, WebP, MP4, MOV, WebM)