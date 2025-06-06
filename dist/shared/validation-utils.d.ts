/**
 * Validation result interface
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
/**
 * Create validation result
 */
export declare function createValidationResult(errors?: string[]): ValidationResult;
/**
 * Validate installation options
 */
export declare function validateInstallOptions(options: any): ValidationResult;
//# sourceMappingURL=validation-utils.d.ts.map