// Test script to verify upload API works
// Run this after starting the dev server: node scripts/test-upload.js

const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function testUpload() {
  try {
    console.log('🧪 Testing upload API...');
    
    // Create a simple test file
    const testContent = 'Test image content';
    const testFile = Buffer.from(testContent);
    
    const formData = new FormData();
    formData.append('file', testFile, {
      filename: 'test.jpg',
      contentType: 'image/jpeg'
    });
    formData.append('userId', 'test-user-id');
    formData.append('title', 'Test Upload');
    formData.append('description', 'Testing upload functionality');
    
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload test successful!');
      console.log('Response:', result);
    } else {
      console.log('❌ Upload test failed!');
      console.log('Error:', result);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testUpload();