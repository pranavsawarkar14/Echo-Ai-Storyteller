#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Echo Stories Backend Setup');
console.log('==============================');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
  } else {
    console.log('❌ .env.example not found');
  }
} else {
  console.log('✅ .env file already exists');
}

console.log('\n📋 Setup Checklist:');
console.log('1. ✅ Install dependencies: npm install');
console.log('2. ⚙️  Configure .env file with your values:');
console.log('   - MONGODB_URI (your MongoDB connection string)');
console.log('   - CLERK_SECRET_KEY (from Clerk dashboard)');
console.log('   - ADMIN_USER_IDS (your admin user IDs)');
console.log('3. 🗄️  Start MongoDB (if running locally)');
console.log('4. 🚀 Start the server: npm run dev');

console.log('\n📖 Next Steps:');
console.log('1. Update your frontend .env with backend URL');
console.log('2. Create a user account in your app');
console.log('3. Add your user ID to ADMIN_USER_IDS for admin access');
console.log('4. Test the API endpoints');

console.log('\n🌐 API will be available at: http://localhost:3001');
console.log('📚 Health check: http://localhost:3001/api/health');

console.log('\nHappy coding! 🎉');