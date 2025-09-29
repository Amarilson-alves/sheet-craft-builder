# Sheet Craft Builder

Sistema para cadastro de materiais e obras para técnicos.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Data Fetching**: TanStack Query (React Query)
- **Backend**: Google Apps Script
- **Testing**: Vitest + Testing Library
- **Code Quality**: ESLint + Prettier + Husky

## 📦 Instalação

```bash
# Clone o repositório
git clone <YOUR_GIT_URL>
cd sheet-craft-builder

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com sua URL do Google Apps Script
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
VITE_API_BASE_URL=https://script.google.com/macros/s/SEU_SCRIPT_ID/exec
```

### Google Apps Script

O backend utiliza Google Apps Script com os seguintes endpoints:

- `GET ?action=getMaterials` - Lista todos os materiais
- `POST action=saveObra` - Salva uma nova obra

## 🏃‍♂️ Scripts

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview da build
npm run preview

# Testes
npm run test          # Executa todos os testes
npm run test:watch    # Executa testes em modo watch
npm run coverage      # Gera relatório de cobertura

# Code Quality
npm run typecheck     # Verifica tipos TypeScript
npm run lint          # Executa ESLint
npm run format        # Formata código com Prettier
```

## 🎯 Funcionalidades

### ✅ Implementado

- **Busca Incremental de Materiais**: Campo de busca que filtra materiais por prefixo
- **Filtros Avançados**: Por categoria (Interno/Externo) e disponibilidade
- **Navegação por Teclado**: ↑/↓ para navegar, Enter para selecionar, Esc para fechar
- **Acessibilidade**: ARIA labels, foco visível, navegação completa por teclado
- **Responsividade**: Design mobile-first
- **Validação**: Formulários com validação em tempo real
- **Error Handling**: Tratamento robusto de erros de rede
- **TypeScript**: Tipagem estrita com validação de ambiente

### 🔄 Melhorias da Refatoração

1. **Substituição dos botões de materiais** por campo de busca incremental
2. **Infraestrutura de desenvolvimento** completa (ESLint, Prettier, testes, CI)
3. **Tipagem TypeScript** estrita com validação de environment
4. **HTTP client** com timeout e tratamento de erros
5. **React Query** para cache e gerenciamento de estado
6. **Testes automatizados** com Vitest
7. **CI/CD** com GitHub Actions

## 🏗️ Arquitetura

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn)
│   └── MaterialSearch/ # Busca de materiais
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
├── pages/              # Páginas da aplicação
├── services/           # Camada de dados/API
├── types/              # Definições de tipos
└── test/               # Configuração de testes
```

## 🎨 Design System

O projeto utiliza um design system baseado em:
- **Cores**: Tokens semânticos definidos no `index.css`
- **Componentes**: shadcn/ui customizados
- **Responsividade**: Mobile-first com Tailwind CSS
- **Acessibilidade**: WCAG 2.1 Level AA

## 🔄 CI/CD

GitHub Actions executando:
- ✅ TypeScript type checking
- ✅ ESLint linting  
- ✅ Tests com Vitest
- ✅ Build de produção

## 📱 Uso

### Cadastro de Obra

1. Acesse a página "Campo"
2. Preencha os dados da obra (técnico, endereço, tipo)
3. Use o campo de busca para encontrar materiais
4. Ajuste as quantidades conforme necessário
5. Salve a obra

### Busca de Materiais

- Digite qualquer parte do nome ou SKU do material
- Use os filtros para refinar a busca
- Navegue com as setas do teclado
- Pressione Enter para selecionar

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.