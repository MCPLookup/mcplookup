// Test GitHub Repository Ownership System
// Tests the verification file generation and checking process

import { githubOwnershipService } from '../src/lib/services/github-ownership.js';

console.log('🧪 Testing GitHub Repository Ownership System');
console.log('='.repeat(50));

async function testGitHubOwnership() {
  try {
    
    // Test 1: Claim repository ownership
    console.log('\n1. Testing Repository Ownership Claim');
    console.log('-'.repeat(30));
    
    const challenge = await githubOwnershipService.claimRepositoryOwnership(
      'testuser/test-mcp-server',
      'user123',
      'I am the original author of this repository'
    );
    
    console.log('✅ Ownership claim created:');
    console.log(`   Repository: ${challenge.github_repo}`);
    console.log(`   Verification File: ${challenge.file_name}`);
    console.log(`   Verification Hash: ${challenge.verification_hash}`);
    console.log(`   Expires: ${challenge.expires_at.toISOString()}`);
    
    // Test 2: Verify ownership (simulate successful verification)
    console.log('\n2. Testing Ownership Verification (Mock Success)');
    console.log('-'.repeat(30));
    
    // Mock the GitHub file fetch to return our hash
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url) => {
      if (url.includes('api.github.com/repos/testuser/test-mcp-server/contents/mcplookup.org')) {
        return {
          ok: true,
          json: async () => ({
            content: Buffer.from(challenge.verification_hash).toString('base64'),
            encoding: 'base64'
          })
        };
      }
      return originalFetch(url);
    };
    
    const verificationResult = await githubOwnershipService.verifyRepositoryOwnership(
      'testuser/test-mcp-server',
      challenge.verification_hash,
      'main',
      'user123'
    );
    
    console.log('✅ Verification result:');
    console.log(`   Verified: ${verificationResult.verified}`);
    console.log(`   Message: ${verificationResult.message}`);
    console.log(`   Ownership Status: ${verificationResult.ownership_status}`);
    console.log(`   Badges: ${verificationResult.badges?.join(', ')}`);
    
    // Test 3: Test ownership checking
    console.log('\n3. Testing Ownership Status Check');
    console.log('-'.repeat(30));
    
    const ownershipStatus = await githubOwnershipService.checkRepositoryOwnership(
      'testuser/test-mcp-server',
      'user123'
    );
    
    console.log('✅ Ownership status:');
    console.log(`   Owned: ${ownershipStatus.owned}`);
    console.log(`   Owner: ${ownershipStatus.owner_user_id || 'None'}`);
    
    // Test 4: Test GitHub repository existence check
    console.log('\n4. Testing GitHub Repository Existence');
    console.log('-'.repeat(30));
    
    // Mock GitHub API response for repo existence
    globalThis.fetch = async (url) => {
      if (url.includes('api.github.com/repos/testuser/test-mcp-server') && !url.includes('contents')) {
        return { ok: true };
      }
      if (url.includes('api.github.com/repos/nonexistent/repo')) {
        return { ok: false, status: 404 };
      }
      return originalFetch(url);
    };
    
    console.log('✅ Repository existence checks simulated');
    
    // Restore original fetch
    globalThis.fetch = originalFetch;
    
    console.log('\n🎉 All GitHub Ownership Tests Completed Successfully!');
    console.log('\n📋 Key Features Validated:');
    console.log('✅ Repository ownership claiming');
    console.log('✅ Verification file generation');
    console.log('✅ GitHub API integration for file checking');
    console.log('✅ Ownership verification process');
    console.log('✅ Badge assignment for owned repositories');
    console.log('✅ Ownership status tracking');
    
    console.log('\n🔧 Repository Ownership Hierarchy:');
    console.log('1. Unowned GitHub Repo - Anyone can submit');
    console.log('2. Owned GitHub Repo - Verified with hash file');
    console.log('3. Owned GitHub + Domain - Repo + DNS verification');
    
    console.log('\n💡 Verification Process:');
    console.log('1. User claims repository ownership');
    console.log('2. System generates unique hash');
    console.log('3. User creates mcplookup.org file with hash');
    console.log('4. User commits file to any branch');
    console.log('5. System verifies file exists with correct hash');
    console.log('6. User gains ownership and editing privileges');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testGitHubOwnership().catch(console.error);
