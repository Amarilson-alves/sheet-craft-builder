// Chamada direta ao Google Apps Script
const GAS_URL = 'https://script.google.com/macros/s/AKfycby2lliD-dWHYjt3CgxPUI7Iy5SsziQ5Azzd_nAQoeF8zFVdMmU7jG_Zej0l8aw6be0S/exec';

/**
 * Wrapper para chamadas GET ao Google Apps Script
 */
export async function gasGet(params: Record<string, string>) {
  const url = new URL(GAS_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  
  const res = await fetch(url.toString(), {
    method: 'GET',
    cache: 'no-store',
  });
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  
  return await res.json();
}

/**
 * Wrapper para chamadas POST ao Google Apps Script
 */
export async function gasPost(action: string, body: any) {
  const url = new URL(GAS_URL);
  url.searchParams.set('action', action);
  
  const res = await fetch(url.toString(), {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...body }),
  });
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  
  return await res.json();
}
