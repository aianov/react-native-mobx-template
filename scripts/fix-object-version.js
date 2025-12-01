#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing objectVersion in Xcode project...');

const projectPath = path.join(__dirname, '../ios/Riseonly.xcodeproj/project.pbxproj');

if (!fs.existsSync(projectPath)) {
  console.log('❌ Project file not found:', projectPath);
  process.exit(1);
}

try {
  let content = fs.readFileSync(projectPath, 'utf8');
  
  if (content.includes('objectVersion = 56;')) {
    console.log('✅ objectVersion is already set to 56');
    process.exit(0);
  }
  
  const updatedContent = content.replace(
    /objectVersion = \d+;/g,
    'objectVersion = 56;'
  );
  
  if (content === updatedContent) {
    console.log('⚠️  No objectVersion found to replace');
    process.exit(0);
  }
  
  fs.writeFileSync(projectPath, updatedContent, 'utf8');
  console.log('✅ Successfully set objectVersion to 56');
  
} catch (error) {
  console.error('❌ Error fixing objectVersion:', error.message);
  process.exit(1);
}
