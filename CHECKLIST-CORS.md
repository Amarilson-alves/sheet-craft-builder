# ✅ CHECKLIST DE IMPLEMENTAÇÃO - CORREÇÃO CORS

## 📋 RESUMO DO PROBLEMA

**Erro observado:**
```
Access to fetch ... has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
net::ERR_FAILED 200 (OK)
```

**Causa raiz:** Respostas do Google Apps Script não estavam retornando os headers CORS corretos de forma consistente.

---

## ✅ IMPLEMENTAÇÕES REALIZADAS

### 1️⃣ Google Apps Script - Helper CORS Centralizado

**Arquivo:** `google-apps-script/codigo-atualizado-cors.js`

✅ **Implementado:**
- [x] Criado helper `corsJson(data)` que centraliza TODAS as respostas
- [x] Define `Content-Type: application/json`
- [x] Define headers CORS obrigatórios:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: GET, POST, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type`
  - `Access-Control-Max-Age: 86400`

**Código implementado:**
```javascript
function corsJson(data) {
  return ContentService
    .createTextOutput(typeof data === 'string' ? data : JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setHeader('Access-Control-Max-Age', '86400');
}
```

---

### 2️⃣ Google Apps Script - doOptions (Preflight)

✅ **Implementado:**
- [x] `doOptions()` retorna via `corsJson('')` 
- [x] Responde corretamente aos preflight OPTIONS

**Código implementado:**
```javascript
function doOptions(e) {
  return corsJson('');
}
```

---

### 3️⃣ Google Apps Script - doGet (todas as rotas)

✅ **Implementado:**
- [x] Todas as respostas passam por `corsJson()`
- [x] Todas as ações (getMaterials, searchMaterials, getObras, etc.) usam `corsJson()`
- [x] Todos os erros no `catch` retornam via `corsJson({ error, stack })`
- [x] Resposta padrão para ação não reconhecida via `corsJson()`

**Código implementado:**
```javascript
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : null;
    if (!action) return corsJson({ error: 'Ação não reconhecida' });

    switch (action) {
      case 'getMaterials':           return corsJson(getMaterials(e));
      case 'searchMaterials':        return corsJson(searchMaterials(e));
      case 'getObras':               return corsJson(getObras(e));
      case 'getMaterialsByCategory': return corsJson(getMaterialsByCategory(e));
      case 'test':                   return corsJson({ message: 'Conexão bem-sucedida', status: 'OK' });
      default:                       return corsJson({ error: 'Ação não reconhecida' });
    }
  } catch (error) {
    return corsJson({ error: error.message, stack: error.stack });
  }
}
```

---

### 4️⃣ Google Apps Script - doPost (todas as ações)

✅ **Implementado:**
- [x] Todas as respostas passam por `corsJson()`
- [x] Todas as ações POST (saveObra, addMaterial, updateMaterial, incrementMaterial, deleteMaterial) usam `corsJson()`
- [x] Todos os erros no `catch` retornam via `corsJson({ error, stack })`
- [x] Resposta padrão para ação não reconhecida via `corsJson()`

**Código implementado:**
```javascript
function doPost(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : null;
    var body = {};
    
    if (e && e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); } catch(_) {}
      if (!action && body.action) action = body.action;
    }
    
    if (!action) return corsJson({ error: 'Ação POST não reconhecida' });

    switch (action) {
      case 'saveObra':
        if (body && body.data) {
          e.parameter = Object.assign({}, e.parameter, { payload: JSON.stringify(body.data) });
        }
        return corsJson(saveObra(e));
      case 'addMaterial':        return corsJson(addMaterial(body));
      case 'updateMaterial':     return corsJson(updateMaterial(body));
      case 'incrementMaterial':  return corsJson(incrementMaterial(body));
      case 'deleteMaterial':     return corsJson(deleteMaterial(body));
      default:                   return corsJson({ error: 'Ação POST não reconhecida: ' + action });
    }
  } catch (error) {
    return corsJson({ error: error.message, stack: error.stack });
  }
}
```

---

### 5️⃣ Front-end - Wrapper gasClient.ts

**Arquivo:** `src/lib/gasClient.ts`

✅ **Implementado:**
- [x] `gasGet()` - chamadas GET sem headers customizados (evita preflight)
- [x] `gasPost()` - chamadas POST com `Content-Type: application/json`
- [x] Ambos usam `cache: 'no-store'` para evitar cache do preview
- [x] Parse de resposta com tratamento de erros

**Código implementado:**
```typescript
export async function gasGet(params: Record<string, string>) {
  const url = new URL(GAS_BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  
  const res = await fetch(url.toString(), {
    method: 'GET',
    mode: 'cors',
    cache: 'no-store',
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
```

---

### 6️⃣ Front-end - Atualizar services/materials.ts

⏳ **PRÓXIMO PASSO:** Atualizar para usar `gasGet()` e `gasPost()`

---

## 🚨 AÇÕES NECESSÁRIAS DO USUÁRIO

### PASSO 1: Atualizar código do Google Apps Script

1. Abra seu projeto no Google Apps Script
2. Substitua TODO o código atual pelo conteúdo de `google-apps-script/codigo-atualizado-cors.js`
3. Salve (Ctrl+S ou Cmd+S)

### PASSO 2: Criar NOVO deployment

**IMPORTANTE:** Não use o deployment antigo!

1. No Apps Script, clique em **Deploy** > **Manage deployments**
2. Clique em **New deployment** (⚙️ New deployment)
3. Tipo: **Web app**
4. Configurações:
   - **Execute as:** Me (sua conta)
   - **Who has access:** Anyone
5. Clique em **Deploy**
6. **Copie a nova URL `/exec`**

### PASSO 3: Enviar a nova URL

Envie a nova URL para atualizarmos o `src/lib/env.ts`

---

## 🧪 TESTES PARA VALIDAÇÃO

Após atualizar o código e fazer novo deployment, execute estes testes:

### Teste 1: GET básico (action=test)
```bash
curl -i "https://SUA_NOVA_URL/exec?action=test"
```

**Esperado:**
```
HTTP/2 200
access-control-allow-origin: *
access-control-allow-methods: GET, POST, OPTIONS
access-control-allow-headers: Content-Type
content-type: application/json

{"message":"Conexão bem-sucedida","status":"OK"}
```

### Teste 2: OPTIONS (preflight)
```bash
curl -i -X OPTIONS "https://SUA_NOVA_URL/exec" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -H "Origin: https://lovableproject.com"
```

**Esperado:**
```
HTTP/2 200
access-control-allow-origin: *
access-control-allow-methods: GET, POST, OPTIONS
access-control-allow-headers: Content-Type
access-control-max-age: 86400
```

### Teste 3: GET getMaterials
```bash
curl -i "https://SUA_NOVA_URL/exec?action=getMaterials"
```

**Esperado:**
```
HTTP/2 200
access-control-allow-origin: *
content-type: application/json

{"materials":[...],"total":...}
```

### Teste 4: POST saveObra
```bash
curl -i -X POST "https://SUA_NOVA_URL/exec?action=saveObra" \
  -H "Content-Type: application/json" \
  -d '{"action":"saveObra","data":{"tecnico":"Teste CORS","uf":"PR","endereco":"Rua Teste","numero":"123","tipoObra":"Padrao","obs":"Teste","materiais":[]}}'
```

**Esperado:**
```
HTTP/2 200
access-control-allow-origin: *
content-type: application/json

{"success":true,"ok":true,"message":"Obra salva com sucesso","obraId":"..."}
```

---

## 📊 COMPARAÇÃO ANTES/DEPOIS

### ❌ ANTES (código antigo)
```javascript
function createCORSResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  // ❌ Sem headers CORS!
}
```

### ✅ DEPOIS (código novo)
```javascript
function corsJson(data) {
  return ContentService
    .createTextOutput(typeof data === 'string' ? data : JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')       // ✅
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')  // ✅
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')        // ✅
    .setHeader('Access-Control-Max-Age', '86400');                    // ✅
}
```

---

## 🎯 CRITÉRIOS DE ACEITE

- [ ] Código do Apps Script atualizado com `corsJson()`
- [ ] NOVO deployment criado (não reutilizar URL antiga)
- [ ] Deploy configurado como "Execute as: Me" + "Anyone"
- [ ] Teste 1 (GET test) retorna headers CORS ✅
- [ ] Teste 2 (OPTIONS) retorna headers CORS ✅
- [ ] Teste 3 (GET getMaterials) funciona sem erro ✅
- [ ] Teste 4 (POST saveObra) funciona sem erro ✅
- [ ] Preview no Lovable carrega sem erro de CORS ✅
- [ ] Network tab mostra `200 OK` com headers CORS ✅

---

## 🔍 ONDE ESTÁVAMOS ERRANDO

1. **Headers CORS ausentes:** O `createCORSResponse()` antigo não adicionava os headers
2. **Deployment antigo:** Mesmo após alterar código, continuava usando deployment sem CORS
3. **Headers em GET:** Front-end enviava `Content-Type` em GET, causando preflight desnecessário
4. **Inconsistência:** Alguns erros não passavam pela função de resposta CORS

---

## 📝 PRÓXIMOS PASSOS

Após receber a nova URL do deployment:

1. Atualizaremos `src/lib/env.ts` com a nova URL
2. Atualizaremos `src/services/materials.ts` para usar `gasGet()` e `gasPost()`
3. Testaremos no preview do Lovable
4. Validaremos todos os fluxos (listagem, busca, salvar obra, etc.)
