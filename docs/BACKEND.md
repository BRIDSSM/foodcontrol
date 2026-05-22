# Backend — Como funciona

O FoodControl não tem servidor próprio. Todo o backend roda no **Supabase**, que fornece:

- **Auth** — login, registro, sessão, tokens JWT
- **Database** — Postgres com acesso via `supabase-js` (PostgREST por baixo)
- **Storage** — bucket `product-images` para fotos de produtos
- **Row Level Security (RLS)** — cada usuário acessa só os próprios dados, direto no banco

---

## 1. Autenticação

### Como a sessão é mantida

```
supabase.auth.signInWithPassword()
       ↓
  Supabase Auth emite JWT
       ↓
  supabase-js salva token no SecureStore (expo-secure-store)
       ↓
  onAuthStateChange dispara → AuthProvider atualiza session
       ↓
  AuthGuard redireciona para (tabs) ou (auth) conforme estado
```

O `AuthProvider` (`contexts/auth.tsx`) escuta `onAuthStateChange` — qualquer mudança de sessão (login, logout, token refresh) chega automaticamente. Não é necessário verificar manualmente se o token expirou.

### Fluxos disponíveis

| Ação           | Método Supabase                                                               |
| -------------- | ----------------------------------------------------------------------------- |
| Login          | `supabase.auth.signInWithPassword({ email, password })`                       |
| Registro       | `supabase.auth.signUp({ email, password, options: { data: { full_name } } })` |
| Logout         | `supabase.auth.signOut()`                                                     |
| Reset de senha | `supabase.auth.resetPasswordForEmail(email)`                                  |

Ao fazer `signUp`, o trigger `on_auth_user_created` cria automaticamente uma linha em `public.profiles` com o `full_name` passado nos metadados.

### O que fica no cliente

```ts
const { session, user, isSignedIn, isLoading } = useAuth();
```

- `session` — JWT completo (útil para passar em chamadas externas)
- `user` — dados do usuário autenticado (`id`, `email`, `user_metadata`)
- `isLoading` — `true` enquanto `getSession()` resolve na inicialização (evita redirect flash)

---

## 2. Banco de dados

### Tabelas principais

| Tabela             | Propósito                                               |
| ------------------ | ------------------------------------------------------- |
| `profiles`         | Dados do usuário (nome, avatar, preferências de alerta) |
| `products`         | Inventário ativo                                        |
| `product_removals` | Histórico de remoções (consumido/descartado)            |
| `barcode_cache`    | Cache de lookups Cosmos por GTIN                        |

### RLS — por que o cliente acessa o banco diretamente com segurança

Todo acesso ao Supabase usa a **anon key** (pública). A segurança vem das **Row Level Security policies**, que rodam dentro do Postgres:

```sql
-- Exemplo: usuário só vê os próprios produtos
create policy "Users see own products"
  on public.products for select
  using (auth.uid() = user_id);
```

O JWT do usuário logado é validado automaticamente pelo Supabase em cada requisição. Sem JWT válido = sem dados. Nenhuma linha de outro usuário é acessível.

---

## 3. CRUD de produtos

Todas as operações usam **React Query** para cache, loading states e invalidação automática.

### Leitura

```ts
// Lista com filtros opcionais
const { data, isLoading, error } = useProducts({
  storage_location: 'geladeira', // opcional
  category: 'laticinios', // opcional
  search: 'leite', // opcional (ilike)
});

// Produto individual
const { data: product } = useProduct(id);
```

A query retorna produtos ordenados por `expiration_date asc` — os que vencem primeiro aparecem primeiro.

### Criação

```ts
const { mutate: createProduct, isPending } = useCreateProduct();

createProduct({
  name: 'Leite Integral',
  category: 'laticinios',
  storage_location: 'geladeira',
  quantity: 1,
  expiration_date: '2025-06-01',
  user_id: user.id, // vem do useAuth()
});
```

### Edição

```ts
const { mutate: updateProduct } = useUpdateProduct();

updateProduct({ id: product.id, quantity: 2 });
```

A edição **não** registra em `product_removals`. Histórico só é gerado na remoção.

### Remoção

