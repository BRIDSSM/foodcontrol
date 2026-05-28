# Requisitos do Sistema — FoodControl

> Aplicativo mobile de controle de validade e inventário de alimentos domésticos.

---

## Requisitos Funcionais

### Autenticação

| ID   | Descrição                                                       |
| ---- | --------------------------------------------------------------- |
| RF01 | Cadastro com nome, e-mail, senha e confirmação de senha         |
| RF02 | Login com e-mail e senha (Supabase Auth)                        |
| RF03 | Recuperação de senha via e-mail                                 |
| RF04 | Logout                                                          |
| RF05 | Verificação de e-mail pós-cadastro                              |
| RF06 | Criação automática de perfil após signup (trigger ou explícito) |

### Inventário / Produtos

| ID   | Descrição                                                                                          |
| ---- | -------------------------------------------------------------------------------------------------- |
| RF07 | Cadastro manual de produto (nome, categoria, quantidade, local, data de validade)                  |
| RF08 | Edição de produto existente                                                                        |
| RF09 | Remoção de produto via modal com destino (consumido ou descartado)                                 |
| RF10 | Listagem de produtos ordenada por data de validade asc (mais urgente primeiro)                     |
| RF11 | Filtro por local de armazenamento (despensa, geladeira, congelador)                                |
| RF12 | Filtro por categoria                                                                               |
| RF13 | Busca por nome                                                                                     |
| RF14 | Pull-to-refresh na lista                                                                           |
| RF15 | Cálculo de status em tempo real (🔴 vencido / 🟡 a vencer / 🟢 ok)                                 |
| RF16 | Label de countdown ("Vence em N dias", "Vence hoje", "Venceu há N dias")                           |
| RF17 | Header com resumo rápido ("N itens vencendo, N vencidos")                                          |
| RF18 | Upload de imagem do produto (galeria ou câmera) → Supabase Storage                                 |
| RF19 | Scanner de código de barras (EAN/GTIN via expo-camera)                                             |
| RF20 | Lookup automático do produto na API Cosmos após scan                                               |
| RF21 | Pré-preenchimento do formulário com dados do Cosmos (nome, categoria, imagem)                      |
| RF22 | Fallback manual quando produto não encontrado na Cosmos (toast + código preenchido)                |
| RF23 | Mapeamento `mapCosmosToCategory()` de categorias Cosmos → enum interno                             |
| RF24 | Registro de remoção em `product_removals` (snapshot: nome, categoria, qtd, destino, `was_expired`) |
| RF25 | Remoção parcial (decrementar quantidade sem excluir o produto)                                     |

### Estatísticas

| ID   | Descrição                                                                       |
| ---- | ------------------------------------------------------------------------------- |
| RF26 | Taxa de aproveitamento do período: `consumido / (consumido + descartado) * 100` |
| RF27 | Contagem e soma de itens consumidos no período                                  |
| RF28 | Contagem e soma de itens descartados no período                                 |
| RF29 | Contagem de "desperdício evitado" (`consumido AND was_expired = false`)         |
| RF30 | Gráfico consumido vs descartado por categoria                                   |
| RF31 | Gráfico de taxa de aproveitamento mês a mês (últimos 6 meses)                   |
| RF32 | Filtro de período: 7 / 30 / 90 dias / 12 meses                                  |

### Notificações

| ID   | Descrição                                                                                    |
| ---- | -------------------------------------------------------------------------------------------- |
| RF33 | Agendamento local de notificação no dia em que produto entra na janela amarela (às 09:00)    |
| RF34 | Notificação no dia do vencimento                                                             |
| RF35 | Notificação 1 dia após vencimento                                                            |
| RF36 | Reagendamento ao criar/editar/remover produto                                                |
| RF37 | Reagendamento ao alterar `warning_days_before_expiry`                                        |
| RF38 | Priorização dos produtos mais próximos do vencimento (limite iOS: 64 notificações pendentes) |
| RF39 | Deep link ao tocar na notificação → tela do produto                                          |

### Perfil e Configurações

| ID   | Descrição                                                                  |
| ---- | -------------------------------------------------------------------------- |
| RF40 | Visualizar e editar nome e avatar                                          |
| RF41 | Configurar dias de antecedência do alerta amarelo (1–30, default 5)        |
| RF42 | Toggle de notificações habilitadas                                         |
| RF43 | Configurar horário diário do alerta (default 09:00, salvo em AsyncStorage) |

---

## Requisitos Não Funcionais

| ID    | Descrição                                                                                          |
| ----- | -------------------------------------------------------------------------------------------------- |
| RNF01 | TypeScript strict — sem `any`                                                                      |
| RNF02 | Tipos do Supabase gerados via `npx supabase gen types typescript`                                  |
| RNF03 | Zod schemas compartilhados entre formulários de criação e edição                                   |
| RNF04 | RLS habilitado em todas as tabelas (`products`, `profiles`, `product_removals`)                    |
| RNF05 | Status do produto nunca persistido — sempre derivado em runtime                                    |
| RNF06 | Remoção sempre via `RemoveProductSheet` (nunca `delete` direto sem registro em `product_removals`) |
| RNF07 | Tokens sensíveis (service_role, secrets de Edge Functions) nunca expostos no cliente               |
| RNF08 | Datas comparadas com `date-fns` + `startOfDay` para consistência de timezone                       |
| RNF09 | Idioma PT-BR fixo em V1                                                                            |
| RNF10 | `accessibilityLabel` em todos os ícones e ações interativas                                        |
| RNF11 | Testes unitários para funções puras de `lib/status.ts` e `lib/date.ts`                             |
| RNF12 | Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`)                                      |
| RNF13 | Queries com índices compostos (`user_id + expiration_date`, `user_id + category`)                  |

---

## Status de Implementação

| Fase                | Requisitos                      | Status          | Observação |
| ------------------- | ------------------------------- | --------------- | ---------- |
| Autenticação        | RF01–RF06                       | ✅ Implementado |            |
| CRUD de produtos    | RF07–RF13, RF15–RF17, RF24–RF25 | ✅ Implementado |            |
| Pull-to-refresh     | RF14                            | ✅ Implementado |            |
| Upload de imagem    | RF18                            | ✅ Implementado |            |
| Scanner + Cosmos    | RF19–RF23                       | ✅ Implementado |            |
| Estatísticas        | RF26–RF30, RF32                 | ✅ Implementado |            |
| Gráfico mensal      | RF31                            | ✅ Implementado |            |
| Notificações locais | RF33–RF39                       | ✅ Implementado |            |
| Configurações       | RF41–RF43                       | ✅ Implementado |            |
| Edição de perfil    | RF40                            | ✅ Implementado |            |

---

## Regras de Negócio

1. Status (🔴/🟡/🟢) nunca é persistido — sempre derivado de `expiration_date` + `warning_days_before_expiry` do perfil.
2. Deletar produto sem registrar destino é anti-pattern — sempre passar pelo `RemoveProductSheet`.
3. Edição de produto **não** gera registro em `product_removals` — apenas remoção.
4. Multi-dispositivo não suportado em V1 (notificações são por dispositivo).

```ts
// Lógica de status (lib/status.ts)
function getStatus(expirationDate: Date, warningDays = 5) {
  const today = startOfDay(new Date());
  const exp = startOfDay(expirationDate);
  const diff = differenceInDays(exp, today);
  if (diff < 0) return 'expired'; // 🔴
  if (diff <= warningDays) return 'warning'; // 🟡
  return 'safe'; // 🟢
}
```
