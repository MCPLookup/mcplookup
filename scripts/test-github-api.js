#\!/usr/bin/env node

/**
 * Test script for GitHub Auto-Registration API
 * Tests the comprehensive analysis and rejection logic
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api/v1';
const API_KEY = process.env.API_KEY || null;

// Test cases
const testCases = [
  {
    name: 'Valid MCP Server (should accept)',
    github_url: 'https://github.com/modelcontextprotocol/server-filesystem',
    contact_email: 'test@example.com',
    expectedStatus: [200, 409] // 200 for new registration, 409 if already exists
  },
  {
    name: 'Non-MCP Repository (should reject)',
    github_url: 'https://github.com/facebook/react',
    contact_email: 'test@example.com',
    expectedStatus: [422] // Should be rejected
  },
  {
    name: 'Non-existent Repository (should fail)',
    github_url: 'https://github.com/nonexistent/repository-12345',
    contact_email: 'test@example.com',
    expectedStatus: [400] // Should fail analysis
  }
];

async function testGitHubAPI() {
  console.log('🧪 Testing GitHub Auto-Registration API\n');
  
  for (const testCase of testCases) {
    console.log(`📋 Test: ${testCase.name}`);
    console.log(`🔗 URL: ${testCase.github_url}`);
    
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (API_KEY) {
        headers['Authorization'] = `Bearer ${API_KEY}`;
      }
      
      const response = await fetch(`${API_BASE}/register/github`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          github_url: testCase.github_url,
          contact_email: testCase.contact_email,
          skip_analysis: false
        })
      });
      
      const data = await response.json();
      
      console.log(`📊 Status: ${response.status}`);
      
      if (testCase.expectedStatus.includes(response.status)) {
        console.log('✅ Expected status code');
      } else {
        console.log(`❌ Unexpected status code (expected: ${testCase.expectedStatus.join(' or ')})`);
      }
      
      // Log key analysis results
      if (data.analysis) {
        const analysis = data.analysis;
        console.log(`🎯 Confidence Score: ${analysis.quality_assessment?.confidence_score || 'N/A'}%`);
        console.log(`🛠️  Usability Score: ${analysis.quality_assessment?.usability_score || 'N/A'}%`);
        console.log(`📝 Recommended Action: ${analysis.quality_assessment?.recommended_action || 'N/A'}`);
        
        if (analysis.feedback?.positive_indicators?.length > 0) {
          console.log(`✅ Positive: ${analysis.feedback.positive_indicators.slice(0, 2).join(', ')}`);
        }
        
        if (analysis.feedback?.rejection_reasons?.length > 0) {
          console.log(`❌ Rejections: ${analysis.feedback.rejection_reasons.slice(0, 2).join(', ')}`);
        }
      }
      
      if (data.success) {
        console.log(`🎉 Registration successful: ${data.server?.name}`);
      } else if (data.error) {
        console.log(`⚠️  Registration failed: ${data.error}`);
      }
      
    } catch (error) {
      console.log(`💥 Request failed: ${error.message}`);
    }
    
    console.log('─'.repeat(60));
  }
  
  console.log('\n🏁 Testing complete\!');
  console.log('\n📚 For full API documentation, see:');
  console.log('   - OpenAPI spec: /openapi.yaml');
  console.log('   - Examples: /examples/github-auto-register-api.md');
}

// Run tests
testGitHubAPI().catch(console.error);
