#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Auto-updating version for EAS build...');

function getNextVersion(currentVersion, type = 'patch') {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

function getNextBuildNumber(currentBuildNumber) {
  return (parseInt(currentBuildNumber) + 1).toString();
}

function updateAppConfigForEAS(newVersion, newBuildNumber) {
  const configPath = path.join(__dirname, '../app.config.ts');
  
  if (!fs.existsSync(configPath)) {
    console.log('❌ app.config.ts not found');
    return false;
  }
  
  try {
    let content = fs.readFileSync(configPath, 'utf8');
    
    content = content.replace(
      /version:\s*['"`][^'"`]*['"`]/,
      `version: '${newVersion}'`
    );
    
    content = content.replace(
      /buildNumber:\s*['"`][^'"`]*['"`]/,
      `buildNumber: '${newBuildNumber}'`
    );
    
    fs.writeFileSync(configPath, content, 'utf8');
    console.log('✅ app.config.ts updated for EAS build');
    console.log(`📱 New version: ${newVersion} (${newBuildNumber})`);
    return true;
  } catch (error) {
    console.error('❌ Error updating app.config.ts:', error.message);
    return false;
  }
}

function main() {
  try {
    const configPath = path.join(__dirname, '../app.config.ts');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    const versionMatch = configContent.match(/version:\s*['"`]([^'"`]*)['"`]/);
    const buildNumberMatch = configContent.match(/buildNumber:\s*['"`]([^'"`]*)['"`]/);
    
    if (!versionMatch || !buildNumberMatch) {
      console.log('❌ Could not find version or buildNumber in app.config.ts');
      process.exit(1);
    }
    
    const currentVersion = versionMatch[1];
    const currentBuildNumber = buildNumberMatch[1];
    
    const newVersion = getNextVersion(currentVersion, 'patch');
    const newBuildNumber = getNextBuildNumber(currentBuildNumber);
    
    console.log(`📊 Current version: ${currentVersion} (${currentBuildNumber})`);
    console.log(`📊 New version: ${newVersion} (${newBuildNumber})`);
    
    const success = updateAppConfigForEAS(newVersion, newBuildNumber);
    
    if (success) {
      console.log('🎉 Version updated successfully for EAS build!');
    } else {
      console.log('❌ Failed to update version');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error updating version:', error.message);
    process.exit(1);
  }
}

main();