```ts
const { mutate: removeProduct } = useRemoveProduct();

removeProduct({
  product,
  quantity_removed: 1,
  destination: 'consumido', // ou 'descartado'
  warningDays: 5, // vem de profiles.warning_days_before_expiry
});
```

O `useRemoveProduct` faz duas operações em sequência:

1. Insere em `product_removals` com snapshot (`product_name`, `category`, `was_expired`)
2. Se `quantity_removed >= product.quantity` → deleta o produto; caso contrário → decrementa a quantidade

O campo `was_expired` é calculado no momento da remoção usando `getStatus()` — captura se o item já estava vencido quando foi retirado.

---

## 4. Status de validade (semáforo)

O status **nunca é salvo no banco**. É sempre calculado em tempo real:

```ts
import { getStatus } from '@/lib/status';

const status = getStatus(product.expiration_date, warningDays);
// 'expired' | 'warning' | 'safe'
```

| Resultado   | Condição                                                |
| ----------- | ------------------------------------------------------- |
| `'expired'` | `diff < 0` — já venceu                                  |
| `'warning'` | `0 <= diff <= warningDays` — dentro da janela de alerta |
| `'safe'`    | `diff > warningDays` — ok                               |

`warningDays` vem de `profiles.warning_days_before_expiry` (default 5). O usuário pode alterar nas configurações.

Para exibir o label de countdown na UI:

```ts
import { getCountdownLabel } from '@/lib/date';

getCountdownLabel('2025-05-20'); // "Vence em 6 dias"
getCountdownLabel('2025-05-14'); // "Vence hoje"
getCountdownLabel('2025-05-10'); // "Venceu há 4 dias"
```

---

## 5. Lookup de código de barras (Cosmos)

O scanner lê um GTIN/EAN e consulta a API Cosmos da Bluesoft para preencher o formulário automaticamente.

### Fluxo

```
câmera detecta código
      ↓
useProductLookup().lookup(gtin)
      ↓
fetchCosmosProduct(gtin) — GET https://api.cosmos.bluesoft.com.br/gtins/{gtin}
      ↓
mapCosmosToCategory(product.category?.description)
      ↓
pré-preenche formulário (name, category, image_url)
```

### Mapeamento de categoria

A Cosmos retorna uma string livre como `"Leites/Cremes/Iogurtes"`. Essa string **não pode** ser usada diretamente no banco — o campo `category` é um enum Postgres com valores fixos.

A função `mapCosmosToCategory()` (`services/cosmos.ts`) busca por palavras-chave na string da Cosmos e retorna o enum interno correspondente. Se nenhuma palavra-chave bater, retorna `'outros'`. Isso garante que **nenhuma categoria inválida chega ao banco**, independente do que a API retornar.

```ts
mapCosmosToCategory('Leites/Cremes/Iogurtes'); // → 'laticinios'
mapCosmosToCategory('Bebidas Carbonatadas'); // → 'bebidas'
mapCosmosToCategory('Categoria Exótica XYZ'); // → 'outros' ← fallback
mapCosmosToCategory(null); // → 'outros' ← fallback
```

### Erros tratados

| Erro                  | Causa                           | Comportamento                               |
| --------------------- | ------------------------------- | ------------------------------------------- |
| `CosmosNotFoundError` | GTIN não encontrado (404)       | Formulário abre só com o barcode preenchido |
| `CosmosRequestError`  | Erro HTTP (5xx, etc.)           | Mensagem de erro, usuário preenche manual   |
| `CosmosConfigError`   | Token não configurado no `.env` | Mensagem de erro                            |
| Timeout (8s)          | API lenta / sem rede            | `AbortController` cancela a request         |

---

## 6. Imagem do produto

O formulário de cadastro permite adicionar uma imagem de duas formas:

1. **Via scanner** — quando a Cosmos retorna um `thumbnail`, a URL já é remota e é salva diretamente no banco.
2. **Via galeria** — `expo-image-picker` abre a galeria; a imagem é recortada em quadrado (1:1, qualidade 0.8) e retorna como URI local (`file://…`).

### Upload para Supabase Storage

Toda URI local é enviada para o bucket `product-images` antes de salvar o produto. A lógica fica em `features/storage/upload.ts`:

