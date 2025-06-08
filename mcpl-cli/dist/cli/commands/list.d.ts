import { BaseCommand } from './base-command.js';
export interface ListOptions {
    client: string;
    mode: 'direct' | 'bridge' | 'all';
    format: 'table' | 'json' | 'yaml';
    status?: boolean;
    verbose?: boolean;
}
export declare class ListCommand extends BaseCommand {
    execute(type: string | undefined, options: ListOptions): Promise<void>;
    private listServers;
    private addStatusInformation;
    private displayServers;
    private getStatusDisplay;
    private listClients;
    private getClaudeConfigPath;
    private listAvailable;
    private showManagementTips;
}
//# sourceMappingURL=list.d.ts.map