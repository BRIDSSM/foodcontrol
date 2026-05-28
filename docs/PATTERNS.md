# Padrões do projeto — navegação, estado e telas

Guia para quem está começando em React Native + Expo. Mostra como fazer as três coisas mais comuns no dia-a-dia: **criar uma tela**, **navegar entre telas** e **gerenciar estado**.

> Stack atual: Expo SDK 54 · expo-router 6 · React 19 · TypeScript strict.

---

## Sumário

1. [Como criar uma nova tela](#1-criar-uma-nova-tela)
2. [Como funciona a navegação (`expo-router`)](#2-navegação)
3. [Como gerenciar estado](#3-estado)
4. [Theming (ThemedText / ThemedView)](#4-theming)
5. [Path alias `@/*`](#5-path-alias)

---

## 1. Criar uma nova tela

Crie um arquivo `.tsx` na pasta `app/` seguindo a estrutura de rotas do `expo-router`. Não use geradores nem templates, apenas crie o componente diretamente com os imports e padrões do projeto.

---

## 2. Navegação

`expo-router` usa **roteamento por arquivos** (igual Next.js). A pasta `app/` é o roteador.

### 2.1 Estrutura de arquivos = rotas

```
app/
├── _layout.tsx              ← layout raiz (Stack)
├── modal.tsx                ← rota /modal
├── (tabs)/                  ← grupo "tabs", não aparece na URL
│   ├── _layout.tsx          ← layout das abas (Tabs)
│   ├── index.tsx            ← rota / (home)
│   └── explore.tsx          ← rota /explore
└── recipes/
    ├── index.tsx            ← rota /recipes
    └── [id].tsx             ← rota dinâmica /recipes/:id
```

Convenções:

| Padrão        | Significado                                           |
| ------------- | ----------------------------------------------------- |
| `nome.tsx`    | Rota estática `/nome`.                                |
| `index.tsx`   | Rota raiz da pasta.                                   |
| `[param].tsx` | Rota dinâmica. `params.param` lê o valor.             |
| `(grupo)/`    | Agrupa rotas sem afetar a URL (ex: layout de abas).   |
| `_layout.tsx` | Layout pai aplicado a todas as rotas filhas da pasta. |

### 2.2 Navegando — duas formas

**Declarativa (`<Link>`)** — preferida quando o destino é fixo:

```tsx
import { Link } from 'expo-router';

<Link href="/profile">Ver perfil</Link>
<Link href={{ pathname: '/recipes/[id]', params: { id: '42' } }}>
  Receita 42
</Link>
```

**Imperativa (`router`)** — use quando navegar depende de lógica:

```tsx
import { router } from 'expo-router';

function onLogin() {
  await signIn();
  router.replace('/(tabs)'); // replace = não dá pra voltar com back
}

router.push('/profile'); // empilha
router.back(); // volta uma tela
```

### 2.3 Lendo parâmetros

```tsx
// app/recipes/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Text>Receita {id}</Text>;
}
```

### 2.4 Layouts

Layouts envolvem todas as telas filhas. Use pra header global, tabs, autenticação, etc.

```tsx
// app/_layout.tsx — Stack na raiz
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
```

```tsx
// app/(tabs)/_layout.tsx — Tabs no grupo (tabs)
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
    </Tabs>
  );
}
```

---

## 3. Estado

Regra geral: **comece pelo mais simples e escale só quando a dor aparecer**.

| Necessidade                                   | Use isto                            |
| --------------------------------------------- | ----------------------------------- |
| Estado de UI dentro de **uma** tela           | `useState`                          |
| Estado complexo numa tela (várias transições) | `useReducer`                        |
| Compartilhar entre componentes próximos       | Subir o estado para o pai (lifting) |
| Compartilhar entre telas distantes            | `Context` ou Zustand                |
| Dados vindo de API (cache, loading, refetch)  | TanStack Query                      |
| Persistir no dispositivo                      | AsyncStorage ou MMKV                |

### 3.1 `useState` — local, simples

```tsx
const [count, setCount] = useState(0);
const [name, setName] = useState('');

setCount((c) => c + 1); // sempre prefira a função quando o novo valor depende do antigo
```

### 3.2 `useReducer` — local, mais transições

Quando o estado tem muitas ações (loading, success, error, retry), o reducer é mais legível que três `useState`.

```tsx
type State = { status: 'idle' | 'loading' | 'success' | 'error'; data?: Recipe[] };
type Action = { type: 'fetch' } | { type: 'success'; data: Recipe[] } | { type: 'error' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'fetch':
      return { status: 'loading' };
    case 'success':
      return { status: 'success', data: action.data };
    case 'error':
      return { status: 'error' };
  }
}

const [state, dispatch] = useReducer(reducer, { status: 'idle' });
```

### 3.3 Context — global leve

Use pra coisas que **muitas telas leem mas raramente mudam** (tema, sessão de usuário, locale). Não use pra estado que muda muito — re-renderiza o mundo inteiro.

```tsx
// contexts/auth.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

type AuthState = { user: User | null; signIn: (u: User) => void; signOut: () => void };
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  return (
    <AuthContext.Provider value={{ user, signIn: setUser, signOut: () => setUser(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
```

Aí você embrulha o app em `app/_layout.tsx`:

```tsx
<AuthProvider>
  <Stack>...</Stack>
</AuthProvider>
```

### 3.4 Quando escalar para Zustand / TanStack Query

- **Zustand** → quando você tem 3+ Contexts disputando o mesmo estado, ou quando re-renders ficam pesados. Sintaxe parecida com hooks, sem boilerplate.
- **TanStack Query** → quando você começa a reimplementar cache de fetch na mão (loading, refetch, stale time, retry). Aí pare e instale ele.

Não instale antes de precisar. Manter o app simples enquanto a dor não aparece é bom design.

### 3.5 Side effects — `useEffect`

Para chamar API, assinar evento, ler do storage:

```tsx
useEffect(() => {
  let cancelled = false;
  fetchRecipes().then((data) => {
    if (!cancelled) setRecipes(data);
  });
  return () => {
    cancelled = true;
  };
}, []); // deps vazias = roda uma vez ao montar
```

Sempre limpe assinaturas no return — evita memory leak.

---

## 4. Theming

O projeto usa **react-native-reusables + NativeWind v4**. Tokens de cor (light/dark) estão em `global.css` e espelhados em `lib/theme.ts`. Dark mode acompanha o sistema automaticamente — nenhum código extra necessário.

Use os componentes do design system em vez de `Text` / `View` puros:

```tsx
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

<View className="flex-1 bg-background p-4">
  <Text variant="h1">Olá</Text>
  <Text variant="lead">Subtítulo</Text>
  <Text variant="muted">Texto secundário</Text>
  <Text>Texto padrão</Text>
</View>;
```

Para cor fora de classes Tailwind (animações, `StyleSheet`, libs externas):

```ts
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTheme } from '@/lib/theme';

const { colorScheme } = useColorScheme();
const theme = getTheme(colorScheme);
// theme.primary === 'hsl(224, 76%, 48%)' (light) | 'hsl(224, 76%, 53%)' (dark)
```

Ver `docs/DESIGN_SYSTEM.md` para a lista completa de tokens e componentes disponíveis.

---

## 5. Path alias

`tsconfig.json` define `@/*` apontando para a raiz. Use sempre — evita `../../../`.

```tsx
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
```

---

## Cheatsheet

| Quero...                | Faça                                             |
| ----------------------- | ------------------------------------------------ |
| Criar tela nova         | Crie `.tsx` diretamente em `app/`                |
| Adicionar tela como aba | Crie em `app/(tabs)/nome.tsx` + ajusta `_layout` |
| Tela com param dinâmico | Crie `app/rota/[id].tsx`                         |
| Navegar com link        | `<Link href="/rota">`                            |
| Navegar via código      | `router.push('/rota')`                           |
| Ler param da rota       | `useLocalSearchParams<{ id: string }>()`         |
| Estado de uma tela      | `useState`                                       |
| Estado global leve      | `Context`                                        |
| Cache de API            | (instalar TanStack Query quando precisar)        |