```ts
import { isLocalUri, uploadProductImage } from '@/features/storage/upload';

// No onSubmit de new.tsx e edit/[id].tsx:
let imageUrl = values.image_url ?? null;
if (imageUrl && isLocalUri(imageUrl)) {
  try {
    imageUrl = await uploadProductImage(imageUrl, user.id);
  } catch {
    imageUrl = null; // fallback: salva sem imagem
  }
}
```

**`isLocalUri(uri)`** — retorna `true` para `file://`, `content://` ou qualquer URI que não começa com `http`. Protege contra re-upload de URLs remotas (Cosmos ou URLs já armazenadas).

**`uploadProductImage(localUri, userId)`** — lê o arquivo como base64 via `expo-file-system/legacy` (a importação `/legacy` é necessária para acessar `EncodingType` no Expo SDK 54), decodifica com `base64-arraybuffer` e faz upload:

```
path no bucket: {userId}/{Date.now()}.{ext}
contentType:    image/jpeg | image/png | image/webp
```

Retorna a `publicUrl` do Supabase, que é salva em `products.image_url`.

**`deleteProductImage(publicUrl)`** — extrai o path a partir da URL pública e remove o arquivo do bucket. Chamado na deleção de produto quando há imagem.

### RLS do bucket

```sql
-- Apenas o dono da pasta pode fazer upload
create policy "Users upload own images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Leitura pública (URLs públicas funcionam sem autenticação)
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');
```

---

## 7. Perfil do usuário

O perfil fica na tabela `profiles` (1:1 com `auth.users`). O hook `useProfile()` (`features/profile/queries.ts`) busca os dados do usuário logado. O hook `useUpdateProfile()` faz o update e invalida o cache automaticamente.

### Campos relevantes

| Campo                        | Tipo      | Padrão | Descrição                                    |
| ---------------------------- | --------- | ------ | -------------------------------------------- |
| `full_name`                  | `text`    | —      | Nome exibido na tela de perfil               |
| `warning_days_before_expiry` | `int`     | `5`    | Dias antes do vencimento para alerta amarelo |
| `notifications_enabled`      | `boolean` | `true` | Liga/desliga alertas locais                  |

### Tela de configurações

Permite alterar `warning_days_before_expiry` (chips: 3/5/7/10/14/30 dias) e `notifications_enabled` (toggle). O botão "Salvar" só fica habilitado quando há alteração não salva em relação ao valor atual do banco.

---

## 8. Notificações locais

As notificações são 100% locais via `expo-notifications` — sem servidor, sem custo. Funcionam apenas em **development builds** e builds de produção; no Expo Go (SDK 53+) o módulo não está disponível.

### Guarda de ambiente

```ts
// app/_layout.tsx
import Constants from 'expo-constants';
const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  Notifications.setNotificationHandler({ ... });
}
// No useEffect de AuthGuard:
if (!isSignedIn || isExpoGo) return;
setupNotificationChannel()
  .then(() => requestNotificationPermissions())
  .catch(() => {});
```

### Quando notificações são agendadas

| Evento                                | Ação                                                                        |
| ------------------------------------- | --------------------------------------------------------------------------- |
| Produto criado                        | `scheduleProductNotifications(product, warningDays)`                        |
| Produto editado                       | `scheduleProductNotifications(product, warningDays)` (substitui anteriores) |
| Produto removido                      | `cancelProductNotifications(product.id)`                                    |
| `warning_days_before_expiry` alterado | `rescheduleAllNotifications(userId, warningDays)`                           |
| Notificações desabilitadas            | `Notifications.cancelAllScheduledNotificationsAsync()`                      |

### Triggers por produto

Para cada produto, até 3 notificações são agendadas às **09:00**:

| Kind      | Quando dispara                                       | Exemplo de body         |
| --------- | ---------------------------------------------------- | ----------------------- |
| `warning` | Dia em que entra na janela amarela (D - warningDays) | "Leite vence em 5 dias" |
| `expiry`  | Dia do vencimento                                    | "Leite vence hoje"      |
| `expired` | 1 dia após o vencimento                              | "Leite venceu ontem"    |

