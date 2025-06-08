import { BaseCommand } from './base-command.js';
export interface LoginOptions {
    key?: string;
    verbose?: boolean;
}
export declare class LoginCommand extends BaseCommand {
    private configDir;
    private configFile;
    execute(options: LoginOptions): Promise<void>;
    private promptForApiKey;
    private validateApiKey;
    private saveApiKey;
}
//# sourceMappingURL=login.d.ts.map