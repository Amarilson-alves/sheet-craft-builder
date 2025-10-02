import { ENV } from './env';

const GAS_BASE = ENV.VITE_API_BASE_URL;

/**
 * Wrapper para chamadas GET ao Google Apps Script
 * NÃO envia headers customizados para evitar preflight desnecessário
 */
export async function gasGet(params: Record<string, string>) {
  const url = new URL(GAS_BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  
  const res = await fetch(url.toString(), {
    method: 'GET',
    mode: 'cors',
    cache: 'no-store', // evita cache do preview
  });
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Resposta inválida do GAS: ' + text);
  }
}

/**
 * Wrapper para chamadas POST ao Google Apps Script
 * Envia Content-Type: application/json apenas em POST
 */
export async function gasPost(action: string, body: any) {
  const res = await fetch(GAS_BASE + '?action=' + encodeURIComponent(action), {
    method: 'POST',
    mode: 'cors',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...body }),
  });
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Resposta inválida do GAS: ' + text);
  }
}