Triggers com data no passado são descartados silenciosamente (não são agendados).

### Limite do iOS

O iOS permite no máximo **64 notificações pendentes**. O scheduler respeita esse limite capturando no máximo **20 produtos** × 3 triggers = 60 agendamentos. Em `rescheduleAllNotifications`, os produtos são ordenados por `expiration_date asc` (mais urgentes primeiro) antes do corte.

### Identificadores

```ts
identifier: `${product.id}-warning`;
identifier: `${product.id}-expiry`;
identifier: `${product.id}-expired`;
```

O identificador único por produto+tipo permite cancelar e re-agendar sem duplicar notificações.

### Onde fica o código

```
features/notifications/
  permissions.ts   — setupNotificationChannel(), requestNotificationPermissions()
  scheduler.ts     — scheduleProductNotifications(), cancelProductNotifications(),
                     rescheduleAllNotifications()
```

---

## 9. Estatísticas

As stats são calculadas a partir da tabela `product_removals`. O hook `useStats(period)` (`features/stats/queries.ts`) busca os registros do período escolhido e agrega tudo no cliente.

### Períodos disponíveis

| Valor   | Janela                   |
| ------- | ------------------------ |
| `'7d'`  | últimos 7 dias           |
| `'30d'` | últimos 30 dias (padrão) |
| `'90d'` | últimos 90 dias          |
| `'12m'` | últimos 12 meses         |

### Métricas calculadas

| Métrica                | Fórmula                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| Taxa de aproveitamento | `consumidos / (consumidos + descartados) × 100`                    |
| Consumidos             | contagem de linhas com `destination = 'consumido'`                 |
| Descartados            | contagem de linhas com `destination = 'descartado'`                |
| Desperdício evitado    | consumidos onde `was_expired = false` (saiu antes de vencer)       |
| Por categoria          | agrupamento das contagens por `category`, ordenado pelo total desc |

### Cache e invalidação

A query key tem formato `['stats', period, userId]`. Ao consumir ou descartar um produto, `useRemoveProduct` invalida o prefixo `['stats']`, o que força o re-fetch de qualquer período ativo na tela de estatísticas.

```ts
// features/inventory/mutations.ts — onSuccess de useRemoveProduct
qc.invalidateQueries({ queryKey: inventoryKeys.all });
qc.invalidateQueries({ queryKey: ['stats'] });
```

---

## 10. Fluxo de consumo e descarte

O produto pode ser consumido ou descartado diretamente da tela de detalhes. O fluxo é:

```
ProductDetailScreen
  ├── botão "Consumir"  → abre ActionSheet com destination = 'consumido'
  └── botão "Descartar" → abre ActionSheet com destination = 'descartado'
        ↓
ActionSheet
  - mostra título ("Consumir produto" ou "Descartar produto")
  - campo de quantidade (pré-preenchido com o total do produto)
  - botão de confirmação ("Registrar consumo" / "Registrar descarte")
        ↓
useRemoveProduct()
  1. INSERT em product_removals (snapshot: nome, categoria, quantidade, destino, was_expired)
  2. Se quantidade_removida >= produto.quantity → DELETE do produto
     Senão → UPDATE decrementando a quantidade
  3. onSuccess: invalida ['products'] e ['stats']
```

O campo `was_expired` é calculado **no momento da remoção** usando `getStatus()`. Se o produto já estava vencido quando o usuário registrou o consumo, isso fica registrado no histórico.

O botão de editar fica no cabeçalho de navegação (canto superior direito) — ícone de lápis que leva para `/product/edit/[id]`.

---

## 11. Fluxo de dados completo (exemplo: adicionar produto)

```
1. Usuário preenche formulário (AddProductScreen)
2. react-hook-form + Zod valida (schemas/product.ts)
3. useCreateProduct().mutate({ ...dados, user_id: user.id })
4. supabase.from('products').insert(dados)
   → RLS verifica: auth.uid() = user_id ✓
   → Postgres insere a linha
5. onSuccess: queryClient.invalidateQueries(['products'])
6. useProducts() re-executa automaticamente
7. HomeScreen re-renderiza com o novo produto
```
