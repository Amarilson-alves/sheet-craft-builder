# ✅ CHECKLIST DE IMPLEMENTAÇÃO - Google Apps Script

## 📋 Problemas Corrigidos

### 1. ✅ Salvar Obra (Função `saveObra`)
- [x] **Adicionada coluna `uf` na tabela Obras**
  - Ordem correta: obra_id, tecnico, **uf**, endereco, numero, complemento, Tipo_obra, obs, data, status
  - Antes: salvava sem UF, causando desalinhamento de colunas
  
- [x] **Adicionada coluna `uf` na tabela Materiais Utilizados**
  - Ordem correta: obra_id, **uf**, endereco, numero, SKU, Descrição, Unidade, Quantidade, Data_Utilização
  - Antes: salvava sem UF, causando endereço ir para coluna cidade
  
- [x] **Implementado decremento automático de estoque**
  - Ao salvar obra, quantidade é decrementada do estoque automaticamente
  - Nova função auxiliar: `decrementarEstoque(sku, quantidade)`

### 2. ✅ Editar Material (Função `updateMaterial`)
- [x] **Função criada do zero** (não existia antes)
- [x] Aceita parâmetros: `sku`, `descricao`, `unidade`, `quantidade`
- [x] Atualiza apenas os campos fornecidos
- [x] Retorna `{ok: true}` para compatibilidade com frontend
- [x] Valida se SKU existe antes de atualizar

### 3. ✅ Incrementar Unidades (Função `incrementMaterial`)
- [x] **Função criada do zero** (não existia antes)
- [x] Aceita parâmetros: `sku`, `delta` (positivo ou negativo), `motivo`
- [x] Impede quantidade negativa (usa `Math.max(0, ...)`)
- [x] Retorna nova quantidade: `{ok: true, newQty: ...}`
- [x] Registra movimentação em log (nova aba opcional)

### 4. ✅ Apagar Material (Função `deleteMaterial`)
- [x] Atualizada para aceitar `motivo` do body
- [x] Registra exclusão em log antes de deletar
- [x] Retorna `{ok: true}` para compatibilidade

### 5. ✅ Buscar Materiais (Função `searchMaterials`)
- [x] **Função criada** para busca por SKU ou Descrição
- [x] Retorna até 50 resultados
- [x] Busca case-insensitive

### 6. ✅ Listar Obras (Função `getObras`)
- [x] Corrigida para ler coluna `uf` (índice 2)
- [x] Todos os índices ajustados após adição da coluna UF
- [x] Retorna campo `UF` no objeto obra

## 🆕 Funcionalidades Adicionadas

### Logs de Auditoria
- [x] **Aba `Log_Movimentacoes`** (criada automaticamente)
  - Registra incrementos/decrementos com data, SKU, delta, quantidade anterior/nova, motivo
  
- [x] **Aba `Log_Exclusoes`** (criada automaticamente)
  - Registra exclusões com data, SKU, descrição, motivo, usuário

### Funções Auxiliares
- [x] `decrementarEstoque(sku, quantidade)` - Decrementa ao salvar obra
- [x] `registrarMovimentacao(...)` - Log de alterações de quantidade
- [x] `registrarExclusao(...)` - Log de exclusões

## 🔧 Mapeamento de Colunas Atualizado

### Tabela: **Materiais**
```
Coluna 1 (A): SKU
Coluna 2 (B): Descrição
Coluna 3 (C): Unidade
Coluna 4 (D): Qtdd_Depósito
Coluna 5 (E): Categoria
```

### Tabela: **Obras**
```
Coluna 1 (A): obra_id
Coluna 2 (B): tecnico
Coluna 3 (C): uf          ← NOVA COLUNA
Coluna 4 (D): endereco
Coluna 5 (E): numero
Coluna 6 (F): complemento
Coluna 7 (G): Tipo_obra
Coluna 8 (H): obs
Coluna 9 (I): data
Coluna 10 (J): status
```

### Tabela: **Materiais Utilizados**
```
Coluna 1 (A): obra_id
Coluna 2 (B): uf          ← NOVA COLUNA
Coluna 3 (C): endereco
Coluna 4 (D): numero
Coluna 5 (E): SKU
Coluna 6 (F): Descrição
Coluna 7 (G): Unidade
Coluna 8 (H): Quantidade
Coluna 9 (I): Data_Utilização
```

## 📝 Ações GET Suportadas

| Ação | Parâmetros | Retorno |
|------|-----------|---------|
| `getMaterials` | category (opcional) | Lista de materiais |
| `searchMaterials` | query | Materiais filtrados por SKU/Descrição |
| `getMaterialsByCategory` | category | Materiais de uma categoria específica |
| `getObras` | endereco, tecnico, data, dateFrom, dateTo, tipoObra | Lista de obras com materiais |
| `test` | - | Status de conexão |

## 📤 Ações POST Suportadas

