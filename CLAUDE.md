# FoodControl

> Aplicativo mobile de controle de validade e inventário de alimentos domésticos.
> Objetivo: reduzir o desperdício alimentar através de monitoramento automatizado e alertas inteligentes.

---

## 1. Contexto do Projeto

**Problema:** famílias brasileiras descartam ~128,8 kg de alimentos por ano (≈ R$ 1.000), em grande parte por falta de visibilidade do que existe em casa, do que está prestes a vencer e do que precisa ser consumido com urgência.

**Solução:** app que permite cadastrar produtos com data de validade (manual ou via leitura de código de barras), classificar automaticamente por status de validade (semáforo), enviar alertas locais e medir o aproveitamento mensal (consumido vs. descartado).

**Público-alvo:** adultos responsáveis pela gestão doméstica (chefes de família, casais, estudantes que moram sozinhos). Perfil tecnográfico básico.

---

## 2. Stack Técnica

| Camada             | Tecnologia                                                     |
| ------------------ | -------------------------------------------------------------- |
| Mobile             | React Native + Expo (managed workflow)                         |
| Linguagem          | TypeScript (strict)                                            |
| Navegação          | Expo Router (file-based) ou React Navigation (stack + tabs)    |
| Estado             | React Query (server state) + Zustand ou Context (client state) |
| Formulários        | React Hook Form + Zod                                          |
| UI                 | react-native-reusables + NativeWind v4                         |
| Backend            | Supabase (Postgres + Auth + Storage + Edge Functions)          |
| Notificações       | `expo-notifications` (locais)                                  |
| Câmera/Barcode     | `expo-camera` ou `expo-barcode-scanner`                        |
| API externa        | Cosmos by Bluesoft (lookup GTIN/EAN)                           |
| Storage de imagens | Supabase Storage (bucket `product-images`)                     |

### Variáveis de ambiente esperadas (`.env`)

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_COSMOS_TOKEN=
```

> Tokens sensíveis (service_role do Supabase, secrets de Edge Functions) **nunca** devem ir para o cliente — apenas em Edge Functions.

---

## 3. Estrutura de Pastas Sugerida

```
app/                    # Rotas (Expo Router)
  (auth)/
    login.tsx
    register.tsx
    forgot-password.tsx
  (tabs)/
    _layout.tsx
    index.tsx           # Home / Inventário
    stats.tsx           # Estatísticas
    profile.tsx         # Perfil
  product/
    _layout.tsx
    [id].tsx            # Detalhes do produto
    new.tsx             # Cadastro
    scan.tsx            # Scanner de código de barras
    edit/
      _layout.tsx
      [id].tsx          # Edição
  _layout.tsx
components/
  ui/                   # Botões, inputs, cards (react-native-reusables)
  scanner/              # ViewportOverlay, ResultCard, scanner-theme
  product/              # ProductCard, StatusBadge, CountdownLabel
  forms/                # ProductForm, RemoveProductSheet
hooks/                  # Hooks reutilizáveis (use-color-scheme, etc.)
lib/
  supabase.ts           # client
  theme.ts              # mirror TypeScript dos tokens CSS do design system
  status.ts             # cálculo do semáforo
  date.ts               # utils (diffInDays, format pt-BR)
  notifications.ts
  utils.ts
services/
  cosmos.ts             # wrapper da API Cosmos (Bluesoft)
features/
  inventory/            # hooks, queries e mutations de produtos
  auth/
  stats/
  notifications/        # registro de tokens, agendamento
schemas/                # Zod schemas
types/                  # tipos TS (Supabase gerado, Cosmos, etc.)
utils/                  # funções utilitárias puras
constants/
  categories.ts
  locations.ts
```

---

## 4. Banco de Dados (Supabase / Postgres)

### 4.1 Enums

```sql
create type product_category as enum (
  'laticinios', 'graos', 'bebidas', 'carnes',
  'congelados', 'hortifruti', 'padaria', 'enlatados',
  'massas', 'doces', 'temperos', 'outros'
);

create type storage_location as enum (
  'despensa', 'geladeira', 'congelador'
);

create type removal_destination as enum (
  'consumido', 'descartado'
);
```

### 4.2 Tabelas

#### `profiles` (1:1 com `auth.users`)

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  warning_days_before_expiry int not null default 5, -- janela do "amarelo"
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

#### `products` — inventário ativo

```sql
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  image_url text,
  barcode text,                              -- GTIN/EAN, opcional
  category product_category not null default 'outros',
  storage_location storage_location not null default 'despensa',
  quantity numeric(10,2) not null default 1 check (quantity >= 0),
  expiration_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_user_expiry_idx
  on public.products (user_id, expiration_date);

create index products_user_category_idx
  on public.products (user_id, category);
