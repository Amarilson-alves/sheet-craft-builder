# 🚀 Roadmap de Melhorias - Sistema de Cadastro de Materiais

## Versão Atual: v1.0
**Última Atualização**: 2025-10-04

---

## 🎯 Melhorias de Alta Prioridade

### 1. Dashboard Analytics
**Status**: 🔴 Não Iniciado  
**Prioridade**: Alta  
**Estimativa**: 2-3 semanas  

**Descrição**:
Painel de controle com métricas e visualizações para gestão estratégica.

**Funcionalidades**:
- 📊 Gráficos de materiais mais utilizados (Top 10)
- 📅 Timeline de obras por período (diário, semanal, mensal)
- 👷 Métricas de consumo por técnico
- ⚠️ Indicadores de estoque crítico (materiais com quantidade < limite)
- 💰 Análise de custo por categoria de material
- 📈 Tendências de consumo ao longo do tempo

**Tecnologias Sugeridas**:
- Recharts (já instalado) para gráficos
- TanStack Table para tabelas avançadas
- React Hook Form para filtros

**Impacto**:
- ✅ Decisões baseadas em dados
- ✅ Identificação rápida de problemas
- ✅ Planejamento de compras otimizado

---

### 2. Sistema de Notificações
**Status**: 🔴 Não Iniciado  
**Prioridade**: Alta  
**Estimativa**: 2 semanas  

**Descrição**:
Sistema proativo de alertas para gestão de estoque e obras.

**Funcionalidades**:
- 🔔 Alertas de estoque baixo (threshold configurável)
- 📋 Notificações de obras pendentes
- 📧 Resumo diário por email para gestores
- 📱 Integração com WhatsApp Business API
- 🔄 Notificações push no navegador (Web Push)
- ⏰ Lembretes programados

**Implementação Técnica**:
- Web Push API para notificações no navegador
- Supabase Edge Functions para envio de emails
- Webhook para WhatsApp Business
- Cron jobs no Google Apps Script

**Impacto**:
- ✅ Prevenção de rupturas de estoque
- ✅ Melhor acompanhamento de obras
- ✅ Comunicação proativa com equipe

---

### 3. Modo Offline (PWA)
**Status**: 🔴 Não Iniciado  
**Prioridade**: Alta  
**Estimativa**: 3 semanas  

**Descrição**:
Transformar o sistema em PWA com capacidades offline para técnicos em campo.

**Funcionalidades**:
- 📴 Cadastro de obras sem conexão (sync automático)
- 💾 Cache de materiais e dados frequentes
- 📲 Instalação como app nativo no celular
- 🔄 Sincronização inteligente em background
- ⚡ Indicador de status de conexão
- 📦 Service Worker para cache estratégico

**Implementação Técnica**:
- Vite PWA Plugin
- IndexedDB para storage local
- Service Worker para cache
- Background Sync API
- Workbox para estratégias de cache

**Arquivos a Criar**:
- `vite.config.ts` - Configuração PWA
- `src/sw.ts` - Service Worker customizado
- `src/lib/offline.ts` - Gerenciamento offline
- `manifest.json` - Web App Manifest

**Impacto**:
- ✅ Trabalho em áreas sem sinal
- ✅ Performance melhorada
- ✅ Experiência mobile nativa
- ✅ Diferencial competitivo

---

### 4. Autenticação e Permissões
**Status**: 🔴 Não Iniciado  
**Prioridade**: Alta  
**Estimativa**: 2-3 semanas  

**Descrição**:
Sistema completo de autenticação com diferentes níveis de acesso.

**Funcionalidades**:
- 🔐 Login com Google/Email
- 👥 Níveis de acesso:
  - **Admin**: Acesso total
  - **Gestor**: Visualizar tudo, editar materiais
  - **Técnico**: Apenas cadastrar obras
- 📜 Histórico de alterações (audit log)
- 🔒 Proteção de rotas por permissão
- 📝 Registro de ações (quem fez o quê e quando)

**Implementação Técnica**:
- Lovable Cloud (Supabase Auth)
- RLS Policies para segurança
- Middleware de autorização
- Tabelas: users, roles, audit_logs

**Tabelas Necessárias**:
```sql
-- users (estende auth.users do Supabase)
-- roles: id, name, permissions
-- user_roles: user_id, role_id
-- audit_logs: id, user_id, action, table, old_data, new_data, timestamp
```

**Impacto**:
- ✅ Segurança robusta
- ✅ Rastreabilidade completa
- ✅ Compliance com LGPD

---

## 📊 Melhorias de Média Prioridade

### 5. Relatórios Avançados
**Status**: 🔴 Não Iniciado  
**Prioridade**: Média  
**Estimativa**: 2 semanas  

**Funcionalidades**:
- 📉 Comparativo mensal de consumo
- 💵 Custo por obra (adicionar campo "preço" aos materiais)
- 🏆 Ranking de técnicos por produtividade
- 📊 Relatório de aproveitamento de materiais
- 📅 Previsão de demanda baseada em histórico
- 📄 Exportação em múltiplos formatos (PDF, CSV, Excel)