| Ação | Body | Retorno |
|------|------|---------|
| `saveObra` | `{data: {tecnico, uf, endereco, numero, complemento, tipoObra, obs, materiais[]}}` | `{success: true, obraId}` |
| `addMaterial` | `{code, name, unit, category}` | `{ok: true}` |
| `updateMaterial` | `{sku, descricao?, unidade?, quantidade?}` | `{ok: true}` |
| `incrementMaterial` | `{sku, delta, motivo?}` | `{ok: true, newQty}` |
| `deleteMaterial` | `{sku, motivo?}` | `{ok: true}` |

## 🚀 Instruções de Deploy

### 1. Fazer Backup
```
1. Acesse Google Sheets: https://docs.google.com/spreadsheets/d/1Wkyst7OAeZ9XtoOgkm88psU_mV495knbNYPiCiz1cmU
2. Faça uma cópia de segurança: Arquivo > Fazer cópia
3. Anote o ID da planilha backup
```

### 2. Atualizar Script
```
1. No Google Sheets, vá em: Extensões > Apps Script
2. Delete todo o código antigo
3. Cole o novo código do arquivo: codigo-corrigido.js
4. Clique em: Arquivo > Salvar (Ctrl+S)
5. Clique em: Executar > doGet (para testar)
```

### 3. Reimplantar Web App
```
1. Clique em: Implantar > Nova implantação
2. Tipo: Aplicativo da Web
3. Executar como: Eu (seu email)
4. Quem tem acesso: Qualquer pessoa
5. Clique em: Implantar
6. Copie a nova URL do Web App
7. Atualize o arquivo src/lib/env.ts com a nova URL (se mudou)
```

### 4. Verificar Permissões
```
1. Na primeira execução, será solicitada autorização
2. Clique em: Revisar permissões
3. Escolha sua conta
4. Clique em: Avançado > Ir para [nome do projeto] (não seguro)
5. Clique em: Permitir
```

### 5. Testar Endpoints
```bash
# Teste de conexão
curl "URL_DO_SCRIPT?action=test"

# Teste getMaterials
curl "URL_DO_SCRIPT?action=getMaterials"

# Teste updateMaterial
curl -X POST "URL_DO_SCRIPT?action=updateMaterial" \
  -H "Content-Type: application/json" \
  -d '{"sku":"0056-0003-0","quantidade":50}'
```

## ⚠️ Pontos de Atenção

### Dados Existentes
- **IMPORTANTE**: Se já existem dados na planilha com a estrutura antiga (sem coluna UF), você precisa:
  1. Adicionar a coluna `uf` manualmente nas abas Obras e Materiais Utilizados
  2. Mover os dados uma coluna para a direita
  3. Preencher a coluna UF com valores padrão ou deixar vazio

### Estrutura Esperada pelo Frontend
- O frontend envia `payload.uf` ao salvar obra
- Certifique-se que o formulário em `src/pages/Campo.tsx` está coletando o campo UF

### Compatibilidade
- Todas as respostas incluem `ok: true` quando bem-sucedidas
- Erros retornam `{error: "mensagem"}`
- Funções antigas continuam funcionando normalmente

## 🧪 Testes Recomendados

### Teste 1: Salvar Obra
```
1. Acesse /campo
2. Preencha todos os campos (incluindo UF)
3. Adicione materiais
4. Clique em Salvar
5. Verifique no Google Sheets se UF está na coluna C (Obras) e B (Materiais Utilizados)
```

### Teste 2: Editar Material
```
1. Acesse /interno (admin)
2. Clique em "Gerenciar Materiais"
3. Busque um material
4. Clique em editar
5. Altere descrição, unidade ou quantidade
6. Salve e verifique no Google Sheets
```

### Teste 3: Incrementar Unidades
```
1. Acesse /interno (admin)
2. Clique em "Gerenciar Materiais"
3. Busque um material
4. Clique em "Adicionar Unidades"
5. Digite quantidade e motivo
6. Verifique estoque atualizado
7. Verifique aba "Log_Movimentacoes" criada
```

### Teste 4: Apagar Material
```
1. Acesse /interno (admin)
2. Clique em "Gerenciar Materiais"
3. Busque um material de teste
4. Clique em apagar
5. Digite motivo
6. Confirme
7. Verifique aba "Log_Exclusoes" criada
```

## 📊 Monitoramento

### Logs do Apps Script
```
1. Acesse: Extensões > Apps Script
2. Menu lateral: Execuções
3. Veja histórico de execuções e erros
```

### Logs de Auditoria nas Planilhas
```
- Aba "Log_Movimentacoes": Histórico de alterações de quantidade
- Aba "Log_Exclusoes": Histórico de materiais excluídos
```

## ✅ Checklist Final

- [ ] Backup da planilha realizado
- [ ] Código atualizado no Apps Script
- [ ] Nova implantação criada
- [ ] URL atualizada no frontend (se necessário)
- [ ] Coluna UF adicionada manualmente nas abas (se dados existentes)
- [ ] Teste de conexão funcionando
- [ ] Teste de salvar obra funcionando
- [ ] Teste de editar material funcionando
- [ ] Teste de incrementar unidades funcionando
- [ ] Teste de apagar material funcionando
- [ ] Logs de auditoria sendo criados
- [ ] Estoque sendo decrementado ao salvar obra
