import { BaseCommand } from './base-command.js';
export interface HealthOptions {
    server?: string;
    fix?: boolean;
    report?: boolean;
    verbose?: boolean;
}
export declare class HealthCommand extends BaseCommand {
    execute(options: HealthOptions): Promise<void>;
    private checkServerHealth;
    private checkSystemHealth;
    private fixServerIssues;
    private autoFix;
    private generateHealthReport;
}
//# sourceMappingURL=health.d.ts.map