**Campos Novos**:
- `materiais.preco_unitario` (decimal)
- `materiais.fornecedor_id` (foreign key)
- `obras.custo_total` (calculado)

---

### 6. Gestão de Fornecedores
**Status**: 🔴 Não Iniciado  
**Prioridade**: Média  
**Estimativa**: 2 semanas  

**Funcionalidades**:
- 🏢 Cadastro de fornecedores por material
- 📜 Histórico de compras
- 📊 Previsão de reposição de estoque (ponto de pedido)
- 💰 Comparação de preços entre fornecedores
- ⏰ Alertas de prazo de entrega
- 📞 Contatos e informações dos fornecedores

**Novas Abas Google Sheets**:
- **Fornecedores**: id, nome, cnpj, contato, email, telefone
- **Compras**: id, fornecedor_id, material_sku, quantidade, preco, data
- **Estoque_Historico**: material_sku, quantidade_anterior, quantidade_nova, tipo (entrada/saída), data

---

### 7. Anexos e Fotos
**Status**: 🔴 Não Iniciado  
**Prioridade**: Média  
**Estimativa**: 2-3 semanas  

**Funcionalidades**:
- 📷 Upload de fotos da obra (antes/durante/depois)
- 📎 Anexar documentos (orçamentos, notas fiscais)
- ✍️ Assinatura digital do cliente
- 🗂️ Galeria de imagens por obra
- 🔍 Visualizador de documentos inline
- 💾 Armazenamento seguro na nuvem

**Implementação Técnica**:
- Supabase Storage para arquivos
- React Dropzone para upload
- PDF.js para visualização de PDFs
- Canvas API para assinatura digital
- Compressão de imagens antes do upload

**Limites Sugeridos**:
- Foto: max 5MB, formatos jpg/png/webp
- Documento: max 10MB, formatos pdf/doc/xls
- Máximo 10 arquivos por obra

---

### 8. Busca Geográfica
**Status**: 🔴 Não Iniciado  
**Prioridade**: Média  
**Estimativa**: 2-3 semanas  

**Funcionalidades**:
- 🗺️ Mapa interativo de obras por região
- 🚗 Otimização de rotas para técnicos
- 📍 Filtros por proximidade/raio
- 🏙️ Agrupamento por cidade/bairro
- 📊 Heatmap de densidade de obras
- 🧭 Navegação integrada (Google Maps/Waze)

**Implementação Técnica**:
- React Leaflet ou Google Maps API
- Geocoding para converter endereços em coordenadas
- Algoritmo de roteamento (Google Directions API)
- Clustering de marcadores

**Novos Campos**:
- `obras.latitude` (decimal)
- `obras.longitude` (decimal)
- `obras.coordenadas_confirmadas` (boolean)

---

## 🎨 Melhorias de UX/UI

### 9. Scanner de Código de Barras
**Status**: 🔴 Não Iniciado  
**Prioridade**: Média  
**Estimativa**: 1 semana  

**Funcionalidades**:
- 📱 Leitura de SKU via câmera do celular
- ⚡ Seleção rápida de materiais
- 🔍 Verificação automática de estoque
- 📦 Suporte a QR Code e Código de Barras
- 🎯 Feedback visual de scan bem-sucedido

**Bibliotecas Sugeridas**:
- `react-zxing` ou `html5-qrcode`
- Camera API do navegador

---

### 10. Atalhos e Templates
**Status**: 🔴 Não Iniciado  
**Prioridade**: Baixa  
**Estimativa**: 1 semana  

**Funcionalidades**:
- ⭐ Obras favoritas/recorrentes
- 📋 Templates de kits de materiais
  - Ex: "Kit Instalação Residencial"
  - Ex: "Kit Manutenção Preventiva"
- 📄 Copiar obra anterior (duplicar)
- ⚡ Atalhos de teclado (Ctrl+N, Ctrl+S, etc)
- 🔖 Materiais mais usados por técnico

---

### 11. Dark Mode Completo
**Status**: 🟡 Parcialmente Implementado  
**Prioridade**: Baixa  
**Estimativa**: 3 dias  

**Pendências**:
- ✅ Sistema já tem tokens CSS
- 🔴 Refinar cores de alguns componentes
- 🔴 Toggle manual (atualmente apenas system)
- 🔴 Salvar preferência por usuário
- 🔴 Transição suave entre temas

**Componentes a Revisar**:
- Modais com fundo escuro
- Badges e alertas
- Gráficos e tabelas

---

## 🔧 Melhorias Técnicas

### 12. Testes Automatizados
**Status**: 🟡 Parcialmente Implementado  
**Prioridade**: Alta  
**Estimativa**: 2 semanas  

**Situação Atual**:
- ✅ Vitest configurado
- ✅ Testing Library instalada
- 🔴 Poucos testes escritos

