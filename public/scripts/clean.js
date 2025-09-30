#!/usr/bin/env node

/**
 * Clean build artifacts and cache directories
 * Works cross-platform (Windows, macOS, Linux)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to clean
const CLEAN_DIRS = [
  '../.next',
  '../out',
  '../dist',
  '../build',
  '../.turbo',
  '../node_modules/.cache',
  '../node_modules/',
  '../coverage',
  '../.nyc_output'
];

// Files to clean
const CLEAN_FILES = [
  '../tsconfig.tsbuildinfo',
  '../.tsbuildinfo'
];

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      return true;
    } catch (error) {
      log(`  ⚠️  Failed to remove ${dirPath}: ${error.message}`, 'yellow');
      return false;
    }
  }
  return false;
}

function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      log(`  ⚠️  Failed to remove ${filePath}: ${error.message}`, 'yellow');
      return false;
    }
  }
  return false;
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  if (!fs.existsSync(dirPath)) {
    return 0;
  }

  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    // Silent fail for permission errors
  }
  
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function clean() {
  log('\n🧹 Starting cleanup process...', 'cyan');
  log('================================\n', 'cyan');
  
  const projectRoot = process.cwd();
  let totalCleaned = 0;
  let totalSize = 0;
  
  // Clean directories
  log('📁 Cleaning directories:', 'blue');
  for (const dir of CLEAN_DIRS) {
    const dirPath = path.join(projectRoot, dir);
    const dirSize = getDirectorySize(dirPath);
    
    if (removeDirectory(dirPath)) {
      totalCleaned++;
      totalSize += dirSize;
      log(`  ✅ Removed: ${dir} (${formatBytes(dirSize)})`, 'green');
    } else if (fs.existsSync(dirPath)) {
      log(`  ❌ Failed: ${dir}`, 'red');
    } else {
      log(`  ⏭️  Skipped: ${dir} (not found)`, 'yellow');
    }
  }
  
  // Clean files
  log('\n📄 Cleaning files:', 'blue');
  for (const file of CLEAN_FILES) {
    const filePath = path.join(projectRoot, file);
    let fileSize = 0;
    
    if (fs.existsSync(filePath)) {
      fileSize = fs.statSync(filePath).size;
    }
    
    if (removeFile(filePath)) {
      totalCleaned++;
      totalSize += fileSize;
      log(`  ✅ Removed: ${file} (${formatBytes(fileSize)})`, 'green');
    } else if (fs.existsSync(filePath)) {
      log(`  ❌ Failed: ${file}`, 'red');
    } else {
      log(`  ⏭️  Skipped: ${file} (not found)`, 'yellow');
    }
  }
  
  // Summary
  log('\n================================', 'cyan');
  log(`✨ Cleanup complete!`, 'green');
  log(`   Removed ${totalCleaned} items`, 'green');
  log(`   Freed up ${formatBytes(totalSize)} of disk space`, 'green');
  log('================================\n', 'cyan');
}

// Handle command line arguments
const args = process.argv.slice(2);
const shouldCleanCache = args.includes('--cache');
const shouldCleanModules = args.includes('--modules');

if (shouldCleanCache) {
  CLEAN_DIRS.push('.eslintcache', '.prettiercache');
}

if (shouldCleanModules) {
  log('⚠️  Warning: This will remove node_modules!', 'yellow');
  log('   You will need to run "pnpm install" after this.', 'yellow');
  CLEAN_DIRS.push('node_modules');
}

// Run cleanup
clean();