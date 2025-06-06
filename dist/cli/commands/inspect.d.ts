import { BaseCommand } from './base-command.js';
export interface InspectOptions {
    tools?: boolean;
    config?: boolean;
    health?: boolean;
    interactive?: boolean;
    verbose?: boolean;
}
export declare class InspectCommand extends BaseCommand {
    execute(server: string, options: InspectOptions): Promise<void>;
    private findServer;
    private displayServerInfo;
    private showConfiguration;
    private showTools;
    private showHealth;
    private interactiveMode;
    private showInteractiveHelp;
    private executeInteractiveCommand;
    private callTool;
}
//# sourceMappingURL=inspect.d.ts.map