const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const GAS_URL = 'https://script.google.com/macros/s/AKfycby2lliD-dWHYjt3CgxPUI7Iy5SsziQ5Azzd_nAQoeF8zFVdMmU7jG_Zej0l8aw6be0S/exec';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const gasUrl = new URL(GAS_URL);
    
    // Copy query params to GAS URL
    url.searchParams.forEach((value, key) => {
      gasUrl.searchParams.set(key, value);
    });

    const init: RequestInit = {
      method: req.method,
      headers: {},
    };

    // For POST requests, forward the body
    if (req.method === 'POST') {
      const body = await req.json();
      init.headers = { 'Content-Type': 'application/json' };
      init.body = JSON.stringify(body);
    }

    console.log(`Proxying ${req.method} to GAS:`, gasUrl.toString());

    const response = await fetch(gasUrl.toString(), init);
    const text = await response.text();

    console.log(`GAS response status: ${response.status}`);

    // Try to parse as JSON, fallback to text
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: 'Resposta inválida do GAS', raw: text };
    }

    return new Response(JSON.stringify(data), {
      status: response.ok ? 200 : response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
