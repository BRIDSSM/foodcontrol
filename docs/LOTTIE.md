# Lottie — Animações no FoodControl

O app usa `lottie-react-native` para exibir animações nos estados vazios e na tela de onboarding. As animações são arquivos `.json` baixados do [LottieFiles](https://lottiefiles.com).

> **Expo Go:** animações Lottie **não funcionam** no Expo Go (módulo nativo não incluído). Em Expo Go os componentes exibem ícones Lucide como fallback. Para ver as animações, use um development build (`eas build --profile development`).

---

## Arquivos esperados

| Arquivo                                  | Onde é usado                     | Busca sugerida no LottieFiles         |
| ---------------------------------------- | -------------------------------- | ------------------------------------- |
| `assets/animations/onboarding.json`      | Tela de onboarding               | "food", "grocery", "kitchen"          |
| `assets/animations/empty-inventory.json` | Home — estoque vazio             | "empty box", "empty fridge", "shelf"  |
| `assets/animations/no-results.json`      | Home — nenhum resultado na busca | "no results", "search empty", "404"   |
| `assets/animations/empty-stats.json`     | Stats — sem dados ainda          | "empty chart", "no data", "bar chart" |

---

## Como baixar do LottieFiles

1. Acesse [lottiefiles.com](https://lottiefiles.com) e busque pela animação desejada.
2. Clique na animação e depois em **Download** → selecione **Lottie JSON**.
3. Renomeie o arquivo baixado para o nome esperado (coluna acima).
4. Substitua o arquivo placeholder em `assets/animations/`.

---

## Requisitos da animação

- **Formato:** Lottie JSON (`.json`) — **não** use `.lottie` (dotLottie, formato binário).
- **Tamanho:** prefira animações abaixo de 100 KB para não impactar o bundle.
- **Cores:** opte por animações com paleta neutra (preto/branco/cinza) — ficam bem tanto no modo claro quanto no escuro.
- **Loop:** todas as animações usam `loop={true}` e `autoPlay={true}` por padrão.

---

## Como usar o componente

```tsx
import { LottieEmptyState } from '@/components/ui/lottie-empty-state';
import { ShoppingCart } from 'lucide-react-native';

<LottieEmptyState
  source={require('@/assets/animations/empty-inventory.json')}
  title="Estoque vazio"
  description="Adicione produtos para começar"
  FallbackIcon={ShoppingCart} // exibido no Expo Go
/>;
```

| Prop           | Tipo                        | Padrão | Descrição                                   |
| -------------- | --------------------------- | ------ | ------------------------------------------- |
| `source`       | `LottieViewProps['source']` | —      | JSON da animação (via `require`)            |
| `title`        | `string`                    | —      | Título exibido abaixo da animação           |
| `description`  | `string`                    | —      | Descrição opcional                          |
| `size`         | `number`                    | `200`  | Largura e altura da animação em px          |
| `FallbackIcon` | Componente Lucide           | —      | Ícone usado no Expo Go no lugar da animação |

---

## Onboarding

A tela de onboarding (`app/onboarding.tsx`) usa diretamente `LottieView` (sem o wrapper `LottieEmptyState`). O arquivo esperado é `assets/animations/onboarding.json` com dimensões `280×280`.

---

## Arquivos placeholder

Os arquivos `.json` em `assets/animations/` são **placeholders válidos** (Lottie mínimo sem layers). Eles não mostram nenhuma animação visual — apenas evitam erros de `require`. Substitua por animações reais antes de gerar um build de produção.

```json
{
  "v": "5.9.0",
  "fr": 30,
  "ip": 0,
  "op": 60,
  "w": 300,
  "h": 300,
  "nm": "placeholder",
  "ddd": 0,
  "assets": [],
  "layers": []
}
```

---

## Troubleshooting

**Animação não aparece no development build**

- Confirme que o arquivo é Lottie JSON, não dotLottie (`.lottie`)
- Verifique se o `require()` aponta para o caminho correto
- Reinicie Metro com `--clear` após trocar os arquivos

**Animação aparece quebrada / só branco**

- A animação pode usar recursos não suportados (ex: expressions avançadas). Baixe outra.

**Performance lenta com várias animações**

- Use `loop={false}` se a animação não precisar repetir
- Evite mais de 3 animações Lottie simultâneas na mesma tela
