#!/usr/bin/env node
#!/usr/bin/env node
// MCPL CLI - Enhanced MCP server management tool
// Provides Smithery parity and beyond with mcplookup.org integration
import { Command } from 'commander';
import chalk from 'chalk';
import { MCPLookupBridge } from '@mcplookup-org/mcp-server';
import { InstallCommand } from './commands/install.js';
import { UninstallCommand } from './commands/uninstall.js';
import { ListCommand } from './commands/list.js';
import { SearchCommand } from './commands/search.js';
import { InspectCommand } from './commands/inspect.js';
import { RunCommand } from './commands/run.js';
import { StatusCommand } from './commands/status.js';
import { LoginCommand } from './commands/login.js';
import { DevCommand } from './commands/dev.js';
import { PlaygroundCommand } from './commands/playground.js';
import { HealthCommand } from './commands/health.js';
import { ConfigCommand } from './commands/config.js';
import { UpdateCommand } from './commands/update.js';
import { BackupCommand } from './commands/backup.js';
const program = new Command();
// CLI Metadata
program
    .name('mcpl')
    .description('🌉 MCPL - Enhanced MCP server management tool powered by mcplookup.org')
    .version('1.0.0')
    .option('-v, --verbose', 'Enable verbose logging')
    .option('--api-key <key>', 'MCPLookup API key')
    .option('--no-color', 'Disable colored output');
