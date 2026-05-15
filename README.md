# FoodControl

> App mobile de controle de validade e inventário de alimentos domésticos.  
> Objetivo: reduzir desperdício alimentar via monitoramento automatizado e alertas inteligentes.

---

## Problema

Famílias brasileiras descartam ~128,8 kg de alimentos por ano (≈ R$ 1.000) por falta de visibilidade do estoque doméstico.

## Solução

Cadastro de produtos com data de validade (manual ou via código de barras), classificação automática por status (semáforo verde/amarelo/vermelho), alertas locais e métricas de aproveitamento mensal.

---

## Stack

| Camada         | Tecnologia                                            |
| -------------- | ----------------------------------------------------- |
| Mobile         | React Native + Expo (managed workflow)                |
| Linguagem      | TypeScript (strict)                                   |
| Navegação      | Expo Router (file-based)                              |
| Estado         | React Query + Zustand/Context                         |
| Formulários    | React Hook Form + Zod                                 |
| UI             | react-native-reusables + NativeWind v4                |
| Backend        | Supabase (Postgres + Auth + Storage + Edge Functions) |
| Notificações   | expo-notifications (locais)                           |
| Câmera/Barcode | expo-camera + expo-image-picker                       |
| Imagens        | expo-image (exibição), expo-image-picker (galeria)    |
| API externa    | Cosmos by Bluesoft (lookup GTIN/EAN)                  |

---

## Pré-requisitos

- Node.js 18+
- Expo CLI
- Conta Supabase
- (Opcional) Token Cosmos by Bluesoft

---

## Configuração

1. Instale dependências:

   ```bash
   npm install
   ```

2. Crie `.env` na raiz com:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=
   EXPO_PUBLIC_SUPABASE_ANON_KEY=
   EXPO_PUBLIC_COSMOS_TOKEN=
   ```

3. Aplique o schema no Supabase (tabelas, RLS, triggers) conforme `CLAUDE.md` seção 4.

4. Inicie o app:

   ```bash
   npx expo start
   ```

---

## Estrutura de Pastas

```
app/                    # Rotas (Expo Router)
  (auth)/               # login, register, forgot-password
  (tabs)/               # Home, Stats, Profile
  product/              # [id], new, scan, edit/[id]
components/
  ui/                   # Botões, inputs, cards
  product/              # ProductCard, StatusBadge, CountdownLabel
  forms/                # ProductForm, RemoveProductSheet
lib/                    # supabase, status, date utils, notifications
services/               # cosmos.ts (API Bluesoft)
features/               # inventory, auth, stats, notifications
schemas/                # Zod schemas compartilhados
types/                  # Tipos TS (Supabase gerado, Cosmos)
constants/              # categories.ts, locations.ts
```

---

## Lógica de Status (Semáforo)

```ts
function getStatus(expirationDate: Date, warningDays = 5) {
  const diff = differenceInDays(startOfDay(expirationDate), startOfDay(new Date()));
  if (diff < 0) return 'expired'; // 🔴
  if (diff <= warningDays) return 'warning'; // 🟡
  return 'safe'; // 🟢
}
```

Status **nunca é persistido** — calculado em tempo real no cliente.

---

## Roadmap

- **Fase 1 — MVP ✅:** Auth + CRUD de produtos + lista com semáforo + remoção com histórico
- **Fase 2 — Inteligência (parcial ✅):** Scanner de barcode + imagem no formulário + estatísticas com filtro de período ✅ | Notificações locais + configurações (pendente)
- **Fase 3 — UX premium:** Upload de imagem para Supabase Storage + busca avançada
- **Fase 4 — Polimento:** Onboarding + animações + testes

---

## Convenções

- Arquivos: `kebab-case` | Componentes: `PascalCase`
- Hooks: prefixo `use*`, retornam `{ data, isLoading, error }`
- Mutations: infinitivo (`createProduct`, `removeProduct`)
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`)
