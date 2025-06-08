import { BaseCommand } from './base-command.js';
export interface DevOptions {
    port: string;
    open: boolean;
    hotReload: boolean;
    tunnel?: boolean;
    verbose?: boolean;
}
export declare class DevCommand extends BaseCommand {
    execute(entryFile: string | undefined, options: DevOptions): Promise<void>;
}
//# sourceMappingURL=dev.d.ts.map