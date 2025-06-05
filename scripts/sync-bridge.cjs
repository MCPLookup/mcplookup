#!/usr/bin/env node
// Sync script to keep mcp-bridge repository in sync with generated API client
// This script:
// 1. Generates the latest API client from OpenAPI spec
// 2. Syncs generated files to bridge repository
// 3. Updates bridge package version to match main repo
// 4. Commits and pushes changes to bridge repo

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const BRIDGE_REPO_PATH = '../mcp-bridge';
const MAIN_PACKAGE_JSON = './package.json';
const BRIDGE_PACKAGE_JSON = `${BRIDGE_REPO_PATH}/package.json`;

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, cwd = '.') {
  try {
    return execSync(command, { cwd, encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

function checkBridgeRepo() {
  if (!fs.existsSync(BRIDGE_REPO_PATH)) {
    log('❌ Bridge repository not found. Cloning...', 'red');
    execCommand('git clone https://github.com/MCPLookup-org/mcp-bridge.git ../mcp-bridge');
    log('✅ Bridge repository cloned', 'green');
  }
  
  // Ensure we're on the main branch and up to date
  execCommand('git checkout main', BRIDGE_REPO_PATH);
  execCommand('git pull origin main', BRIDGE_REPO_PATH);
  log('✅ Bridge repository updated', 'green');
}

function generateApiClient() {
  log('🔧 Generating API client from OpenAPI spec...', 'blue');
  execCommand('npm run openapi:generate-all');
  log('✅ API client generated', 'green');
}

function syncGeneratedFiles() {
  log('📁 Syncing generated files to bridge repository...', 'blue');
  
  // Ensure target directory exists
  const targetDir = `${BRIDGE_REPO_PATH}/src/generated`;
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Copy generated files
  const filesToSync = [
    'src/lib/generated/types.ts',
    'src/lib/generated/client.ts', 
    'src/lib/generated/api-client.ts'
  ];
  
  for (const file of filesToSync) {
    if (fs.existsSync(file)) {
      const targetFile = `${BRIDGE_REPO_PATH}/${file.replace('src/lib/', 'src/')}`;
      fs.copyFileSync(file, targetFile);
      log(`  ✓ Synced ${file}`, 'cyan');
    } else {
      log(`  ⚠ File not found: ${file}`, 'yellow');
    }
  }
  
  log('✅ Generated files synced', 'green');
}

function syncVersions() {
  log('🔄 Syncing package versions...', 'blue');
  
  // Read main package.json
  const mainPackage = JSON.parse(fs.readFileSync(MAIN_PACKAGE_JSON, 'utf8'));
  const mainVersion = mainPackage.version;
  
  // Read bridge package.json
  const bridgePackage = JSON.parse(fs.readFileSync(BRIDGE_PACKAGE_JSON, 'utf8'));
  const bridgeVersion = bridgePackage.version;
  
  if (mainVersion !== bridgeVersion) {
    log(`  📦 Updating bridge version: ${bridgeVersion} → ${mainVersion}`, 'cyan');
    bridgePackage.version = mainVersion;
    fs.writeFileSync(BRIDGE_PACKAGE_JSON, JSON.stringify(bridgePackage, null, 2) + '\n');
    log('✅ Bridge version updated', 'green');
  } else {
    log(`  ✓ Versions already in sync: ${mainVersion}`, 'cyan');
  }
  
  return { mainVersion, bridgeVersion, updated: mainVersion !== bridgeVersion };
}

function buildBridge() {
  log('🔨 Building bridge repository...', 'blue');
  
  try {
    // Install dependencies if needed
    execCommand('npm install', BRIDGE_REPO_PATH);
    
    // Build the bridge
    execCommand('npm run build', BRIDGE_REPO_PATH);
    log('✅ Bridge built successfully', 'green');
    return true;
  } catch (error) {
    log(`❌ Bridge build failed: ${error.message}`, 'red');
    return false;
  }
}

function commitAndPush(versionInfo) {
  log('📝 Committing changes to bridge repository...', 'blue');
  
  try {
    // Check if there are changes
    const status = execCommand('git status --porcelain', BRIDGE_REPO_PATH).trim();
    
    if (!status) {
      log('  ℹ No changes to commit', 'cyan');
      return;
    }
    
    // Add all changes
    execCommand('git add .', BRIDGE_REPO_PATH);
    
    // Create commit message
    const commitMessage = versionInfo.updated 
      ? `sync: Update to v${versionInfo.mainVersion} with latest API client`
      : `sync: Update API client from main repo`;
    
    // Commit changes
    execCommand(`git commit -m "${commitMessage}"`, BRIDGE_REPO_PATH);
    
    // Push changes
    execCommand('git push origin main', BRIDGE_REPO_PATH);
    
    log('✅ Changes committed and pushed', 'green');
  } catch (error) {
    log(`❌ Failed to commit/push: ${error.message}`, 'red');
    throw error;
  }
}

async function main() {
  try {
    log('🌉 Starting MCP Bridge sync process...', 'blue');
    log('=====================================', 'blue');
    
    // Step 1: Check and update bridge repository
    checkBridgeRepo();
    
    // Step 2: Generate latest API client
    generateApiClient();
    
    // Step 3: Sync generated files
    syncGeneratedFiles();
    
    // Step 4: Sync versions
    const versionInfo = syncVersions();
    
    // Step 5: Build bridge to ensure everything works
    const buildSuccess = buildBridge();
    
    if (!buildSuccess) {
      log('❌ Sync failed due to build errors', 'red');
      process.exit(1);
    }
    
    // Step 6: Commit and push changes
    commitAndPush(versionInfo);
    
    log('', 'reset');
    log('🎉 Bridge sync completed successfully!', 'green');
    log(`📦 Version: ${versionInfo.mainVersion}`, 'cyan');
    log('🔗 Bridge repository: https://github.com/MCPLookup-org/mcp-bridge', 'cyan');
    
  } catch (error) {
    log('', 'reset');
    log(`❌ Sync failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
