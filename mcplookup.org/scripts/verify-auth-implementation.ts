#!/usr/bin/env tsx
// Auth.js v5 Implementation Verification Script
// Verifies that the Auth.js v5 implementation is properly set up

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

console.log('🔐 Auth.js v5 Implementation Verification\n')

// Check 1: Environment Variables
console.log('1. Checking environment variables...')
const envLocalPath = join(process.cwd(), '.env.local')
const envExamplePath = join(process.cwd(), '.env.example')

if (existsSync(envLocalPath)) {
  const envContent = readFileSync(envLocalPath, 'utf-8')
  if (envContent.includes('AUTH_SECRET')) {
    console.log('   ✅ AUTH_SECRET found in .env.local')
  } else {
    console.log('   ❌ AUTH_SECRET not found in .env.local')
  }
} else {
  console.log('   ⚠️  .env.local not found - run: npx auth secret')
}

if (existsSync(envExamplePath)) {
  const envExampleContent = readFileSync(envExamplePath, 'utf-8')
  if (envExampleContent.includes('AUTH_SECRET')) {
    console.log('   ✅ .env.example updated for Auth.js v5')
  } else {
    console.log('   ❌ .env.example not updated for Auth.js v5')
  }
}

// Check 2: Core Auth Files
console.log('\n2. Checking core auth files...')
const authFiles = [
  'auth.ts',
  'src/lib/auth/index.ts',
  'src/lib/auth/server.ts',
  'src/lib/auth/client.ts',
  'src/lib/auth/storage-adapter.ts',
  'src/app/api/auth/[...nextauth]/route.ts',
  'middleware.ts'
]

authFiles.forEach(file => {
  const filePath = join(process.cwd(), file)
  if (existsSync(filePath)) {
    console.log(`   ✅ ${file}`)
  } else {
    console.log(`   ❌ ${file} missing`)
  }
})

// Check 3: Package.json Dependencies
console.log('\n3. Checking dependencies...')
const packageJsonPath = join(process.cwd(), 'package.json')
if (existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
  
  if (dependencies['next-auth']) {
    const version = dependencies['next-auth']
    if (version.includes('5.0.0') || version.includes('beta')) {
      console.log(`   ✅ next-auth v5: ${version}`)
    } else {
      console.log(`   ⚠️  next-auth version: ${version} (should be v5)`)
    }
  } else {
    console.log('   ❌ next-auth not found in dependencies')
  }
}

// Check 4: Auth Configuration
console.log('\n4. Checking auth configuration...')
const authConfigPath = join(process.cwd(), 'auth.ts')
if (existsSync(authConfigPath)) {
  const authConfig = readFileSync(authConfigPath, 'utf-8')
  
  const checks = [
    { name: 'NextAuth import', pattern: /import NextAuth from "next-auth"/ },
    { name: 'GitHub provider', pattern: /GitHub/ },
    { name: 'Google provider', pattern: /Google/ },
    { name: 'Credentials provider', pattern: /Credentials/ },
    { name: 'Storage adapter', pattern: /adapter.*createStorageAdapter/ },
    { name: 'Session strategy', pattern: /strategy.*"database"/ },
    { name: 'Auth export', pattern: /export.*auth.*NextAuth/ }
  ]
  
  checks.forEach(check => {
    if (check.pattern.test(authConfig)) {
      console.log(`   ✅ ${check.name}`)
    } else {
      console.log(`   ❌ ${check.name} not found`)
    }
  })
}

// Check 5: SessionProvider Setup
console.log('\n5. Checking SessionProvider setup...')
const clientProvidersPath = join(process.cwd(), 'src/components/providers/client-providers.tsx')
if (existsSync(clientProvidersPath)) {
  const clientProviders = readFileSync(clientProvidersPath, 'utf-8')
  if (clientProviders.includes('SessionProvider')) {
    console.log('   ✅ SessionProvider configured')
  } else {
    console.log('   ❌ SessionProvider not found')
  }
}

// Check 6: Auth Components
console.log('\n6. Checking auth components...')
const authComponents = [
  'src/components/auth/signin-button.tsx',
  'src/app/auth/signin/page.tsx',
  'src/app/auth/signout/page.tsx'
]

authComponents.forEach(component => {
  const componentPath = join(process.cwd(), component)
  if (existsSync(componentPath)) {
    console.log(`   ✅ ${component}`)
  } else {
    console.log(`   ❌ ${component} missing`)
  }
})

// Check 7: Middleware Configuration
console.log('\n7. Checking middleware configuration...')
const middlewarePath = join(process.cwd(), 'middleware.ts')
if (existsSync(middlewarePath)) {
  const middleware = readFileSync(middlewarePath, 'utf-8')
  if (middleware.includes('auth as middleware')) {
    console.log('   ✅ Auth middleware configured')
  } else {
    console.log('   ❌ Auth middleware not configured')
  }
}

// Summary
console.log('\n📋 Summary:')
console.log('   Auth.js v5 implementation verification complete!')
console.log('   If any items show ❌, please review the implementation.')
console.log('\n🚀 Next steps:')
console.log('   1. Set up OAuth providers (GitHub, Google) in their respective consoles')
console.log('   2. Add OAuth credentials to .env.local')
console.log('   3. Test authentication in development: npm run dev')
console.log('   4. Visit /auth/signin to test sign-in flow')
console.log('\n📚 Documentation:')
console.log('   - Auth.js v5: https://authjs.dev')
console.log('   - GitHub OAuth: https://github.com/settings/developers')
console.log('   - Google OAuth: https://console.cloud.google.com/apis/credentials')
