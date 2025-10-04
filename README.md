# Sistema de Cadastro de Materiais - v1.0

## 📋 Descrição

Sistema profissional de gerenciamento de obras e materiais desenvolvido para controle de estoque e rastreabilidade de materiais utilizados em campo. O sistema integra-se com Google Sheets para armazenamento e oferece interface otimizada para técnicos de campo e administradores.

## 🚀 Funcionalidades

### 👨‍💼 Acesso Interno - Administração
- **Consulta de Obras**: Filtros avançados por endereço, técnico, data e tipo de obra
- **Exportação para Excel**: Geração automática de relatórios com materiais por obra e resumos
- **Gerenciamento de Materiais**: 
  - Adicionar novos materiais ao catálogo
  - Editar informações (descrição, unidade, quantidade)
  - Incrementar/decrementar estoque com histórico
  - Excluir materiais com confirmação de segurança
- **Busca Inteligente**: Pesquisa por SKU ou descrição com debounce

### 🏗️ Acesso Campo - Técnicos
- **Cadastro de Obras**: Registro completo com endereço, tipo e observações
- **Seleção de Materiais**: Interface visual com filtros por categoria (Interno/Externo)
- **Controle de Quantidade**: Ajuste rápido de quantidades por material
- **Validação de Dados**: Validação em tempo real com feedback visual
- **Rate Limiting**: Proteção contra envios duplicados

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Vite
- **UI/UX**: TailwindCSS, Radix UI, Lucide Icons
- **Estado**: TanStack Query (React Query)
- **Validação**: Zod
- **Roteamento**: React Router DOM v6
- **Exportação**: SheetJS (xlsx)
- **Backend**: Google Apps Script + Google Sheets

## 📦 Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── ui/             # Componentes de UI (Shadcn)
│   ├── BackButton.tsx
│   ├── ConfirmDeleteModal.tsx
│   ├── EditMaterialModal.tsx
│   ├── IncrementUnitsModal.tsx
│   ├── MaterialsButtonGrid.tsx
│   └── MaterialsSearchModal.tsx
├── hooks/              # Custom React Hooks
│   ├── useMaterials.ts
│   ├── useDebounce.ts
│   └── use-toast.ts
├── lib/                # Utilitários e helpers
│   ├── gasClient.ts    # Cliente Google Apps Script
│   ├── flattenObras.ts # Transformação de dados para Excel
│   ├── formatSKU.ts    # Formatação de códigos SKU
│   └── utils.ts        # Funções auxiliares
├── pages/              # Páginas da aplicação
│   ├── Index.tsx       # Página inicial
│   ├── Campo.tsx       # Acesso para técnicos
│   ├── Interno.tsx     # Acesso administrativo
│   └── NotFound.tsx    # Página 404
├── services/           # Serviços de API
│   └── materials.ts    # Operações com materiais
├── types/              # Definições TypeScript
│   └── material.ts
├── utils/              # Utilitários de segurança
│   ├── validators.ts   # Validadores de formulário
│   ├── sanitize.ts     # Sanitização de dados
│   ├── rateLimit.ts    # Controle de taxa
│   └── permissions.ts  # Controle de acesso
└── index.css           # Estilos globais e tema

google-apps-script/
└── CODIGO-ATUALIZADO-FUNCIONAL.js  # Backend Google Apps Script
```

## 🔧 Configuração

### 1. Instalação de Dependências

```bash
npm install
```

### 2. Configuração do Google Apps Script

1. Acesse [Google Apps Script](https://script.google.com/)
2. Crie um novo projeto
3. Copie o código de `google-apps-script/CODIGO-ATUALIZADO-FUNCIONAL.js`
4. Atualize o `SPREADSHEET_ID` com o ID da sua planilha
5. Faça deploy como Web App com acesso "Qualquer pessoa"
6. Copie a URL gerada

### 3. Configuração de Variáveis de Ambiente

Atualize a URL do Google Apps Script em:
- `src/lib/gasClient.ts` → constante `GAS_URL`
- `src/lib/env.ts` → `VITE_API_BASE_URL` no schema

### 4. Estrutura do Google Sheets

Crie uma planilha com 3 abas:

**Aba "Materiais":**
| SKU | Descrição | Unidade | Qtdd_Depósito | Categoria |
|-----|-----------|---------|---------------|-----------|

**Aba "Obras":**
| obra_id | tecnico | uf | endereco | numero | complemento | Tipo_obra | obs | data | status |
|---------|---------|----|---------|---------|--------------|-----------|----|------|--------|

**Aba "Materiais Utilizados":**
| obra_id | uf | endereco | numero | SKU | Descrição | Unidade | Quantidade | Data_Utilização |
|---------|----|---------|---------|----|-----------|---------|------------|-----------------|

## 🚦 Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
```

### Preview da Build
```bash
npm run preview
```

### Testes
```bash
npm run test
```

## 🔒 Segurança

- **Validação de Input**: Todos os campos são validados com Zod
- **Sanitização**: Dados sanitizados antes de envio ao backend
- **Rate Limiting**: Proteção contra spam e requisições duplicadas
- **XSS Protection**: Sanitização de strings e números
- **SQL Injection Protection**: Validação de comprimento e caracteres

## 📊 Fluxo de Dados

```
[Frontend React] 
    ↓ HTTP Request
[Google Apps Script] 
    ↓ Apps Script API
[Google Sheets Database]
    ↓ Response
[Frontend React]
    ↓ Export
[Excel Download]
```

## 🎨 Design System

O projeto utiliza um design system personalizado baseado em:
- **Cores**: Sistema de tokens CSS para temas claro/escuro
- **Tipografia**: Fontes system para melhor performance
- **Componentes**: Shadcn UI customizados
- **Animações**: Transições suaves e feedback visual
- **Responsividade**: Mobile-first design

## 📝 Convenções de Código

- **TypeScript**: Tipagem estrita habilitada
- **ESLint**: Configuração com Prettier
- **Commits**: Husky com lint-staged
- **Nomenclatura**: camelCase para variáveis, PascalCase para componentes

## 🐛 Troubleshooting

### Erro de CORS
- Verifique se o Google Apps Script está deployado corretamente
- Confirme que o acesso está configurado como "Qualquer pessoa"

### Dados não aparecem
- Verifique se o `SPREADSHEET_ID` está correto
- Confirme que as abas têm os nomes exatos especificados

### Excel com erros
- Certifique-se de que os dados não contêm valores `null` ou `undefined`
- Verifique se todas as obras têm o array `materiais` definido

## 📄 Licença

Projeto proprietário - Todos os direitos reservados

## 👥 Equipe

- Desenvolvimento e Arquitetura: Sistema Cadastro de Materiais
- Versão: 1.0.0
- Data de Release: 2025

## 🔄 Changelog

### v1.0.0 (2025-10-04)
- ✨ Sistema completo de cadastro de obras e materiais
- 📊 Exportação para Excel com múltiplas abas
- 🔍 Busca e filtros avançados
- 🛡️ Validação e sanitização de dados
- 🎨 Interface responsiva e moderna
- 🔐 Rate limiting e segurança implementados