// Global error handler
process.on('uncaughtException', (error) => {
    console.error(chalk.red('❌ Uncaught Exception:'), error.message);
    if (program.opts().verbose) {
        console.error(error.stack);
    }
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error(chalk.red('❌ Unhandled Rejection:'), reason);
    process.exit(1);
});
// Initialize bridge instance
let bridge;
function getBridge() {
    if (!bridge) {
        const opts = program.opts();
        bridge = new MCPLookupBridge(opts.apiKey);
    }
    return bridge;
}
// Enhanced Install Command (Smithery parity + improvements)
program
    .command('install')
    .alias('i')
    .description('🚀 Install MCP server (supports NPM packages, Docker images, and natural language)')
    .argument('<package>', 'Package name (@org/pkg), Docker image (org/img:tag), or description ("gmail server")')
    .option('-c, --client <client>', 'Target client (claude, cursor, etc.)', 'claude')
    .option('-m, --mode <mode>', 'Installation mode: direct (permanent) or bridge (dynamic)', 'direct')
    .option('--config <json>', 'Configuration as JSON string')
    .option('--env <vars>', 'Environment variables as JSON string')
    .option('--auto-start', 'Auto-start server after installation (bridge mode)', true)
    .option('--force', 'Force installation even if server exists')
    .option('--dry-run', 'Show what would be installed without actually installing')
    .option('--global', 'Run on host system like Smithery (bypasses Docker isolation)')
    .addHelpText('after', `
Examples:
  mcpl install @modelcontextprotocol/server-filesystem
  mcpl install @company/server --global  # Run on host like Smithery
  mcpl install company/server:latest
  mcpl install "The official Gmail server"
  mcpl install filesystem --mode bridge --auto-start`)
    .action(async (packageName, options) => {
    const installCmd = new InstallCommand(getBridge());
    await installCmd.execute(packageName, { ...options, globalInstall: options.global });
});
// Enhanced Uninstall Command
program
    .command('uninstall')
    .alias('remove')
    .alias('rm')
    .description('🗑️ Uninstall MCP server')
    .argument('<package>', 'Package name or server identifier')
    .option('-c, --client <client>', 'Target client', 'claude')
    .option('-m, --mode <mode>', 'Installation mode to remove from', 'auto')
    .option('--force', 'Force removal without confirmation')
    .option('--cleanup', 'Clean up associated data and containers')
    .action(async (packageName, options) => {
    const uninstallCmd = new UninstallCommand(getBridge());
    await uninstallCmd.execute(packageName, options);
});
// Enhanced List Command
program
    .command('list')
    .alias('ls')
    .description('📋 List servers, clients, or available packages')
    .argument('[type]', 'What to list: servers, clients, available, installed', 'servers')
    .option('-c, --client <client>', 'Filter by client', 'claude')
    .option('-m, --mode <mode>', 'Filter by mode: direct, bridge, all', 'all')
    .option('--format <format>', 'Output format: table, json, yaml', 'table')
    .option('--status', 'Include server status information')
    .action(async (type, options) => {
    const listCmd = new ListCommand(getBridge());
    await listCmd.execute(type, options);
});
// Enhanced Search Command (Beyond Smithery)
program
    .command('search')
    .alias('find')
    .description('🔍 Search for MCP servers in mcplookup.org registry')
    .argument('[query]', 'Search query (natural language supported)')
    .option('--category <cat>', 'Filter by category')
    .option('--transport <type>', 'Filter by transport: sse, stdio, http')
    .option('--verified', 'Only show verified servers')
    .option('--limit <n>', 'Maximum results to show', '10')
    .option('--smart', 'Use AI-powered smart search')
    .addHelpText('after', `
Examples:
  mcpl search "email automation tools"
  mcpl search filesystem --verified
  mcpl search --category productivity
  mcpl search "I need to manage files" --smart`)
    .action(async (query, options) => {
    const searchCmd = new SearchCommand(getBridge());
    await searchCmd.execute(query, options);
});
// Enhanced Inspect Command
program
    .command('inspect')
    .description('🔍 Inspect server details and test interactively')
    .argument('<server>', 'Server name or package identifier')
    .option('--tools', 'Show available tools')
    .option('--config', 'Show configuration')
    .option('--health', 'Check server health')
    .option('--interactive', 'Interactive tool testing')
    .action(async (server, options) => {
    const inspectCmd = new InspectCommand(getBridge());
    await inspectCmd.execute(server, options);
});
// Enhanced Run Command
program
    .command('run')
    .description('▶️ Run server temporarily or manage running servers')
    .argument('<server>', 'Server name to run')
    .option('--config <json>', 'Runtime configuration')
    .option('--env <vars>', 'Environment variables')
    .option('--port <port>', 'Port for HTTP servers')
    .option('--detach', 'Run in background')
    .action(async (server, options) => {
    const runCmd = new RunCommand(getBridge());
    await runCmd.execute(server, options);
});
// Enhanced Status Command (Beyond Smithery)
program
    .command('status')
    .alias('ps')
    .description('📊 Show server status and health information')
    .option('-c, --client <client>', 'Filter by client')
    .option('--watch', 'Watch status in real-time')
    .option('--format <format>', 'Output format: table, json', 'table')
    .action(async (options) => {
    const statusCmd = new StatusCommand(getBridge());
    await statusCmd.execute(options);
});
// Login Command (Smithery parity)
program
    .command('login')
    .description('🔑 Login and set MCPLookup API key')
    .option('--key <apikey>', 'Provide API key directly')
    .action(async (options) => {
    const loginCmd = new LoginCommand(getBridge());
    await loginCmd.execute(options);
});
// Development Command (Smithery parity + enhancements)
program
    .command('dev')
    .description('🛠️ Development tools for MCP servers')
    .argument('[entryFile]', 'Entry file for development server')
    .option('--port <port>', 'Development server port', '8181')
    .option('--no-open', 'Don\'t open browser automatically')
    .option('--hot-reload', 'Enable hot reload', true)
    .option('--tunnel', 'Create public tunnel')
    .action(async (entryFile, options) => {
    const devCmd = new DevCommand(getBridge());
    await devCmd.execute(entryFile, options);
});
// Playground Command (Smithery parity + enhancements)
program
    .command('playground')
    .alias('play')
    .description('🎮 Open MCP playground for testing')
    .option('--port <port>', 'Playground port', '3000')
    .option('--server <server>', 'Pre-load specific server')
    .option('--no-open', 'Don\'t open browser automatically')
    .action(async (options) => {
    const playgroundCmd = new PlaygroundCommand(getBridge());
    await playgroundCmd.execute(options);
});
// Health Command (Beyond Smithery)
program
    .command('health')
    .description('🏥 Health check for servers and system')
    .option('--server <server>', 'Check specific server')
    .option('--fix', 'Attempt to fix issues automatically')
    .option('--report', 'Generate detailed health report')
    .action(async (options) => {
    const healthCmd = new HealthCommand(getBridge());
    await healthCmd.execute(options);
});
// Config Command (Beyond Smithery)
program
    .command('config')
    .description('⚙️ Manage configuration and settings')
    .argument('[action]', 'Action: get, set, list, reset', 'list')
    .argument('[key]', 'Configuration key')
    .argument('[value]', 'Configuration value')
    .option('--global', 'Use global configuration')
    .action(async (action, key, value, options) => {
    const configCmd = new ConfigCommand(getBridge());
    await configCmd.execute(action, key, value, options);
});
// Update Command (Beyond Smithery)
program
    .command('update')
    .description('🔄 Update servers and CLI tool')
    .argument('[server]', 'Specific server to update (or "all")')
    .option('--check', 'Check for updates without installing')
    .option('--force', 'Force update even if up to date')
    .action(async (server, options) => {
    const updateCmd = new UpdateCommand(getBridge());
    await updateCmd.execute(server, options);
});
// Backup Command (Beyond Smithery)
program
    .command('backup')
    .description('💾 Backup and restore configurations')
    .argument('[action]', 'Action: create, restore, list', 'create')
    .argument('[file]', 'Backup file path')
    .option('--include-data', 'Include server data in backup')
    .action(async (action, file, options) => {
    const backupCmd = new BackupCommand(getBridge());
    await backupCmd.execute(action, file, options);
});
// Help improvements
program.on('--help', () => {
    console.log('');
    console.log(chalk.cyan('🌟 Enhanced Features Beyond Smithery:'));
    console.log('  • 🔍 Smart search with AI-powered discovery');
    console.log('  • 🐳 Docker container support');
    console.log('  • 🔄 Hybrid installation modes (bridge + direct)');
    console.log('  • 📊 Real-time health monitoring');
    console.log('  • 🔧 Auto-restart and maintenance');
    console.log('  • 💾 Configuration backup/restore');
    console.log('  • 🎯 Natural language server discovery');
    console.log('');
    console.log(chalk.yellow('📚 Examples:'));
    console.log('  mcpl search "email automation tools"');
    console.log('  mcpl install @modelcontextprotocol/server-filesystem');
    console.log('  mcpl install "The official Gmail server"');
    console.log('  mcpl install company/server:latest --mode bridge');
    console.log('  mcpl status --watch');
    console.log('  mcpl health --fix');
    console.log('');
    console.log(chalk.green('🚀 Get started: mcpl search filesystem'));
});
// Parse and execute
program.parse();
// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=index.js.map