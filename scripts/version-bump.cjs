#!/usr/bin/env node
// Version bump script that keeps main repo and bridge repo in lockstep
// Usage: node scripts/version-bump.js [patch|minor|major]

const fs = require('fs');
const { execSync } = require('child_process');

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

function bumpVersion(type = 'patch') {
  const validTypes = ['patch', 'minor', 'major'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid version type: ${type}. Must be one of: ${validTypes.join(', ')}`);
  }
  
  log(`🔢 Bumping ${type} version...`, 'blue');
  
  // Bump version in main repo
  const result = execCommand(`npm version ${type} --no-git-tag-version`);
  const newVersion = result.trim().replace('v', '');
  
  log(`✅ Version bumped to ${newVersion}`, 'green');
  return newVersion;
}

function updateChangelog(version) {
  const changelogPath = 'CHANGELOG.md';
  const date = new Date().toISOString().split('T')[0];
  
  if (fs.existsSync(changelogPath)) {
    log('📝 Updating CHANGELOG.md...', 'blue');
    
    const changelog = fs.readFileSync(changelogPath, 'utf8');
    const newEntry = `\n## [${version}] - ${date}\n\n### Added\n- API client sync with bridge repository\n\n### Changed\n- Updated OpenAPI spec and generated types\n\n`;
    
    // Insert after the first line (usually # Changelog)
    const lines = changelog.split('\n');
    lines.splice(1, 0, newEntry);
    
    fs.writeFileSync(changelogPath, lines.join('\n'));
    log('✅ CHANGELOG.md updated', 'green');
  }
}

function commitMainRepo(version) {
  log('📝 Committing changes to main repository...', 'blue');
  
  try {
    execCommand('git add .');
    execCommand(`git commit -m "chore: bump version to ${version}"`);
    execCommand(`git tag v${version}`);
    log('✅ Main repository committed and tagged', 'green');
  } catch (error) {
    log(`❌ Failed to commit main repo: ${error.message}`, 'red');
    throw error;
  }
}

function syncBridge() {
  log('🌉 Syncing bridge repository...', 'blue');
  
  try {
    execCommand('node scripts/sync-bridge.js');
    log('✅ Bridge repository synced', 'green');
  } catch (error) {
    log(`❌ Failed to sync bridge: ${error.message}`, 'red');
    throw error;
  }
}

function pushChanges() {
  log('🚀 Pushing changes...', 'blue');
  
  try {
    // Push main repo
    execCommand('git push origin main');
    execCommand('git push origin --tags');
    log('✅ Main repository pushed', 'green');
    
    // Bridge repo is pushed by sync script
    log('✅ Bridge repository pushed', 'green');
  } catch (error) {
    log(`❌ Failed to push: ${error.message}`, 'red');
    throw error;
  }
}

async function main() {
  const versionType = process.argv[2] || 'patch';
  
  try {
    log('🚀 Starting version bump process...', 'blue');
    log('===================================', 'blue');
    
    // Step 1: Bump version in main repo
    const newVersion = bumpVersion(versionType);
    
    // Step 2: Update changelog
    updateChangelog(newVersion);
    
    // Step 3: Generate latest API client
    log('🔧 Generating latest API client...', 'blue');
    execCommand('npm run openapi:generate-all');
    log('✅ API client generated', 'green');
    
    // Step 4: Commit main repo changes
    commitMainRepo(newVersion);
    
    // Step 5: Sync bridge repository
    syncBridge();
    
    // Step 6: Push all changes
    pushChanges();
    
    log('', 'reset');
    log('🎉 Version bump completed successfully!', 'green');
    log(`📦 New version: ${newVersion}`, 'cyan');
    log('🔗 Main repo: https://github.com/TSavo/mcplookup.org', 'cyan');
    log('🔗 Bridge repo: https://github.com/MCPLookup-org/mcp-bridge', 'cyan');
    log('', 'reset');
    log('Next steps:', 'yellow');
    log('1. Create GitHub releases for both repositories', 'cyan');
    log('2. Publish bridge package to npm: cd ../mcp-bridge && npm publish', 'cyan');
    
  } catch (error) {
    log('', 'reset');
    log(`❌ Version bump failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