```

> **Observação:** o status (vermelho/amarelo/verde) é **calculado em tempo real** no cliente a partir de `expiration_date` e `profiles.warning_days_before_expiry`. Não é coluna persistida.

#### `product_removals` — histórico para o painel de estatísticas

```sql
create table public.product_removals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,            -- snapshot (produto pode ser deletado)
  category product_category not null,
  quantity_removed numeric(10,2) not null check (quantity_removed > 0),
  destination removal_destination not null,
  was_expired boolean not null,          -- snapshot do status no momento da remoção
  removed_at timestamptz not null default now()
);

create index product_removals_user_date_idx
  on public.product_removals (user_id, removed_at desc);
```

> **Por que snapshot e não FK?** O produto pode ser excluído, mas o histórico (e a métrica de aproveitamento) precisa permanecer.

### 4.3 Row Level Security (obrigatório)

Habilitar RLS em **todas** as tabelas. Padrão de policy:

```sql
alter table public.products enable row level security;

create policy "Users see own products"
  on public.products for select using (auth.uid() = user_id);

create policy "Users insert own products"
  on public.products for insert with check (auth.uid() = user_id);

create policy "Users update own products"
  on public.products for update using (auth.uid() = user_id);

create policy "Users delete own products"
  on public.products for delete using (auth.uid() = user_id);
```

Replicar o mesmo padrão para `profiles` e `product_removals`.

### 4.4 Triggers úteis

- `updated_at` automático em `profiles` e `products`.
- Trigger pós-`auth.users` insert para criar linha em `profiles`.
- (Opcional) Trigger antes do `delete` em `products` para gravar em `product_removals` caso a deleção venha de um fluxo que não passou pelo modal de remoção.

---

## 5. Telas e Fluxos

### 5.1 Auth

#### `LoginScreen`

- **Propósito:** autenticar usuário existente via e-mail/senha (Supabase Auth).
- **Campos:** e-mail, senha.
- **Ações:** "Entrar", "Esqueci minha senha", "Criar conta".
- **Validação:** Zod (e-mail válido, senha mín. 6).
- **Pós-login:** redireciona para `(tabs)/index`.

#### `RegisterScreen`

- **Propósito:** cadastro de novo usuário.
- **Campos:** nome completo, e-mail, senha, confirmar senha.
- **Lógica:** após `signUp` bem-sucedido, criar linha em `profiles` (via trigger ou explicitamente).
- **Confirmação por e-mail:** seguir configuração do Supabase; mostrar tela "Verifique seu e-mail" se exigido.

#### `ForgotPasswordScreen`

- **Propósito:** envio de link de reset via Supabase.
- **Campos:** e-mail.

---

### 5.2 Inventário (Tab principal)

#### `HomeScreen` (Inventário)

- **Propósito:** visualização principal do estoque do usuário, com destaque para itens críticos.
- **Layout:**
  - **Header:** saudação + resumo rápido ("3 itens vencendo, 1 vencido").
  - **Filtros (chips):** Todos | Despensa | Geladeira | Congelador.
  - **Filtro secundário:** dropdown de categoria.
  - **Ordenação padrão:** por `expiration_date asc` (mais urgente primeiro).
  - **Lista:** `ProductCard` com imagem, nome, categoria, quantidade, badge de status e label de countdown.
  - **FAB:** "+ Adicionar produto".
  - **Pull-to-refresh** e busca por nome.
- **Lógica de status (semáforo):**
  ```ts
  function getStatus(expirationDate: Date, warningDays = 5) {
    const today = startOfDay(new Date());
    const exp = startOfDay(expirationDate);
    const diff = differenceInDays(exp, today);
    if (diff < 0) return 'expired'; // 🔴
    if (diff <= warningDays) return 'warning'; // 🟡
    return 'safe'; // 🟢
  }
  ```
- **Label de countdown:**
  - `diff < 0` → "Venceu há N dia(s)"
  - `diff === 0` → "Vence hoje"
  - `diff === 1` → "Vence amanhã"
  - `diff > 1` → "Vence em N dias"

#### `ProductDetailScreen` (`/product/[id]`)

- **Propósito:** ver detalhes completos de um produto.
- **Conteúdo:** imagem grande, nome, categoria, local, quantidade, data de validade, status, código de barras (se houver).
- **Ações:** Editar | Remover (abre `RemoveProductSheet`).

#### `AddProductScreen` (`/product/new`)

- **Propósito:** cadastro manual ou assistido por scanner.
- **Campos do formulário:**

| Campo                  | Tipo                    | Obrigatório | Notas                                             |
| ---------------------- | ----------------------- | ----------- | ------------------------------------------------- |
| Imagem                 | Picker (galeria/câmera) | Não         | Upload para `product-images/{user_id}/{uuid}.jpg` |
| Nome                   | Texto                   | **Sim**     | Auto-preenchido se vier do scanner                |
| Código de barras       | Texto                   | Não         | Preenchido automaticamente após scan              |
| Categoria              | Dropdown                | **Sim**     | Enum `product_category`                           |
| Quantidade             | Numérico                | **Sim**     | Default 1                                         |
| Local de armazenamento | Segmented control       | **Sim**     | Despensa/Geladeira/Congelador                     |
| Data de validade       | Date picker             | **Sim**     | Não pode ser passada (warning, não block)         |

- **Botão destacado:** "📷 Escanear código de barras" → leva para `BarcodeScannerScreen`.
- **Validação:** Zod schema (compartilhado com edição).

#### `EditProductScreen` (`/product/edit/[id]`)

- **Propósito:** mesma UI do Add, pré-preenchida.
- **Importante:** ao salvar, **não** registrar em `product_removals` (isso só ocorre na remoção).

#### `BarcodeScannerScreen` (`/product/scan`)

- **Propósito:** ler código de barras (GTIN/EAN) via câmera.
- **Fluxo:**
  1. Permissão de câmera (`expo-camera`).
  2. Detectar código.
  3. Chamar `GET https://api.cosmos.bluesoft.com.br/gtins/{gtin}` com header `X-Cosmos-Token`.
  4. Sucesso → retornar para `AddProductScreen` com dados pré-preenchidos (nome, categoria mapeada, imagem se disponível).
  5. Falha (404 ou erro) → retornar com apenas o `barcode` preenchido + toast "Produto não encontrado, preencha manualmente".
