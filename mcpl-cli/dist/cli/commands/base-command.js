// Base command class for MCPL CLI commands
import chalk from 'chalk';
export class BaseCommand {
    bridge;
    verbose = false;
    constructor(bridge) {
        this.bridge = bridge;
    }
    /**
     * Log info message
     */
    info(message) {
        console.log(chalk.blue('ℹ️'), message);
    }
    /**
     * Log success message
     */
    success(message) {
        console.log(chalk.green('✅'), message);
    }
    /**
     * Log warning message
     */
    warn(message) {
        console.log(chalk.yellow('⚠️'), message);
    }
    /**
     * Log error message
     */
    error(message) {
        console.log(chalk.red('❌'), message);
    }
    /**
     * Log verbose message
     */
    debug(message) {
        if (this.verbose) {
            console.log(chalk.gray('🔍'), chalk.gray(message));
        }
    }
    /**
     * Handle errors gracefully
     */
    handleError(error, context) {
        const message = error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error);
        this.error(`${context}: ${message}`);
        if (this.verbose && error instanceof Error && error.stack) {
            console.error(chalk.gray(error.stack));
        }
        process.exit(1);
    }
    /**
     * Parse JSON safely
     */
    parseJSON(jsonString, defaultValue = {}) {
        try {
            return JSON.parse(jsonString);
        }
        catch (error) {
            this.warn(`Invalid JSON provided, using default: ${error instanceof Error ? error.message : String(error)}`);
            return defaultValue;
        }
    }
    /**
     * Format output based on format option
     */
    formatOutput(data, format = 'table') {
        switch (format.toLowerCase()) {
            case 'json':
                console.log(JSON.stringify(data, null, 2));
                break;
            case 'yaml':
                // Simple YAML-like output
                console.log(this.toYaml(data));
                break;
            case 'table':
            default:
                this.printTable(data);
                break;
        }
    }
    /**
     * Simple YAML-like formatter
     */
    toYaml(obj, indent = 0) {
        const spaces = '  '.repeat(indent);
        let result = '';
        if (Array.isArray(obj)) {
            obj.forEach(item => {
                result += `${spaces}- ${this.toYaml(item, indent + 1)}\n`;
            });
        }
        else if (typeof obj === 'object' && obj !== null) {
            Object.entries(obj).forEach(([key, value]) => {
                if (typeof value === 'object') {
                    result += `${spaces}${key}:\n${this.toYaml(value, indent + 1)}`;
                }
                else {
                    result += `${spaces}${key}: ${value}\n`;
                }
            });
        }
        else {
            return String(obj);
        }
        return result;
    }
    /**
     * Print data as a table
     */
    printTable(data) {
        if (!data) {
            this.info('No data to display');
            return;
        }
        if (Array.isArray(data)) {
            if (data.length === 0) {
                this.info('No items found');
                return;
            }
            // Get all unique keys
            const keys = [...new Set(data.flatMap(item => Object.keys(item)))];
            // Print header
            console.log(chalk.bold(keys.join('\t')));
            console.log('-'.repeat(keys.join('\t').length));
            // Print rows
            data.forEach(item => {
                const row = keys.map(key => String(item[key] || '')).join('\t');
                console.log(row);
            });
        }
        else {
            // Single object
            Object.entries(data).forEach(([key, value]) => {
                console.log(`${chalk.bold(key)}: ${value}`);
            });
        }
    }
    /**
     * Confirm action with user
     */
    async confirm(message, defaultValue = false) {
        const { default: inquirer } = await import('inquirer');
        const { confirmed } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirmed',
                message,
                default: defaultValue
            }
        ]);
        return confirmed;
    }
    /**
     * Get user input
     */
    async prompt(message, defaultValue) {
        const { default: inquirer } = await import('inquirer');
        const { answer } = await inquirer.prompt([
            {
                type: 'input',
                name: 'answer',
                message,
                default: defaultValue
            }
        ]);
        return answer;
    }
    /**
     * Select from options
     */
    async select(message, choices) {
        const { default: inquirer } = await import('inquirer');
        const { selected } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selected',
                message,
                choices
            }
        ]);
        return selected;
    }
    /**
     * Show spinner while executing async operation
     */
    async withSpinner(message, operation) {
        const { default: ora } = await import('ora');
        const spinner = ora(message).start();
        try {
            const result = await operation();
            spinner.succeed();
            return result;
        }
        catch (error) {
            spinner.fail();
            throw error;
        }
    }
    /**
     * Set verbose mode
     */
    setVerbose(verbose) {
        this.verbose = verbose;
    }
}
//# sourceMappingURL=base-command.js.map