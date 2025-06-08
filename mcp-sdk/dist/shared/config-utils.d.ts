/**
 * Safely read JSON file with error handling
 */
export declare function readJsonFile<T = any>(filePath: string, defaultValue?: T): Promise<T>;
/**
 * Safely write JSON file with directory creation
 */
export declare function writeJsonFile(filePath: string, data: any, pretty?: boolean): Promise<void>;
/**
 * Check if file exists
 */
export declare function fileExists(filePath: string): Promise<boolean>;
/**
 * Safely update JSON file with backup
 */
export declare function updateJsonFile<T>(filePath: string, updater: (current: T) => T, defaultValue: T): Promise<void>;
//# sourceMappingURL=config-utils.d.ts.map