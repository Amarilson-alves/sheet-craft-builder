/**
 * Validadores de formulário reutilizáveis
 */

export type ValidationRule = (value: any) => string | true;

export const validators = {
  required: (value: any): string | true => {
    if (value === null || value === undefined || value === '') {
      return 'Campo obrigatório';
    }
    if (typeof value === 'string' && value.trim() === '') {
      return 'Campo obrigatório';
    }
    return true;
  },

  email: (value: string): string | true => {
    if (!value) return true; // Validação de required é separada
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Email inválido';
  },

  minLength: (min: number) => (value: string): string | true => {
    if (!value) return true;
    return value.length >= min || `Mínimo ${min} caracteres`;
  },

  maxLength: (max: number) => (value: string): string | true => {
    if (!value) return true;
    return value.length <= max || `Máximo ${max} caracteres`;
  },

  number: (value: any): string | true => {
    if (!value && value !== 0) return true;
    return !isNaN(parseFloat(value)) || 'Deve ser um número';
  },

  positiveNumber: (value: any): string | true => {
    if (!value && value !== 0) return true;
    const num = parseFloat(value);
    return (!isNaN(num) && num > 0) || 'Deve ser um número positivo';
  },

  integer: (value: any): string | true => {
    if (!value && value !== 0) return true;
    const num = parseFloat(value);
    return (!isNaN(num) && Number.isInteger(num)) || 'Deve ser um número inteiro';
  },

  sku: (value: string): string | true => {
    if (!value) return true;
    return /^[A-Z0-9_-]{1,50}$/i.test(value) || 'SKU inválido (apenas letras, números, - e _)';
  },

  alphanumeric: (value: string): string | true => {
    if (!value) return true;
    return /^[a-zA-Z0-9\s]+$/.test(value) || 'Apenas letras e números são permitidos';
  },
};

/**
 * Aplica múltiplos validadores em sequência
 */
export function validateField(value: any, rules: ValidationRule[]): string | true {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) {
      return result;
    }
  }
  return true;
}

/**
 * Valida um objeto inteiro usando um schema de validação
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  schema: Record<keyof T, ValidationRule[]>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } {
  const errors: Partial<Record<keyof T, string>> = {};
  let isValid = true;

  for (const key in schema) {
    const rules = schema[key];
    const value = data[key];
    const result = validateField(value, rules);
    
    if (result !== true) {
      errors[key] = result;
      isValid = false;
    }
  }

  return { isValid, errors };
}
