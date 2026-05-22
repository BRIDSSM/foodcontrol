# EAS Build — Guia de uso

O FoodControl usa o **EAS (Expo Application Services)** para gerar builds Android e iOS sem precisar de Android Studio ou Xcode localmente. As builds são compiladas na nuvem da Expo.

---

## Pré-requisitos

```bash
npm install -g eas-cli      # instala o CLI globalmente
eas login                    # faz login com a conta Expo
eas whoami                   # confirma o usuário logado
```

> A conta Expo usada no projeto é a vinculada ao `app.json` (`owner: "dedehlol"`). Novos devs precisam ser adicionados como membros da organização no painel em expo.dev.

---

## Perfis de build (`eas.json`)

| Perfil        | Uso                                              | Distribuição | Obs                                  |
| ------------- | ------------------------------------------------ | ------------ | ------------------------------------ |
| `development` | Testes locais com hot reload via Metro           | Internal     | Inclui `expo-dev-client`             |
| `preview`     | Testes sem hot reload, APK mais próximo do final | Internal     | Sem dev client                       |
| `production`  | Build para loja (Google Play / App Store)        | Store        | `autoIncrement: true` no versionCode |

---

## Gerar build Android

### Development build (recomendado para desenvolvimento)

```bash
eas build --platform android --profile development
```

- Gera APK com `expo-dev-client` embutido
- Após instalar no dispositivo, conecta ao Metro via WiFi
- Mudanças no código JS não exigem novo build — só reiniciar Metro
- **Novo build necessário** quando: instalar novo módulo nativo, alterar `app.json`/`eas.json`, ou atualizar SDK

### Preview build (testes sem Metro)

```bash
eas build --platform android --profile preview
```

- APK autossuficiente, sem conexão com Metro
- Bom para testar comportamento final do app
- Mudanças no código **exigem** novo build

### Production build

```bash
eas build --platform android --profile production
```

- Gera AAB (Android App Bundle) para upload na Play Store
- Incrementa `versionCode` automaticamente

---

## Instalar no dispositivo

Após o build, a EAS CLI exibe um QR code e um link para download. Para instalar:

1. **Via QR code** — abrir a câmera do Android e escanear
2. **Via link** — abrir o link no navegador do dispositivo
3. **Via ADB** (cabo USB):
   ```bash
   adb install caminho/para/o/arquivo.apk
   ```

> Primeiro acesso: habilitar "Instalar de fontes desconhecidas" nas configurações do Android.

---

## Usar o development build

Após instalar o APK de development:

1. Conectar o dispositivo na mesma rede WiFi do computador
2. Iniciar Metro:
   ```bash
   npx expo start --dev-client
   ```
3. No app, inserir o endereço do Metro manualmente (ex: `exp://192.168.x.x:8081`) ou escanear o QR code exibido no terminal

---

## Variáveis de ambiente

As variáveis públicas (`EXPO_PUBLIC_*`) ficam no `.env` local e **não** são commitadas. Para builds na nuvem da EAS, configure-as pelo painel:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "sua_url"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "sua_key"
eas secret:create --scope project --name EXPO_PUBLIC_COSMOS_TOKEN --value "seu_token"
```

Ou pelo painel em **expo.dev → projeto → Secrets**.

---

## Verificar builds anteriores

```bash
eas build:list                          # lista todos os builds
eas build:view <build-id>               # detalhes de um build específico
```

Também disponível em **expo.dev → projeto → Builds**.

---

## Quando gerar novo build

| Situação                                          | Precisa de novo build?          |
| ------------------------------------------------- | ------------------------------- |
| Mudança em arquivo `.tsx` / `.ts`                 | ❌ Não (JS recarrega via Metro) |
| Novo pacote nativo instalado (`npx expo install`) | ✅ Sim                          |
| Mudança em `app.json` (nome, ícone, permissões)   | ✅ Sim                          |
| Mudança em `eas.json`                             | ✅ Sim                          |
| Mudança em `babel.config.js`                      | ✅ Sim (+ `--clear` no Metro)   |
| Atualização de SDK Expo                           | ✅ Sim                          |

---

## Troubleshooting

**"Your project needs the `expo-dev-client` package"**

```bash
npx expo install expo-dev-client
eas build --platform android --profile development
```

**Metro não conecta no dispositivo**

- Confirmar que dispositivo e computador estão na mesma rede WiFi
- Tentar inserir o IP manualmente na tela de conexão do dev client
- Verificar se firewall bloqueia a porta 8081

**Build falha por variáveis de ambiente ausentes**

- Verificar se os secrets estão configurados: `eas secret:list`

**Versão do EAS CLI desatualizada**

```bash
npm install -g eas-cli@latest
```
