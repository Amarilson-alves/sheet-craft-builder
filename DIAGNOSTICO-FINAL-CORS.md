# 🔴 DIAGNÓSTICO FINAL - CORS BLOQUEADO NO GAS

## ⚠️ PROBLEMA MAIS COMUM

**O erro `200 OK` mas sem headers CORS geralmente significa:**
- ❌ O deployment não está como **"Anyone"** (está como "Anyone within organization" ou "Only myself")
- ❌ A URL usada não é a do deployment mais recente
- ❌ O Google está retornando uma página HTML de login/consent (200 OK) em vez do seu JSON

---

## 🎯 PASSO 1 - VERIFICAR DEPLOYMENT (CRÍTICO!)

### ⚠️ ATENÇÃO: Este é o erro mais comum!

1. Abra o Google Apps Script: https://script.google.com/home
2. Abra seu projeto
3. Clique em **Deploy** > **Manage deployments**
4. Veja quantos deployments ativos existem
5. Para o deployment MAIS RECENTE, verifique:

```
✅ Type: Web app
✅ Execute as: Me (sua conta completa)
✅ Who has access: Anyone ← DEVE SER "Anyone" (não "Anyone within...")
```

### ❌ CONFIGURAÇÕES ERRADAS QUE CAUSAM O ERRO:

- ❌ "Who has access: Only myself" → retorna HTML de login
- ❌ "Who has access: Anyone within [organização]" → retorna HTML de consent
- ❌ Usando URL de deployment antigo → retorna código sem CORS

### ✅ COMO CRIAR DEPLOYMENT CORRETO:

1. Deploy > Manage deployments
2. Clique em **New deployment** (ícone ⚙️)
3. Type: **Web app**
4. Execute as: **Me (sua-conta@gmail.com)**
5. Who has access: **Anyone** ← IMPORTANTE!
6. Deploy
7. **COPIE A NOVA URL** (termina com `/exec`)
8. Me envie essa URL

---

## 🧪 PASSO 2 - TESTE COM CURL (OBRIGATÓRIO)

### Teste 1: GET simples
```bash
curl -i "https://script.google.com/macros/s/AKfycby2lliD-dWHYjt3CgxPUI7Iy5SsziQ5Azzd_nAQoeF8zFVdMmU7jG_Zej0l8aw6be0S/exec?action=test"
```

### ✅ RESPOSTA ESPERADA (CORRETO):
```
HTTP/2 200
content-type: application/json
access-control-allow-origin: *
access-control-allow-methods: GET, POST, OPTIONS
access-control-allow-headers: Content-Type

{"message":"OK","status":"UP"}
```

### ❌ RESPOSTA ERRADA 1 (Deployment incorreto):
```
HTTP/2 200
content-type: text/html

<!DOCTYPE html>
<html>
<head><title>Google Apps Script</title></head>
...
```
**Diagnóstico:** Deployment não está como "Anyone" ou URL errada

### ❌ RESPOSTA ERRADA 2 (CORS ausente):
```
HTTP/2 200
content-type: application/json

{"message":"OK","status":"UP"}
```
**Diagnóstico:** Código não tem corsJson() ou não foi salvo/deployado

---

### Teste 2: OPTIONS (Preflight)
```bash
curl -i -X OPTIONS "https://script.google.com/macros/s/AKfycby2lliD-dWHYjt3CgxPUI7Iy5SsziQ5Azzd_nAQoeF8zFVdMmU7jG_Zej0l8aw6be0S/exec" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -H "Origin: https://cc8f6eb9-71b8-4413-98fb-a44bac0d4fb3.lovableproject.com"
```

### ✅ RESPOSTA ESPERADA:
```
HTTP/2 200
access-control-allow-origin: *
access-control-allow-methods: GET, POST, OPTIONS
access-control-allow-headers: Content-Type
access-control-max-age: 86400
```

---

## 📋 PASSO 3 - VERIFICAR CÓDIGO NO APPS SCRIPT

### ✅ Código que DEVE estar no seu Apps Script:

Verifique se seu código tem EXATAMENTE isso no início:

