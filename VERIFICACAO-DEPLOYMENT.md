# 🔍 VERIFICAÇÃO DO DEPLOYMENT - CORS AINDA NÃO FUNCIONANDO

## ❌ ERRO ATUAL
```
No 'Access-Control-Allow-Origin' header is present on the requested resource.
net::ERR_FAILED 200 (OK)
```

Isso significa que o código NO GOOGLE APPS SCRIPT ainda não tem os headers CORS corretos.

---

## ✅ CHECKLIST DE VERIFICAÇÃO

### 1️⃣ Verificar se o código foi REALMENTE atualizado no Apps Script

**Abra seu projeto do Google Apps Script e verifique:**

- [ ] O arquivo contém a função `corsJson()` no início?
- [ ] A função `corsJson()` tem os 4 `.setHeader()` dentro dela?
- [ ] As funções `doGet()` e `doPost()` usam `return corsJson(...)`?
- [ ] A função `doOptions()` retorna `corsJson('')`?

**Se NÃO tiver essas mudanças, o código não foi atualizado corretamente!**

---

### 2️⃣ Verificar se SALVOU o código

- [ ] Clicou em **Salvar** (Ctrl+S ou ícone de disquete) após colar o código?
- [ ] Não apareceu nenhum erro de sintaxe?

---

### 3️⃣ Verificar se criou um NOVO deployment (não "Manage")

**⚠️ CUIDADO:** Há 2 opções no menu Deploy, você deve usar a CORRETA:

❌ **ERRADO:** Deploy > **Test deployments** (isso não gera URL pública)
❌ **ERRADO:** Manage deployments > **Edit** no deployment antigo (isso pode usar cache)

✅ **CORRETO:** Deploy > Manage deployments > **⚙️ New deployment** (botão com ícone de engrenagem)

Configurações obrigatórias:
- Tipo: **Web app**
- Execute as: **Me** (sua conta)
- Who has access: **Anyone**

---

## 🧪 TESTE RÁPIDO - Verificar se CORS está funcionando

Abra o **Terminal** ou **CMD** e execute este comando:

```bash
curl -i "https://script.google.com/macros/s/AKfycby2lliD-dWHYjt3CgxPUI7Iy5SsziQ5Azzd_nAQoeF8zFVdMmU7jG_Zej0l8aw6be0S/exec?action=test"
```

### ✅ RESPOSTA ESPERADA (CORRETO):
```
HTTP/2 200
access-control-allow-origin: *
access-control-allow-methods: GET, POST, OPTIONS
access-control-allow-headers: Content-Type
content-type: application/json

{"message":"Conexão bem-sucedida","status":"OK"}
```

### ❌ RESPOSTA COM PROBLEMA (ERRADO):
```
HTTP/2 200
content-type: application/json

{"message":"Conexão bem-sucedida","status":"OK"}
```
*Nota: Faltam os headers `access-control-allow-*`*

OU

```
<!DOCTYPE html>
<html>
...
```
*Nota: Retornou HTML em vez de JSON (URL errada ou deployment incorreto)*

---

## 🔧 SOLUÇÃO PASSO A PASSO

### PASSO 1: Verificar o código atual no Apps Script

1. Abra: https://script.google.com/home
2. Encontre seu projeto (spreadsheet vinculado)
3. Abra o arquivo **Código.gs**
4. Verifique se as primeiras linhas são assim:

```javascript
// ID da planilha principal
const SPREADSHEET_ID = '1Wkyst7OAeZ9XtoOgkm88psU_mV495knbNYPiCiz1cmU';

// Nomes das abas
const SHEET_NAMES = {
  MATERIAIS: 'Materiais',
  OBRAS: 'Obras', 
  MATERIAIS_UTILIZADOS: 'Materiais Utilizados'
};

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
```

**Se o seu código NÃO começar com `function corsJson(data)` após as constantes, você PRECISA atualizar o código!**

---

### PASSO 2: Copiar o código correto

1. Abra o arquivo: `google-apps-script/codigo-atualizado-cors.js` do projeto
2. Selecione TODO o conteúdo (Ctrl+A)
3. Copie (Ctrl+C)
4. No Google Apps Script, selecione TODO o código antigo (Ctrl+A)
5. Cole o novo código (Ctrl+V)
6. **SALVE** (Ctrl+S ou ícone de disquete)
7. Aguarde a mensagem "Salvo" aparecer

---

### PASSO 3: Criar deployment COMPLETAMENTE NOVO

1. No Google Apps Script, clique em **Deploy** (canto superior direito)
2. Clique em **Manage deployments**
3. Clique no botão **⚙️ New deployment** (ícone de engrenagem ao lado de "Active deployments")
4. Clique no ícone de engrenagem ao lado de "Select type"
5. Escolha **Web app**
6. Preencha:
   - **Description:** "Deployment com CORS corrigido"
   - **Execute as:** Me (sua conta completa deve aparecer)
   - **Who has access:** Anyone
7. Clique em **Deploy**
8. Autorize o acesso se solicitado
9. **COPIE a nova URL** (deve terminar com `/exec`)
10. Me envie a nova URL

---

## 📸 CAPTURAS DE TELA PARA VERIFICAÇÃO

Se possível, tire prints de tela de:

1. ✅ As primeiras 30 linhas do código no Apps Script (mostrando a função `corsJson`)
2. ✅ A tela de "Manage deployments" mostrando os deployments ativos
3. ✅ O resultado do comando `curl` no terminal

---

## 🚨 PROBLEMAS COMUNS

### Problema 1: "Código copiado mas ainda não funciona"
**Causa:** Não salvou ou não fez novo deployment
**Solução:** Salve (Ctrl+S) e crie deployment completamente novo

### Problema 2: "Criei novo deployment mas continua o erro"
**Causa:** Código não foi atualizado antes do deployment
**Solução:** Verifique se o código tem `function corsJson()` e faça outro deployment

### Problema 3: "Deployment criado mas URL antiga"
**Causa:** Copiou URL do deployment antigo em vez do novo
**Solução:** Copie a URL que apareceu APÓS criar o novo deployment

### Problema 4: "Erro de autorização ao fazer deployment"
**Causa:** Apps Script precisa de permissão para acessar a planilha
**Solução:** Clique em "Authorize access" e permita as autorizações solicitadas

---

## 📋 RESUMO - O QUE DEVE ACONTECER

1. ✅ Código atualizado no Apps Script com função `corsJson()`
2. ✅ Código salvo (Ctrl+S)
3. ✅ Novo deployment criado (não reutilizar antigo)
4. ✅ Teste curl mostra headers `access-control-allow-origin: *`
5. ✅ Front-end no Lovable funciona sem erro de CORS

---

## 🆘 PRÓXIMO PASSO

Execute o comando `curl` de teste e me envie o resultado completo:

```bash
curl -i "https://script.google.com/macros/s/AKfycby2lliD-dWHYjt3CgxPUI7Iy5SsziQ5Azzd_nAQoeF8zFVdMmU7jG_Zej0l8aw6be0S/exec?action=test"
```

Copie TUDO que aparecer no terminal e me envie.
