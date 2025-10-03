# 📋 ESPECIFICAÇÃO COMPLETA - Google Apps Script para Frontend

Este documento contém **TODAS** as requisições que o frontend faz ao Google Apps Script. Use isso para criar e implantar seu script corretamente ANTES de adaptar o frontend.

---

## 🎯 REQUISITOS OBRIGATÓRIOS

### 1. CORS Headers (CRÍTICO!)
Todas as respostas devem incluir os seguintes headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### 2. Formato de Resposta
- **Sucesso**: `{ ok: true, ...dados }`
- **Erro**: `{ error: "mensagem de erro" }`

### 3. Content-Type
- Sempre retornar: `application/json`

---

## 📡 ENDPOINTS E REQUISIÇÕES

### **1. GET - Listar Todos os Materiais**

**Chamada Frontend:**
```javascript
GET ?action=getMaterials
```

**Resposta Esperada:**
```json
{
  "ok": true,
  "materials": [
    {
      "SKU": "ABC123",
      "Descrição": "Material exemplo",
      "Unidade": "UN",
      "Quantidade": 100,
      "Categoria": "Interno"
    }
  ]
}
```

**Campos Obrigatórios de cada Material:**
- `SKU` (string) - Código único
- `Descrição` (string) - Nome/descrição
- `Unidade` (string) - Unidade de medida (UN, M, KG, etc)
- `Quantidade` (number) - Quantidade em estoque
- `Categoria` (string) - "Interno" ou "Externo"

**Caso de Erro:**
```json
{
  "error": "Não foi possível buscar materiais"
}
```

---

### **2. POST - Salvar Obra**

**Chamada Frontend:**
```javascript
POST ?action=saveObra
Content-Type: application/json

{
  "action": "saveObra",
  "data": {
    "tecnico": "João Silva",
    "idObra": "OBRA-2023-001",
    "endereco": "Rua das Flores",
    "numero": "123",
    "complemento": "Apt 101",
    "uf": "PR",
    "tipoObra": "Alivio",
    "obs": "Observações",
    "materiais": [
      {
        "code": "ABC123",
        "name": "Material exemplo",
        "unit": "UN",
        "quantity": 5
      }
    ]
  }
}
```

**Campos do Formulário:**
- `tecnico` (string, obrigatório) - Nome do técnico
- `idObra` (string, opcional) - ID da obra
- `endereco` (string, obrigatório) - Endereço
- `numero` (string, obrigatório) - Número
- `complemento` (string, opcional) - Complemento
- `uf` (string, obrigatório) - Estado (PR, PRI, SC, RS)
- `tipoObra` (string, obrigatório) - "Alivio" ou "Adequacao"
- `obs` (string, opcional) - Observações

**Campos de Materiais:**
- `code` (string) - SKU do material
- `name` (string) - Nome do material
- `unit` (string) - Unidade
- `quantity` (number) - Quantidade utilizada

**Resposta Esperada:**
```json
{
  "ok": true,
  "obraId": "ID_GERADO_PELA_PLANILHA"
}
```

**O que o Script DEVE fazer:**
1. Salvar os dados da obra na planilha "Obras"
2. Salvar cada material utilizado na planilha "Materiais Utilizados"
3. **DECREMENTAR o estoque** de cada material na planilha "Materiais"
4. Retornar o ID da obra criada

**Caso de Erro:**
```json
{
  "error": "Descrição do erro"
}
```

---

### **3. POST - Editar Material**

**Chamada Frontend:**
```javascript
POST ?action=updateMaterial
Content-Type: application/json

{
  "action": "updateMaterial",
  "sku": "ABC123",
  "quantidade": 150,
  "descricao": "Nova descrição",
  "unidade": "UN"
}
```

**Campos:**
- `sku` (string, obrigatório) - SKU do material a editar
- `quantidade` (number, obrigatório) - Nova quantidade
- `descricao` (string, obrigatório) - Nova descrição
- `unidade` (string, obrigatório) - Nova unidade

**Resposta Esperada:**
```json
{
  "ok": true
}
```

**O que o Script DEVE fazer:**
1. Localizar o material pelo SKU na planilha "Materiais"
2. Atualizar descrição, unidade e quantidade
3. Retornar sucesso

---

### **4. POST - Incrementar/Decrementar Quantidade**

**Chamada Frontend:**
```javascript
POST ?action=incrementMaterial
Content-Type: application/json

{
  "action": "incrementMaterial",
  "sku": "ABC123",
  "delta": 50,
  "motivo": "Recebimento de estoque"
}
```

**Campos:**
- `sku` (string, obrigatório) - SKU do material
- `delta` (number, obrigatório) - Quantidade a adicionar (positivo) ou remover (negativo)
- `motivo` (string, opcional) - Motivo da alteração

**Resposta Esperada:**
```json
{
  "ok": true,
  "newQty": 150
}
```

**O que o Script DEVE fazer:**
1. Localizar o material pelo SKU
2. Adicionar `delta` à quantidade atual (pode ser negativo)
3. Registrar no log (planilha "Log_Movimentacoes")
4. Retornar a nova quantidade

---

### **5. POST - Deletar Material**

