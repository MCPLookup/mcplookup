import { BaseCommand } from './base-command.js';
export interface RunOptions {
    config?: string;
    env?: string;
    port?: string;
    detach?: boolean;
    verbose?: boolean;
}
export declare class RunCommand extends BaseCommand {
    execute(server: string, options: RunOptions): Promise<void>;
    private findServer;
    private runBridgeServer;
}
//# sourceMappingURL=run.d.ts.map