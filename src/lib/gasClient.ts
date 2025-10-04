// URL do Google Apps Script Web App
const GAS_URL = "https://script.google.com/macros/s/AKfycbxkwPuO7uKHWpY5YrsQ5WSwn6upWDxaP1D9fzQZVkTytgZOBbZE_iLro9f2xKGb53fdZw/exec";

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

  // Primeira chamada POST - pode retornar 302
  const res = await fetch(GAS_URL, {
    method: "POST",
    body,
    redirect: "manual", // Não seguir automaticamente
  });

  // Se retornou 302, seguir o redirecionamento manualmente
  if (res.status === 302 || res.status === 301) {
    const redirectUrl = res.headers.get("location");
    if (redirectUrl) {
      const redirectRes = await fetch(redirectUrl, {
        method: "GET",
        redirect: "follow",
      });
      const text = await redirectRes.text();
      try { 
        return JSON.parse(text); 
      } catch { 
        return text as unknown as T; 
      }
    }
  }

  // Se não houve redirecionamento, processar resposta normal
  const text = await res.text();
  try { 
    return JSON.parse(text); 
  } catch { 
    return text as unknown as T; 
  }
}