```javascript
// ==================== HELPER CORS CENTRALIZADO ====================
function corsJson(data) {
  return ContentService
    .createTextOutput(typeof data === 'string' ? data : JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setHeader('Access-Control-Max-Age', '86400');
}

function doOptions(e) {
  return corsJson('');
}

function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : null;
    if (!action) return corsJson({ error: 'Ação não reconhecida' });

    switch (action) {
      case 'getMaterials':           return corsJson(getMaterials(e));
      case 'searchMaterials':        return corsJson(searchMaterials(e));
      case 'getObras':               return corsJson(getObras(e));
      case 'getMaterialsByCategory': return corsJson(getMaterialsByCategory(e));
      case 'test':                   return corsJson({ message: 'OK', status: 'UP' });
      default:                       return corsJson({ error: 'Ação não reconhecida' });
    }
  } catch (error) {
    return corsJson({ error: error.message, stack: error.stack });
  }
}

function doPost(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : null;
    var body = {};
    if (e && e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); } catch(_){}
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

### ❌ COISAS QUE NÃO DEVEM EXISTIR NO CÓDIGO:

- ❌ Função `createCORSResponse()` antiga
- ❌ Função `createResponse()` antiga
- ❌ Qualquer `return` que NÃO seja `return corsJson(...)`

---

## 🔧 PASSO 4 - PROCEDIMENTO COMPLETO DE CORREÇÃO

### 1️⃣ Atualizar o código

1. Abra o arquivo `google-apps-script/codigo-atualizado-cors.js` neste projeto
2. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
3. Vá para o Google Apps Script
4. Selecione todo o código antigo (Ctrl+A)
5. Cole o novo código (Ctrl+V)
6. **SALVE** (Ctrl+S ou ícone de disquete)
7. Aguarde "Salvo" aparecer

### 2️⃣ Criar novo deployment

1. Deploy > Manage deployments
2. **New deployment** (ícone ⚙️)
3. Type: Web app
4. Execute as: Me
5. **Who has access: Anyone** ← CRÍTICO!
6. Deploy
7. Autorize se solicitado
8. **COPIE A URL NOVA** (termina com `/exec`)

### 3️⃣ Testar com curl

Execute o teste com a nova URL:

```bash
curl -i "SUA_NOVA_URL?action=test"
```

**Se não mostrar `access-control-allow-origin: *`, volte ao Passo 1**

### 4️⃣ Me envie a nova URL

Envie a URL que passou no teste curl para eu atualizar no projeto.

---

## 📊 TABELA DE DIAGNÓSTICO

| Sintoma | Causa Provável | Solução |
|---------|---------------|---------|
| `200 OK` + HTML do Google | Deployment não é "Anyone" | Mudar para "Anyone" |
| `200 OK` + JSON sem CORS | Código sem corsJson() | Atualizar código |
| `403 Forbidden` | Sem autorização | Autorizar o script |
| `404 Not Found` | URL errada | Copiar URL correta do deployment |
| Funciona no curl mas não no browser | URL antiga no front-end | Atualizar .env e rebuildar |

---

## 🆘 CHECKLIST FINAL

Antes de me enviar a nova URL, confirme:

- [ ] Código tem função `corsJson()` com 4 `.setHeader()`
- [ ] Todas as funções `doGet`, `doPost`, `doOptions` usam `return corsJson(...)`
- [ ] Não existem funções `createCORSResponse()` ou `createResponse()` antigas
- [ ] Código foi **SALVO** (Ctrl+S)
- [ ] **NOVO deployment criado** (não editou o antigo)
- [ ] Who has access: **Anyone** (não "Anyone within...")
- [ ] Execute as: **Me**
- [ ] Teste curl mostra `access-control-allow-origin: *`
- [ ] Copiou a URL do deployment NOVO (não reutilizou antiga)

---

## 📝 EXECUTAR AGORA

1. Execute o comando curl com a URL atual
2. Me envie o resultado completo (todos os headers + JSON)
3. Me diga quantos deployments ativos você tem no painel "Manage deployments"
4. Tire um print da tela "Manage deployments" se possível

Aguardo o resultado do curl para diagnosticar exatamente o problema.
