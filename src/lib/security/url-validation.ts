import { z } from 'zod';

// URL validation with security considerations
export const SecureURLSchema = z.string()
  .url('Must be a valid URL')
  .refine((url) => {
    try {
      const parsed = new URL(url);
      
      // Must use HTTPS for security
      if (parsed.protocol !== 'https:') {
        return false;
      }
      
      // Block localhost and private IP ranges for security
      const hostname = parsed.hostname.toLowerCase();
      
      // Block localhost variations
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
        return false;
      }
      
      // Block private IP ranges (basic check)
      if (hostname.startsWith('192.168.') || 
          hostname.startsWith('10.') || 
          hostname.startsWith('172.')) {
        return false;
      }
      
      // Block internal domains
      if (hostname.endsWith('.local') || 
          hostname.endsWith('.internal') || 
          hostname.endsWith('.lan')) {
        return false;
      }
      
      // Must have a valid domain
      if (!hostname.includes('.')) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }, 'URL must be HTTPS and publicly accessible');

// Domain validation with security considerations
export const SecureDomainSchema = z.string()
  .min(1, 'Domain cannot be empty')
  .max(253, 'Domain too long')
  .refine((domain) => {
    // Basic domain format validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!domainRegex.test(domain)) {
      return false;
    }
    
    const lowerDomain = domain.toLowerCase();
    
    // Block localhost and private domains
    if (lowerDomain === 'localhost' || 
        lowerDomain.endsWith('.local') || 
        lowerDomain.endsWith('.internal') || 
        lowerDomain.endsWith('.lan')) {
      return false;
    }
    
    // Must have at least one dot (no single-word domains)
    if (!domain.includes('.')) {
      return false;
    }
    
    // Block IP addresses
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (ipRegex.test(domain)) {
      return false;
    }
    
    return true;
  }, 'Domain must be a valid public domain name');

// Email validation with security considerations
export const SecureEmailSchema = z.string()
  .email('Must be a valid email address')
  .max(254, 'Email address too long')
  .refine((email) => {
    const [localPart, domain] = email.split('@');
    
    // Validate local part length
    if (localPart.length > 64) {
      return false;
    }
    
    // Validate domain part using SecureDomainSchema
    try {
      SecureDomainSchema.parse(domain);
      return true;
    } catch {
      return false;
    }
  }, 'Email domain must be a valid public domain');

// Capability name validation
export const CapabilityNameSchema = z.string()
  .min(1, 'Capability name cannot be empty')
  .max(100, 'Capability name too long')
  .regex(/^[a-z0-9_]+$/, 'Capability name must contain only lowercase letters, numbers, and underscores');

// Intent validation (natural language)
export const IntentSchema = z.string()
  .min(3, 'Intent must be at least 3 characters')
  .max(500, 'Intent too long')
  .refine((intent) => {
    // Basic sanitization - no HTML tags or script content
    const htmlRegex = /<[^>]*>/;
    const scriptRegex = /(javascript:|data:|vbscript:)/i;
    
    return !htmlRegex.test(intent) && !scriptRegex.test(intent);
  }, 'Intent contains invalid characters');

// Keywords validation
export const KeywordsSchema = z.array(z.string()
  .min(1, 'Keyword cannot be empty')
  .max(50, 'Keyword too long')
  .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Keywords can only contain letters, numbers, spaces, hyphens, and underscores')
).max(20, 'Too many keywords');

// Category validation
export const CategorySchema = z.enum([
  'communication',
  'productivity', 
  'data',
  'development',
  'content',
  'integration',
  'analytics',
  'security',
  'finance',
  'ecommerce',
  'social',
  'other'
]);

// Transport validation
export const TransportSchema = z.enum(['http', 'websocket', 'sse']);

// Auth type validation
export const AuthTypeSchema = z.enum(['none', 'api_key', 'oauth2', 'basic', 'bearer']);

// Sort options validation
export const SortBySchema = z.enum(['relevance', 'popularity', 'recent', 'name', 'uptime']);

// Pagination validation
export const PaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0)
});

// Health metrics validation
export const HealthMetricsSchema = z.object({
  min_uptime: z.number().min(0).max(100).optional(),
  max_response_time: z.number().min(0).max(30000).optional() // Max 30 seconds
});

// Utility function to sanitize user input
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, ''); // Remove vbscript: protocol
}

// Utility function to validate and sanitize domain
export function validateAndSanitizeDomain(domain: string): string | null {
  try {
    const sanitized = sanitizeString(domain.toLowerCase());
    SecureDomainSchema.parse(sanitized);
    return sanitized;
  } catch {
    return null;
  }
}

// Utility function to validate and sanitize URL
export function validateAndSanitizeURL(url: string): string | null {
  try {
    const sanitized = sanitizeString(url);
    SecureURLSchema.parse(sanitized);
    return sanitized;
  } catch {
    return null;
  }
}
