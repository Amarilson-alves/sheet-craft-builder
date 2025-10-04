// URL do Google Apps Script Web App
const GAS_URL = "https://script.google.com/macros/s/AKfycbxFrSfmg16RM7ZGrpQLrxq13nWS25Yx93FkpW8y0daglCZqv3XgcSMGyWGTp8yJHje8g/exec";

/**
 * Wrapper para chamadas GET ao Google Apps Script
 */
export async function gasGet<T = any>(params: Record<string, string>): Promise<T> {
  const url = new URL(GAS_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  
  const res = await fetch(url.toString(), {
    method: 'GET',
    cache: 'no-store',
    redirect: 'follow',
  });
  
  const text = await res.text();
  try { 
    return JSON.parse(text); 
  } catch { 
    return text as unknown as T; 
  }
}

/**
 * ✅ POST sem preflight CORS (sem headers custom)
 * Usa URLSearchParams (application/x-www-form-urlencoded) para evitar preflight
 */
export async function gasPost<T = any>(action: string, payload?: any): Promise<T> {
  const body = new URLSearchParams();
  body.set("action", action);
  if (payload !== undefined) {
    body.set("payload", typeof payload === "string" ? payload : JSON.stringify(payload));
  }

  const res = await fetch(GAS_URL, {
    method: "POST",
    // ⚠️ IMPORTANTE: sem headers custom para evitar preflight
    body,
    redirect: "follow", // GAS retorna 302 -> googleusercontent
  });

  const text = await res.text();
  try { 
    return JSON.parse(text); 
  } catch { 
    return text as unknown as T; 
  }
}
