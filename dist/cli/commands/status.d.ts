import { BaseCommand } from './base-command.js';
export interface StatusOptions {
    client?: string;
    watch?: boolean;
    format: 'table' | 'json';
    verbose?: boolean;
}
export declare class StatusCommand extends BaseCommand {
    private watchMode;
    execute(options: StatusOptions): Promise<void>;
    private showStatus;
    private watchStatus;
    private collectStatusData;
    private displayStatus;
    private getStatusIcon;
    private getHealthIcon;
}
//# sourceMappingURL=status.d.ts.map