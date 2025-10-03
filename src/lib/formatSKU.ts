/**
 * Formata o SKU no padrão xxxx-xxxx-x
 * Remove caracteres não numéricos e aplica a máscara automaticamente
 */
export function formatSKU(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 9 dígitos
  const limited = numbers.slice(0, 9);
  
  // Aplica a máscara xxxx-xxxx-x
  if (limited.length <= 4) {
    return limited;
  } else if (limited.length <= 8) {
    return `${limited.slice(0, 4)}-${limited.slice(4)}`;
  } else {
    return `${limited.slice(0, 4)}-${limited.slice(4, 8)}-${limited.slice(8)}`;
  }
}

/**
 * Remove a formatação do SKU, retornando apenas os números
 */
export function unformatSKU(value: string): string {
  return value.replace(/\D/g, '');
}
