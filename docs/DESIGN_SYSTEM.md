# Design System

O FoodControl usa **react-native-reusables** (shadcn/ui para React Native) sobre **NativeWind v4** (Tailwind no RN). Você consome componentes prontos e tokens padronizados — não escreve UI do zero.

> Cor primária: `#1d4ed8` (Tailwind `blue-700`). Light + dark já configurados, com contraste validado para legibilidade.

---

## Como funciona

Quatro arquivos governam tudo:

| Arquivo              | Papel                                                             |
| -------------------- | ----------------------------------------------------------------- |
| `global.css`         | Define tokens (CSS variables HSL) para light e dark.              |
| `tailwind.config.js` | Mapeia tokens em classes Tailwind (ex: `bg-primary`).             |
| `lib/theme.ts`       | Mirror dos tokens em TypeScript. Para uso fora do Tailwind.       |
| `components.json`    | Config do CLI `react-native-reusables` (paths, alias, baseColor). |

**Regra de ouro**: nunca hardcodar cor (`#1d4ed8`, `rgb(...)`, etc.). Sempre usar token (classe Tailwind ou `THEME[scheme].xxx`).

---

## Tokens disponíveis

Cada par tem versão light e dark sincronizadas — quando você troca o color scheme, tudo migra junto.

| Token (Tailwind)                               | Variável CSS                   | Quando usar                            |
| ---------------------------------------------- | ------------------------------ | -------------------------------------- |
| `bg-background`                                | `--background`                 | Cor de fundo da tela.                  |
| `text-foreground`                              | `--foreground`                 | Cor de texto padrão.                   |
| `bg-card` `text-card-foreground`               | `--card` / `--card-foreground` | Containers / cards elevados.           |
| `bg-popover` `text-popover-foreground`         | `--popover` / ...              | Dropdown, tooltip, dialog content.     |
| `bg-primary` `text-primary-foreground`         | `--primary` / ...              | Ações principais (botão CTA, links).   |
| `bg-secondary` `text-secondary-foreground`     | `--secondary` / ...            | Ações secundárias.                     |
| `bg-muted` `text-muted-foreground`             | `--muted` / ...                | Áreas sutis, texto auxiliar.           |
| `bg-accent` `text-accent-foreground`           | `--accent` / ...               | Hover/active subtle, destaques.        |
| `bg-destructive` `text-destructive-foreground` | `--destructive`/...            | Erros, ações de exclusão.              |
| `border-border`                                | `--border`                     | Bordas de cards, divisores.            |
| `border-input`                                 | `--input`                      | Bordas de inputs.                      |
| `ring-ring`                                    | `--ring`                       | Focus ring (web).                      |
| `rounded-lg/md/sm`                             | `--radius`                     | Raios padronizados (`lg`, `md`, `sm`). |

E `chart-1` até `chart-5` para visualização de dados (cores qualitativas distintas).

### Editando tokens

Para mudar a paleta inteira: edite `global.css` e `lib/theme.ts` em conjunto. Mantenha os dois sincronizados.

Exemplo: trocar primária para verde food/health:

```css
/* global.css */
:root {
  --primary: 142 70% 38%;
}
.dark:root {
  --primary: 142 65% 50%;
}
```

```ts
// lib/theme.ts
THEME.light.primary = 'hsl(142, 70%, 38%)';
THEME.dark.primary = 'hsl(142, 65%, 50%)';
```

---

## Como usar

### 1. Tela típica

```tsx
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

export default function MyScreen() {
  return (
    <View className="flex-1 gap-4 bg-background p-4">
      <Text variant="h1">Título</Text>
      <Text variant="muted">Descrição secundária.</Text>
      <Button onPress={() => {}}>
        <Text>Ação principal</Text>
      </Button>
      <Button variant="outline">
        <Text>Ação secundária</Text>
      </Button>
    </View>
  );
}
```

> Dica: `npm run new:screen -- nome` já gera tela com esse esqueleto.

### 2. Variants do Text

```tsx
<Text variant="h1">Heading 1</Text>
<Text variant="h2">Heading 2</Text>
<Text variant="h3">Heading 3</Text>
<Text variant="h4">Heading 4</Text>
<Text variant="lead">Texto de destaque</Text>
<Text variant="large">Texto grande</Text>
<Text variant="small">Texto pequeno</Text>
<Text variant="muted">Texto secundário</Text>
<Text>Texto padrão</Text>
```

### 3. Variants do Button

```tsx
<Button>             {/* default — primary */}
<Button variant="destructive">
<Button variant="outline">
<Button variant="secondary">
<Button variant="ghost">
<Button variant="link">

<Button size="sm">
<Button size="lg">
<Button size="icon"> {/* quadrado para ícones */}
```

