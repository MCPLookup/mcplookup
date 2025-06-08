import redis from 'redis';

(async () => {
  const client = redis.createClient();
  await client.connect();
  
  console.log('🐍 Checking Python deployment servers...');
  
  // Check Python deployment set
  const pythonServers = await client.sMembers('servers_enhanced_filtered:deployment:python');
  console.log(`Found ${pythonServers.length} Python deployment servers`);
  
  if (pythonServers.length > 0) {
    console.log('\n🐍 Sample Python servers:');
    for (let i = 0; i < Math.min(5, pythonServers.length); i++) {
      const serverKey = `servers_enhanced_filtered:${pythonServers[i]}`;
      const data = await client.hGetAll(serverKey);
      
      console.log(`\n${i+1}. ${pythonServers[i]}`);
      console.log(`   Quality: ${data['quality.score'] || 'N/A'}`);
      console.log(`   Name: ${data.name || 'N/A'}`);
      console.log(`   Description: ${data.description ? data.description.substring(0, 80) + '...' : 'N/A'}`);
      
      // Check for Python-specific installation data
      if (data['structured.installation.methods']) {
        try {
          const methods = JSON.parse(data['structured.installation.methods']);
          console.log(`   Installation methods:`, Object.keys(methods));
        } catch (e) {
          console.log(`   Installation methods: ${data['structured.installation.methods'].substring(0, 50)}...`);
        }
      }
      
      // Check package info
      if (data.packages) {
        try {
          const packages = JSON.parse(data.packages);
          console.log(`   Packages:`, packages.map(p => `${p.registry_name}:${p.name}`));
        } catch (e) {
          console.log(`   Packages: ${data.packages.substring(0, 50)}...`);
        }
      }
    }
  }
  
  // Also check npm and docker for comparison
  const npmServers = await client.sMembers('servers_enhanced_filtered:deployment:npm');
  const dockerServers = await client.sMembers('servers_enhanced_filtered:deployment:docker');
  
  console.log(`\n📊 Deployment comparison:`);
  console.log(`🐍 Python: ${pythonServers.length} servers`);
  console.log(`📦 NPM: ${npmServers.length} servers`);
  console.log(`🐳 Docker: ${dockerServers.length} servers`);
  
  await client.quit();
})().catch(console.error);
