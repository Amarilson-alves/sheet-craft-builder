/**
 * Rate Limiter para prevenir abuso de APIs
 */

export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private timeWindow: number;

  /**
   * @param maxAttempts Número máximo de tentativas permitidas
   * @param timeWindow Janela de tempo em milissegundos
   */
  constructor(maxAttempts: number = 10, timeWindow: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.timeWindow = timeWindow;
  }

  /**
   * Verifica se uma ação é permitida para um identificador
   * @param identifier Identificador único (ex: IP, user ID, action name)
   * @returns true se permitido, false se excedeu o limite
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Remove tentativas antigas (fora da janela de tempo)
    const recentAttempts = userAttempts.filter(time => now - time < this.timeWindow);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Adiciona nova tentativa
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    
    return true;
  }

  /**
   * Reseta o contador para um identificador
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Limpa tentativas antigas de todos os identificadores
   */
  cleanup(): void {
    const now = Date.now();
    this.attempts.forEach((attempts, key) => {
      const recent = attempts.filter(time => now - time < this.timeWindow);
      if (recent.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, recent);
      }
    });
  }
}

// Instância global para salvar obras
export const saveObraLimiter = new RateLimiter(5, 60000); // 5 tentativas por minuto

// Instância global para consultas
export const queryLimiter = new RateLimiter(20, 60000); // 20 consultas por minuto

// Cleanup periódico a cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    saveObraLimiter.cleanup();
    queryLimiter.cleanup();
  }, 300000);
}
