import { BaseCommand } from './base-command.js';
export interface PlaygroundOptions {
    port: string;
    server?: string;
    open: boolean;
    verbose?: boolean;
}
export declare class PlaygroundCommand extends BaseCommand {
    execute(options: PlaygroundOptions): Promise<void>;
}
//# sourceMappingURL=playground.d.ts.map