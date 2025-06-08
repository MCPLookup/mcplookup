import redis from 'redis';

(async () => {
  const client = redis.createClient();
  await client.connect();
  
  console.log('🔍 Looking for Python package information in installation methods...');
  
  const keys = await client.keys('servers_enhanced_filtered:*');
  const serverKeys = keys.filter(k => 
    !k.includes('category:') && 
    !k.includes('quality:') && 
    !k.includes('deployment:') && 
    !k.includes('all') && 
    k.split(':').length === 2
  ).slice(0, 50); // Check more servers
  
  let pythonCount = 0;
  let installationMethodsCount = 0;
  let examplePythonServers = [];
  
  for (const key of serverKeys) {
    const data = await client.hGetAll(key);
    
    // Check structured.installation.methods
    if (data['structured.installation.methods']) {
      installationMethodsCount++;
      try {
        const methods = JSON.parse(data['structured.installation.methods']);
        
        // Check if it contains Python/pip information
        const methodsStr = JSON.stringify(methods).toLowerCase();
        if (methodsStr.includes('python') || methodsStr.includes('pip') || methodsStr.includes('pypi')) {
          pythonCount++;
          examplePythonServers.push({
            server: key.split(':')[1],
            methods: methods
          });
          
          if (examplePythonServers.length <= 3) {
            console.log(`\n🐍 Python server found: ${key.split(':')[1]}`);
            console.log('Installation methods:', JSON.stringify(methods, null, 2));
          }
        }
      } catch (e) {
        // Not valid JSON, might be a string
        const methodsStr = data['structured.installation.methods'].toLowerCase();
        if (methodsStr.includes('python') || methodsStr.includes('pip') || methodsStr.includes('pypi')) {
          pythonCount++;
          if (examplePythonServers.length <= 3) {
            console.log(`\n🐍 Python server found: ${key.split(':')[1]}`);
            console.log('Installation methods (string):', data['structured.installation.methods']);
          }
        }
      }
    }
  }
  
  console.log(`\n📊 Results from ${serverKeys.length} servers checked:`);
  console.log(`✅ Servers with installation methods: ${installationMethodsCount}`);
  console.log(`🐍 Servers with Python/pip support: ${pythonCount}`);
  console.log(`📈 Python support rate: ${((pythonCount / installationMethodsCount) * 100).toFixed(1)}%`);
  
  await client.quit();
})().catch(console.error);