**Chamada Frontend:**
```javascript
POST ?action=deleteMaterial
Content-Type: application/json

{
  "action": "deleteMaterial",
  "sku": "ABC123",
  "motivo": "Material descontinuado"
}
```

**Campos:**
- `sku` (string, obrigatório) - SKU do material a deletar
- `motivo` (string, opcional) - Motivo da exclusão

**Resposta Esperada:**
```json
{
  "ok": true
}
```

**O que o Script DEVE fazer:**
1. Localizar o material pelo SKU
2. Remover a linha da planilha "Materiais"
3. Registrar no log (planilha "Log_Exclusoes")

---

## 📊 ESTRUTURA DAS PLANILHAS

### Planilha "Materiais"
Colunas (em ordem):
1. **SKU** (A) - Código único
2. **Descrição** (B) - Nome do material
3. **Unidade** (C) - Unidade de medida
4. **Quantidade** (D) - Estoque atual
5. **Categoria** (E) - "Interno" ou "Externo"

### Planilha "Obras"
Colunas (em ordem):
1. **Data** (A) - Data/hora do registro
2. **Técnico** (B) - Nome do técnico
3. **ID Obra** (C) - ID opcional da obra
4. **Endereço** (D) - Endereço
5. **Número** (E) - Número
6. **Complemento** (F) - Complemento
7. **UF** (G) - Estado
8. **Tipo Obra** (H) - Tipo
9. **Observações** (I) - Observações

### Planilha "Materiais Utilizados"
Colunas (em ordem):
1. **Data** (A) - Data/hora
2. **ID Obra** (B) - Referência à obra
3. **Técnico** (C) - Nome do técnico
4. **Endereço** (D) - Endereço da obra
5. **UF** (E) - Estado
6. **SKU** (F) - Código do material
7. **Descrição** (G) - Nome do material
8. **Unidade** (H) - Unidade
9. **Quantidade** (I) - Quantidade utilizada

### Planilha "Log_Movimentacoes" (opcional mas recomendado)
Para auditoria de alterações de estoque:
1. **Data** (A)
2. **SKU** (B)
3. **Delta** (C) - Quantidade alterada
4. **Quantidade Anterior** (D)
5. **Quantidade Nova** (E)
6. **Motivo** (F)

### Planilha "Log_Exclusoes" (opcional mas recomendado)
Para auditoria de exclusões:
1. **Data** (A)
2. **SKU** (B)
3. **Descrição** (C)
4. **Motivo** (D)

---

## ✅ CHECKLIST DE IMPLANTAÇÃO

Antes de testar com o frontend, verifique:

- [ ] Script criado no Google Apps Script
- [ ] ID da planilha configurado no script
- [ ] Todas as 5 funções implementadas (getMaterials, saveObra, updateMaterial, incrementMaterial, deleteMaterial)
- [ ] CORS headers configurados corretamente
- [ ] Implantado como Web App com:
  - **Execute as:** Me
  - **Who has access:** Anyone
- [ ] **Nova implantação criada** (não reutilizar URL antiga)
- [ ] URL da nova implantação copiada
- [ ] Testado com curl:

```bash
# Teste GET
curl "URL_DO_SCRIPT?action=getMaterials"

# Deve retornar JSON com CORS headers
```

---

## 🔧 EXEMPLO DE TESTE MANUAL

### Teste 1: Listar Materiais
```bash
curl -i "https://script.google.com/macros/s/SEU_ID/exec?action=getMaterials"
```

Verifique se retorna:
- Status 200
- Header `Access-Control-Allow-Origin: *`
- JSON com `{"ok": true, "materials": [...]}`

### Teste 2: Salvar Obra
```bash
curl -i -X POST "https://script.google.com/macros/s/SEU_ID/exec?action=saveObra" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "saveObra",
    "data": {
      "tecnico": "Teste",
      "endereco": "Rua Teste",
      "numero": "123",
      "uf": "PR",
      "tipoObra": "Alivio",
      "materiais": [
        {"code": "ABC123", "name": "Teste", "unit": "UN", "quantity": 1}
      ]
    }
  }'
```

---

## 📝 PRÓXIMOS PASSOS

1. **Crie o Google Apps Script** seguindo esta especificação
2. **Implante como Web App** com acesso "Anyone"
3. **Teste com curl** para confirmar funcionamento
4. **Copie a URL da nova implantação**
5. **Volte aqui** e me informe: "Script implantado, URL: [sua_url]"
6. **Então atualizaremos** o frontend para usar a URL correta

---

## ❓ DÚVIDAS FREQUENTES

**Q: Preciso usar Supabase/Cloud?**
A: NÃO! Este script roda 100% no Google Apps Script gratuitamente.

**Q: Por que as falhas nas execuções?**
A: Provavelmente erro de CORS ou função não implementada. Siga esta especificação exatamente.

**Q: Como debugar?**
A: Use `Logger.log()` no Apps Script e verifique em "Execuções" → clique na execução → veja os logs.

**Q: Preciso de todas as 5 funções?**
A: Sim, o frontend espera todas. Se não usar alguma (ex: delete), ainda assim crie a função retornando `{ok: true}`.
