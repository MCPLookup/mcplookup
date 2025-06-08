import { BaseCommand } from './base-command.js';
export interface InstallOptions {
    client: string;
    mode: 'direct' | 'bridge';
    config?: string;
    env?: string;
    autoStart: boolean;
    force: boolean;
    dryRun: boolean;
    globalInstall?: boolean;
    verbose?: boolean;
}
export declare class InstallCommand extends BaseCommand {
    private resolver;
    constructor(bridge: any);
    execute(packageName: string, options: InstallOptions): Promise<void>;
    /**
     * Resolve package name using SDK utilities
     */
    private resolvePackage;
    private performDryRun;
    private installBridgeMode;
    private installDirectMode;
    private performGlobalNpmInstall;
    private generateServerName;
    private getRuntimeInfo;
    private showPostInstallInstructions;
}
//# sourceMappingURL=install.d.ts.map