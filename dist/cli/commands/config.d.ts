import { BaseCommand } from './base-command.js';
export interface ConfigOptions {
    global?: boolean;
    verbose?: boolean;
}
export declare class ConfigCommand extends BaseCommand {
    execute(action?: string, key?: string, value?: string, options?: ConfigOptions): Promise<void>;
    private listConfig;
    private getConfig;
    private setConfig;
    private resetConfig;
}
//# sourceMappingURL=config.d.ts.map