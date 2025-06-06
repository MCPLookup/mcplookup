import { BaseCommand } from './base-command.js';
export interface BackupOptions {
    includeData?: boolean;
    verbose?: boolean;
}
export declare class BackupCommand extends BaseCommand {
    execute(action?: string, file?: string, options?: BackupOptions): Promise<void>;
    private createBackup;
    private restoreBackup;
    private listBackups;
}
//# sourceMappingURL=backup.d.ts.map