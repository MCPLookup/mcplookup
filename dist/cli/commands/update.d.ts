import { BaseCommand } from './base-command.js';
export interface UpdateOptions {
    check?: boolean;
    force?: boolean;
    verbose?: boolean;
}
export declare class UpdateCommand extends BaseCommand {
    execute(server?: string, options?: UpdateOptions): Promise<void>;
    private updateServer;
    private updateAll;
}
//# sourceMappingURL=update.d.ts.map