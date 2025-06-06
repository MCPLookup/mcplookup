import { BaseCommand } from './base-command.js';
export interface SearchOptions {
    category?: string;
    transport?: string;
    verified?: boolean;
    limit: string;
    smart?: boolean;
    verbose?: boolean;
}
export declare class SearchCommand extends BaseCommand {
    execute(query: string | undefined, options: SearchOptions): Promise<void>;
    private performSmartSearch;
    private performRegularSearch;
    private displaySmartResults;
    private displayRegularResults;
    private showInstallInstructions;
}
//# sourceMappingURL=search.d.ts.map