**Metas**:
- 🎯 Testes E2E com Playwright
- 🎯 Testes de integração com Mock do GAS
- 🎯 Coverage mínimo de 80%
- 🎯 CI/CD com GitHub Actions

**Casos de Teste Prioritários**:
1. Fluxo completo de cadastro de obra
2. Seleção e ajuste de materiais
3. Exportação para Excel
4. CRUD de materiais (admin)
5. Validações de formulários

---

### 13. Performance
**Status**: 🔴 Não Iniciado  
**Prioridade**: Média  
**Estimativa**: 1 semana  

**Otimizações**:
- ⚡ Lazy loading de rotas
- 📜 Virtual scrolling para listas grandes
- 🖼️ Compressão de imagens automática
- 🗜️ Code splitting por rota
- 📦 Bundle analyzer para identificar bloat
- 🚀 Prefetch de dados críticos

**Métricas Alvo**:
- Lighthouse Score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Bundle size < 500KB (gzipped)

---

### 14. Monitoramento e Observabilidade
**Status**: 🔴 Não Iniciado  
**Prioridade**: Média  
**Estimativa**: 1 semana  

**Ferramentas**:
- 🐛 Sentry para error tracking
- 📊 Google Analytics para uso
- 📝 Logs estruturados (Winston/Pino)
- 🔍 Supabase Logs para backend
- 📈 Uptime monitoring (UptimeRobot)

**Eventos a Rastrear**:
- Cadastro de obra (sucesso/erro)
- Exportação de Excel
- Tempo de carregamento de materiais
- Erros de validação mais comuns
- Uso de filtros e buscas

---

## 🎁 Funcionalidades Extras

### 15. Integração WhatsApp
**Prioridade**: Baixa  
**Estimativa**: 1 semana  

- Enviar resumo da obra para o cliente
- Notificações para gestores
- Confirmação de materiais recebidos

---

### 16. Importação em Massa
**Prioridade**: Baixa  
**Estimativa**: 1 semana  

- Upload de CSV/Excel para cadastrar materiais
- Importar obras de sistemas legados
- Validação e preview antes de importar

---

### 17. Multi-idioma (i18n)
**Prioridade**: Baixa  
**Estimativa**: 1 semana  

- Suporte para PT-BR, EN, ES
- React i18next
- Seletor de idioma no header

---

## 📋 Priorização Recomendada

### Sprint 1 (Imediato)
1. ✅ **Modo Offline (PWA)** - Alto impacto para campo
2. ✅ **Dashboard Analytics** - Valor para gestão

### Sprint 2 (Curto Prazo)
3. ✅ **Autenticação e Permissões** - Segurança crítica
4. ✅ **Sistema de Notificações** - Proatividade

### Sprint 3 (Médio Prazo)
5. ✅ **Relatórios Avançados** - Insights estratégicos
6. ✅ **Anexos e Fotos** - Documentação visual
7. ✅ **Testes Automatizados** - Qualidade

### Sprint 4+ (Longo Prazo)
8. Gestão de Fornecedores
9. Busca Geográfica
10. Scanner de Código de Barras
11. Demais melhorias

---

## 💡 Notas de Implementação

### Dependências a Adicionar
```json
{
  "dependencies": {
    "workbox-window": "^7.0.0",
    "idb": "^8.0.0",
    "react-leaflet": "^4.2.1",
    "react-zxing": "^2.0.0",
    "@sentry/react": "^7.100.0"
  },
  "devDependencies": {
    "vite-plugin-pwa": "^0.17.0",
    "@playwright/test": "^1.40.0",
    "lighthouse": "^11.0.0"
  }
}
```

### Estrutura de Pastas Futura
```
src/
├── features/          # Feature-based organization
│   ├── analytics/
│   ├── auth/
│   ├── notifications/
│   ├── offline/
│   └── reports/
├── shared/            # Código compartilhado
│   ├── components/
│   ├── hooks/
│   └── utils/
└── infrastructure/    # Setup técnico
    ├── pwa/
    ├── monitoring/
    └── testing/
```

---

## 📊 Métricas de Sucesso

### KPIs por Melhoria
- **PWA**: Taxa de instalação > 30%
- **Analytics**: Tempo de decisão reduzido em 50%
- **Notificações**: Redução de 80% em rupturas de estoque
- **Auth**: Zero incidentes de segurança
- **Performance**: Lighthouse score > 90

---

## 🔄 Versionamento

### v1.0 - Atual (2025-10-04)
- Sistema base completo
- CRUD de materiais e obras
- Exportação Excel
- Validação e segurança básica

### v1.1 - Planejado
- PWA com modo offline
- Dashboard Analytics

### v1.2 - Planejado
- Autenticação e permissões
- Sistema de notificações

### v2.0 - Futuro
- Recursos avançados
- Integrações externas
- Mobile nativo (Capacitor)

---

**Documento criado em**: 2025-10-04  
**Última revisão**: 2025-10-04  
**Responsável**: Equipe de Desenvolvimento
