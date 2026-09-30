# Gaga

App de acessibilidade com IA para pessoas com deficiência visual.

Descreve o entorno, lê textos, avisa obstáculos, informa bateria/luz/hora e fala tudo em português do Brasil.

Stack: JavaScript + Expo SDK 54.

> Repos relacionados (experimentos / forks): [`VisionAssist`](https://github.com/banana-eletrizante/VisionAssist), [`vision-assistent`](https://github.com/banana-eletrizante/vision-assistent). **Este é o repositório canônico.**

## O que o app faz

A tela da câmera é um grid de 4 quadrantes grandes, pensado para uso sem olhar:

| Quadrante | Toque | Toque longo |
| --- | --- | --- |
| Superior esquerdo | Descrever o cenário | Procurar obstáculos |
| Superior direito | Ler textos (placas, documentos, embalagens) | Descrever cores |
| Inferior esquerdo | Hora, bateria, luz e rede | Repetir a última fala |
| Inferior direito | Ligar/desligar lanterna | Abrir configurações |

Também dá para:

- Sacudir o celular para descrever o ambiente
- Virar entre câmera traseira e frontal
- Interromper a fala tocando de novo enquanto analisa
- Ajustar velocidade da voz e anúncio inicial

## Configurar a chave do Gemini

O app chama a API do Gemini para visão. **Não commite a chave.**

1. Copie `.env.example` para `.env`
2. Coloque a chave:

```bash
EXPO_PUBLIC_GEMINI_API_KEY=sua_chave
```

3. Reinicie o bundler (`npx expo start`).

A chave também pode ir em `app.json` → `expo.extra.geminiApiKey`, mas o `.env` é o caminho preferido.

## Rodar

```bash
npm install
npx expo start
```

Build interno (APK):

```bash
npx eas build --profile preview --platform android
```

## Estrutura

```
App.js                 entrada
src/screens/           câmera e configurações
src/hooks/             câmera, shake, fluxo de análise
src/services/          Gemini, fala, sensores, histórico
src/components/        botão acessível
src/config/            env
assets/                ícones
```

## Privacidade

Fotos vão só para a API do Gemini no momento da análise. O app não tem backend próprio nem banco remoto. Histórico recente fica no AsyncStorage do aparelho.

## Licença

MIT — ver `LICENSE`.
