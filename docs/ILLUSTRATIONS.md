# Ilustrações SVG (unDraw)

O app usa SVGs do [unDraw](https://undraw.co) como ilustrações para estados vazios e onboarding. SVGs são importados como componentes React via `react-native-svg-transformer`.

---

## Arquivos esperados

| Arquivo                                    | Onde é usado                             | Tamanho |
| ------------------------------------------ | ---------------------------------------- | ------- |
| `assets/illustrations/onboarding.svg`      | `app/onboarding.tsx`                     | 280×280 |
| `assets/illustrations/empty-inventory.svg` | `app/(tabs)/index.tsx` (estoque vazio)   | 300×300 |
| `assets/illustrations/no-results.svg`      | `app/(tabs)/index.tsx` (busca sem hit)   | 300×300 |
| `assets/illustrations/empty-stats.svg`     | `components/stats/stats-empty-state.tsx` | 300×300 |

Os arquivos atualmente são placeholders (retângulo cinza). Substitua por SVGs do unDraw.

---

## Como baixar do unDraw

1. Acesse https://undraw.co/illustrations
2. (Opcional) Mude a cor primária no campo no topo da página — recomendado usar a cor primária do app: **`#16a34a`** (verde) ou outra cor da paleta
3. Busque por categorias sugeridas:

| Arquivo               | Busca sugerida                                   |
| --------------------- | ------------------------------------------------ |
| `onboarding.svg`      | `groceries`, `cooking`, `meal`, `healthy food`   |
| `empty-inventory.svg` | `empty`, `empty cart`, `nothing`, `fridge`       |
| `no-results.svg`      | `not found`, `search`, `empty box`               |
| `empty-stats.svg`     | `analytics`, `charts`, `data`, `empty dashboard` |

4. Clique na ilustração → botão **Download SVG**
5. Renomeie + mova para `assets/illustrations/`:

```bash
mv ~/Downloads/undraw_xxx.svg assets/illustrations/onboarding.svg
```

6. Repita para os 4 arquivos
7. Reinicie Metro: `npx expo start --clear`

---

## Como usar o componente

```tsx
import { EmptyState } from '@/components/ui/empty-state';
import EmptyInventoryIllustration from '@/assets/illustrations/empty-inventory.svg';

<EmptyState
  Illustration={EmptyInventoryIllustration}
  title="Estoque vazio"
  description="Adicione produtos para começar"
/>;
```

| Prop           | Tipo                 | Padrão | Descrição                                 |
| -------------- | -------------------- | ------ | ----------------------------------------- |
| `Illustration` | `React.FC<SvgProps>` | —      | SVG importado via `import X from '*.svg'` |
| `title`        | `string`             | —      | Título exibido abaixo da ilustração       |
| `description`  | `string`             | —      | Descrição opcional                        |
| `size`         | `number`             | `200`  | Largura e altura em px                    |

---

## Onboarding (uso direto)

A tela de onboarding (`app/onboarding.tsx`) usa o SVG diretamente (sem `EmptyState`):

```tsx
import OnboardingIllustration from '@/assets/illustrations/onboarding.svg';

<OnboardingIllustration width={280} height={280} />;
```

---

## Configuração (já feita)

- `metro.config.js` → configura `react-native-svg-transformer` para tratar `.svg` como módulo
- `types/svg.d.ts` → declaração TS para imports `*.svg`
- Dependência: `react-native-svg-transformer` (dev) + `react-native-svg` (runtime)

---

## Vantagens vs Lottie

- ✅ Funciona no Expo Go (Lottie precisa dev build)
- ✅ Sem rate limit / paywall (LottieFiles passou a ser pago)
- ✅ Bundle menor (SVG ~5-30KB vs Lottie ~50-200KB)
- ✅ Vector escalável sem perda
- ❌ Sem animação (estático)
