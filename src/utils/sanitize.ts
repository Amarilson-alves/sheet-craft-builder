/**
 * Sanitização de inputs para prevenir XSS e injection attacks
 */

/**
 * Remove caracteres perigosos e HTML de strings de input
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove tags HTML
  const div = document.createElement('div');
  div.textContent = input;
  const withoutHtml = div.innerHTML;
  
  // Remove caracteres potencialmente perigosos
  return withoutHtml
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 500); // Limite de tamanho
}

/**
 * Sanitiza um objeto inteiro, aplicando sanitizeInput em todas as strings
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'number') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'object' ? sanitizeObject(item) : 
        typeof item === 'string' ? sanitizeInput(item) : 
        item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized as T;
}

/**
 * Valida e sanitiza número, retorna 0 se inválido
 */
export function sanitizeNumber(input: any): number {
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.max(0, Math.floor(num)); // Apenas positivos inteiros
}

/**
 * Valida SKU - apenas alfanuméricos, hífens e underscores
 */
export function validateSKU(sku: string): boolean {
  if (!sku || typeof sku !== 'string') return false;
  return /^[A-Z0-9_-]{1,50}$/i.test(sku);
}

/**
 * Valida email básico
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
