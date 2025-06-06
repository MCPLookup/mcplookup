// Shared validation utilities to eliminate duplication

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
export function createValidationResult(errors: string[] = []): ValidationResult {
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate installation options
 */
export function validateInstallOptions(options: any): ValidationResult {
  const errors: string[] = [];
  
  if (!options || typeof options !== 'object') {
    errors.push('Installation options must be an object');
    return createValidationResult(errors);
  }
  
  // Validate name
  if (!options.name || typeof options.name !== 'string') {
    errors.push('Server name is required and must be a string');
  } else if (!/^[a-zA-Z0-9-_]+$/.test(options.name)) {
    errors.push('Server name can only contain letters, numbers, hyphens, and underscores');
  }
  
  // Validate type
  if (options.type && !['npm', 'docker'].includes(options.type)) {
    errors.push('Installation type must be "npm" or "docker"');
  }
  
  // Validate mode
  if (options.mode && !['bridge', 'direct'].includes(options.mode)) {
    errors.push('Installation mode must be "bridge" or "direct"');
  }
  
  // Validate command
  if (!options.command || typeof options.command !== 'string') {
    errors.push('Command is required and must be a string');
  }
  
  return createValidationResult(errors);
}