### 4. Card

```tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Receita</CardTitle>
    <CardDescription>Massa de pizza caseira</CardDescription>
  </CardHeader>
  <CardContent>
    <Text>Conteúdo principal</Text>
  </CardContent>
  <CardFooter>
    <Button>
      <Text>Abrir</Text>
    </Button>
  </CardFooter>
</Card>;
```

### 5. Combinando classes Tailwind

Tudo o que NativeWind suporta funciona: spacing, flexbox, typography, colors, borders.

```tsx
<View className="flex-row items-center justify-between rounded-lg border border-border bg-card p-4">
  <Text className="font-semibold">Item</Text>
  <Text variant="muted">descrição</Text>
</View>
```

### 6. Dark mode

NativeWind v4 acompanha automaticamente o color scheme do sistema (`Appearance.getColorScheme()`). Tokens migram sem nenhum código extra.

Para alternar manualmente em runtime (debug, settings de app):

```ts
import { useColorScheme } from 'nativewind';

const { setColorScheme } = useColorScheme();
setColorScheme('dark'); // ou 'light' ou 'system'
```

### 7. Cor fora de classes Tailwind

Casos: animações imperativas, cor dinâmica em `StyleSheet`, integração com lib que pede string.

```ts
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTheme } from '@/lib/theme';

const scheme = useColorScheme();
const theme = getTheme(scheme);

// theme.primary === 'hsl(224, 76%, 48%)' (light) | 'hsl(224, 76%, 53%)' (dark)
```

---

## Adicionando mais componentes

A CLI do reusables baixa componentes individuais sob demanda. Eles caem em `components/ui/` e ficam seus para customizar.

```bash
npx @react-native-reusables/cli@latest add input
npx @react-native-reusables/cli@latest add dialog
npx @react-native-reusables/cli@latest add toast
```

Lista completa: <https://reactnativereusables.com/docs/components>

Componentes comuns:

- `input`, `textarea`, `label`, `form` — formulários
- `dialog`, `alert-dialog`, `sheet`, `drawer` — modais
- `dropdown-menu`, `select`, `popover`, `tooltip` — overlays
- `tabs`, `accordion`, `collapsible` — disclosure
- `toast` — notificações
- `avatar`, `badge`, `skeleton` — átomos

Após adicionar, valide com:

```bash
npx @react-native-reusables/cli@latest doctor
```

---

## Verificando contraste

Os tokens foram balanceados para WCAG AA em texto normal:

- Light — `foreground` em `background`: ≈ 14.5:1
- Light — `primary-foreground` em `primary`: ≈ 7.7:1
- Dark — `foreground` em `background`: ≈ 13.8:1
- Dark — `primary-foreground` em `primary`: ≈ 6.9:1

Se trocar um token, valide o par texto/fundo correspondente em <https://webaim.org/resources/contrastchecker/>.

---

## Scanner

A tela de scanner (`app/product/scan.tsx`) é **sempre dark** por design (UI sobreposta à câmera). Suas cores estão centralizadas em `components/scanner/scanner-theme.ts` e derivam dos tokens dark do design system. Quando você muda a primária do app, a borda do viewfinder, a linha de scan e o texto de marca acompanham.

## Status semáforo

Três tokens semânticos expõem as cores do sistema de validade (verde/âmbar/vermelho) com suporte a light e dark:

| Classe Tailwind        | Variável CSS          | Uso                             |
| ---------------------- | --------------------- | ------------------------------- |
| `text-status-safe`     | `--status-safe`       | Texto/ícone de itens em dia.    |
| `text-status-warning`  | `--status-warning`    | Texto/ícone de itens a vencer.  |
| `text-status-expired`  | `--status-expired`    | Texto/ícone de itens vencidos.  |
| `bg-status-safe-bg`    | `--status-safe-bg`    | Fundo de chip/badge "Em dia".   |
| `bg-status-warning-bg` | `--status-warning-bg` | Fundo de chip/badge "A vencer". |
| `bg-status-expired-bg` | `--status-expired-bg` | Fundo de chip/badge "Vencido".  |

Para uso fora do Tailwind (cor dinâmica em `style`):

```ts
import { STATUS_COLORS } from '@/lib/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const colorScheme = useColorScheme() ?? 'light';
const palette = STATUS_COLORS[colorScheme];
// palette.safe, palette.warning, palette.expired
// palette.safeBg, palette.warningBg, palette.expiredBg
```

---

## Resumo de uma linha

> Use `<Text>`, `<Button>`, `<Card>` com classes Tailwind. Nunca hardcode cor. Para gerar tela nova: `npm run new:screen -- nome`.
