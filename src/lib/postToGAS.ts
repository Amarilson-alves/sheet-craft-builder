/**
 * Helper para fazer POST ao Google Apps Script sem preflight CORS
 * Usa URLSearchParams (application/x-www-form-urlencoded) sem headers customizados
 */
export async function postToGAS(baseUrl: string, action: string, payload?: any) {
  const params = new URLSearchParams();
  params.set("action", action);
  if (payload !== undefined) {
    params.set("payload", typeof payload === "string" ? payload : JSON.stringify(payload));
  }

  const res = await fetch(baseUrl, {
    method: "POST",
    // IMPORTANTE: sem headers custom para evitar preflight
    body: params,          // application/x-www-form-urlencoded (automático)
    redirect: "follow",    // GAS faz 302 -> siga
  });

  const text = await res.text();
  try { 
    return JSON.parse(text); 
  } catch { 
    return { raw: text }; 
  }
}
