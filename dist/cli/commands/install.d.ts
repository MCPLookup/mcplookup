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
export interface ResolvedPackage {
    packageName: string;
    displayName: string;
    description?: string;
    type: 'npm' | 'docker';
    source: 'direct' | 'smart_search' | 'registry_search';
    verified?: boolean;
}
export declare class InstallCommand extends BaseCommand {
    execute(packageName: string, options: InstallOptions): Promise<void>;
    /**
     * Resolve package name to actual installable package
     * Handles: NPM packages, Docker images, natural language queries
     */
    private resolvePackage;
    private isNpmPackage;
    private isDockerImage;
    private searchForPackage;
    private performDryRun;
    private installBridgeMode;
    private installDirectMode;
    private performGlobalNpmInstall;
    private generateServerName;
    private getRuntimeInfo;
    private showPostInstallInstructions;
}
//# sourceMappingURL=install.d.ts.map