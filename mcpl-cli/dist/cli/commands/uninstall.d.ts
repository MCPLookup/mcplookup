import { BaseCommand } from './base-command.js';
export interface UninstallOptions {
    client: string;
    mode: 'direct' | 'bridge' | 'auto';
    force: boolean;
    cleanup: boolean;
    verbose?: boolean;
}
export declare class UninstallCommand extends BaseCommand {
    execute(packageName: string, options: UninstallOptions): Promise<void>;
    private findServers;
    private confirmRemoval;
    private removeServer;
    private removeBridgeServer;
    private removeDirectServer;
    private performCleanup;
    private showPostUninstallInfo;
}
//# sourceMappingURL=uninstall.d.ts.map