- **Mapeamento de categoria:** a Cosmos retorna `gpc.description`/`bsin` — criar função `mapCosmosToCategory()` em `services/cosmos.ts` que normaliza para os enums internos.
- **Rate limiting:** plano gratuito da Cosmos tem limite mensal — cachear resultados em tabela `barcode_cache` (opcional, fase 2) ou em AsyncStorage.

#### `RemoveProductSheet` (modal/bottom sheet)

- **Propósito:** capturar o destino do produto ao removê-lo.
- **Campos:**
  - Quantidade a remover (default = quantity total).
  - Destino: **Consumido** ou **Descartado** (botões grandes, com ícone).
- **Lógica ao confirmar:**
  1. Inserir registro em `product_removals` com snapshot (`product_name`, `category`, `quantity_removed`, `destination`, `was_expired = status === 'expired'`).
  2. Se `quantity_removed >= product.quantity` → `delete` do produto.
  3. Caso contrário → `update` decrementando a quantidade.
- **Por que isso importa:** alimenta o painel de estatísticas e a métrica de "desperdício evitado".

---

### 5.3 Estatísticas

#### `StatsScreen` (Tab)

- **Propósito:** mostrar ao usuário o impacto do uso do app.
- **Cards principais (último mês corrente):**
  - **Taxa de aproveitamento:** `consumido / (consumido + descartado) * 100`.
  - **Itens consumidos** (count + soma de quantidade).
  - **Itens descartados** (count + soma de quantidade).
  - **Desperdício evitado:** count de itens consumidos antes do vencimento (`destination = 'consumido' AND was_expired = false`).
- **Gráficos sugeridos:**
  - Barra/pizza: consumido vs descartado por categoria.
  - Linha: taxa de aproveitamento mês a mês (últimos 6 meses).
- **Filtro de período:** 7 dias / 30 dias / 90 dias / 12 meses.
- **Implementação:** preferir queries SQL agregadas (criar view ou RPC `get_user_stats(period)`).

---

### 5.4 Perfil

#### `ProfileScreen` (Tab)

- **Conteúdo:** avatar, nome, e-mail.
- **Ações:** Editar perfil | Configurações | Sobre | **Sair**.

#### `SettingsScreen`

- **Configurações expostas:**
  - **Dias de antecedência do alerta amarelo** (default 5, range 1–30) → grava em `profiles.warning_days_before_expiry`.
  - **Notificações habilitadas** (toggle) → `profiles.notifications_enabled`.
  - **Horário diário do alerta** (ex.: 09:00) → preferência local (`AsyncStorage`).
- **Ao alterar:** reagendar todas as notificações locais (ver seção 6).

---

## 6. Notificações Locais

### 6.1 Estratégia

- **100% locais** via `expo-notifications` (sem custo, sem servidor, atende ao escopo do TCC).
- **Quando agendar:**
  - Ao criar/editar/remover um produto → recalcular agendamentos do usuário.
  - Ao alterar `warning_days_before_expiry` → reagendar tudo.
- **Quando disparar (por produto):**
  - 1 notificação no dia em que entra na janela amarela (ex.: 5 dias antes do vencimento) às 09:00.
  - 1 notificação no dia do vencimento.
  - 1 notificação 1 dia após vencido.
- **Conteúdo:** "🟡 Leite vence em 3 dias" / "🔴 Iogurte venceu hoje".

### 6.2 Implementação resumida

```ts
// features/notifications/scheduler.ts
import * as Notifications from 'expo-notifications';

export async function scheduleProductNotifications(product: Product, warningDays: number) {
  // Cancelar agendamentos antigos para esse product.id (usar identifier = product.id-tipo)
  await cancelProductNotifications(product.id);

  const triggers = computeTriggers(product.expiration_date, warningDays); // [{date, body}]
  for (const t of triggers) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${product.id}-${t.kind}`,
      content: { title: 'FoodControl', body: t.body, sound: true },
      trigger: t.date,
    });
  }
}
```

> **Limite do iOS:** 64 notificações pendentes. Se o usuário tiver muitos produtos, priorizar os mais próximos do vencimento.

---

## 7. Integração Cosmos (Bluesoft)

- **Endpoint:** `GET https://api.cosmos.bluesoft.com.br/gtins/{gtin}.json`
- **Header:** `X-Cosmos-Token: {token}`, `User-Agent: Cosmos-API-Request`
- **Resposta relevante:**
  ```json
  {
    "gtin": 7891000100103,
    "description": "Leite Condensado Moça 395g",
    "thumbnail": "https://...",
    "gpc": { "description": "Leites/Cremes/Iogurtes" },
    "ncm": { ... }
  }
  ```
- **Segurança:** o token pode ir no cliente (é read-only e tem rate limit), mas o ideal é proxiar via Edge Function `lookup-gtin` para esconder o token e habilitar cache no servidor.

---

## 8. Regras de Negócio Importantes

1. **Status nunca é persistido** — sempre derivado de `expiration_date` + preferência do usuário.
2. **Soft delete via `product_removals`**: deletar um produto sem registrar destino é um anti-pattern; sempre passar pelo `RemoveProductSheet`.
3. **Edição não cria histórico** — só remoção.
4. **Multi-dispositivo:** não suportado em V1 (notificações são por dispositivo). Documentar no roadmap.
5. **Internacionalização:** PT-BR fixo em V1.
6. **Datas:** usar `date` (não `timestamp`) para `expiration_date`. Comparar sempre em UTC ou em timezone do dispositivo de forma consistente — preferir `date-fns` com `startOfDay`.

---

## 9. Critérios de Qualidade

- **TypeScript strict** (sem `any`).
- **Tipos do Supabase gerados:** `npx supabase gen types typescript --project-id ... > src/types/database.ts`.
- **Schemas Zod compartilhados** entre formulário de criação e edição.
- **Sem hardcode de strings de UI** — usar arquivo de constantes (preparar para i18n).
- **Testes mínimos:** funções puras de `lib/status.ts` e `lib/date.ts` (countdown labels e classificação).
- **Acessibilidade básica:** `accessibilityLabel` em ícones e ações.

---

## 10. Roadmap por Fases (sugestão)

**Fase 1 — MVP funcional**

1. Setup Expo + Supabase + Auth.
2. Schema do banco + RLS.
3. CRUD de produtos (sem scanner, sem imagem).
4. Home com lista + filtros + status semáforo.
5. Modal de remoção + tabela `product_removals`.

**Fase 2 — Inteligência** 6. Notificações locais. 7. Tela de estatísticas. 8. Configurações (dias de aviso, toggle notif).

**Fase 3 — UX premium** 9. Scanner de barcode + integração Cosmos. 10. Upload de imagem (Supabase Storage). 11. Busca textual e ordenação avançada.

**Fase 4 — Polimento** 12. Onboarding. 13. Animações e empty states. 14. Testes e refino.

---

## 11. Convenções de Código

- **Nomes de arquivos:** `kebab-case` para arquivos, `PascalCase` para componentes.
- **Hooks:** prefixo `use*`, retornam `{ data, isLoading, error, ... }`.
- **Mutations:** funções nomeadas no infinitivo (`createProduct`, `removeProduct`).
- **Erros:** sempre tratados na camada de UI com toast/alert; nunca silenciar.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`).

---

## 12. Glossário

- **GTIN/EAN:** identificador padrão de código de barras (GTIN-13 = EAN-13 brasileiro).
- **Cosmos:** API pública da Bluesoft para lookup de produtos por GTIN.
- **Janela amarela:** intervalo, em dias, antes do vencimento que dispara o status "warning".
- **Aproveitamento:** % de itens removidos com destino "consumido" no período.

---

## 13. SEMPRE carregar no contexto

**Arquivos .md do diretório docs/**
