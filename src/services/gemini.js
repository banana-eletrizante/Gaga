import { ENV } from '../config/env';

const PROMPTS = {
  scene: `Você é um guia de voz para pessoas cegas ou com baixa visão no Brasil.
Descreva o que a câmera está vendo agora, em português do Brasil, em no máximo 4 frases curtas.
Inclua:
- o que há à esquerda, no centro e à direita;
- pessoas, objetos grandes e o tipo de ambiente;
- obstáculos no chão ou à frente (degrau, buraco, poste, meio-fio, veículo);
- se algo parece perigoso ou exige cuidado.
Não use emojis. Não faça introdução. Comece direto pela descrição.`,

  text: `Você é um leitor de tela visual para pessoas cegas.
Leia em voz alta, em português do Brasil, TODO o texto visível na imagem, na ordem natural de leitura.
Se for um documento, cartaz, placa, embalagem, tela de celular ou preço, leia o conteúdo completo.
Se não houver texto legível, diga apenas: "Não encontrei texto legível nesta imagem."
Não descreva o cenário. Não use emojis.`,

  hazards: `Você é um assistente de mobilidade para pessoas cegas.
Analise a imagem em busca de riscos imediatos à frente: degraus, desníveis, buracos, postes, portas entreabertas, veículos, animais, objetos no chão, piso molhado, obras.
Responda em português do Brasil, em no máximo 3 frases.
Se o caminho parecer livre, diga isso com clareza.
Não use emojis.`,

  colors: `Você descreve cores para pessoas cegas ou com daltonismo.
Diga as cores principais das roupas, objetos e do ambiente na imagem, em português do Brasil.
Seja concreto: "camisa azul-marinho à frente", "parede branca", "saco vermelho à direita".
No máximo 3 frases. Sem emojis.`,
};

const PLACEHOLDER_KEYS = new Set([
  'AIzaSyC4wjPnF4NOLYIoGwElaqUiMRWenNdbRBc',
]);

const getApiKey = () => {
  const key = (ENV.GEMINI_API_KEY || '').trim();
  if (!key || PLACEHOLDER_KEYS.has(key)) return '';
  return key;
};

const extractText = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts
    .map((part) => part?.text)
    .filter(Boolean)
    .join('\n')
    .trim();
};

const requestModel = async (model, apiKey, base64Image, prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image,
              },
            },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 512,
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    const error = new Error(`Gemini ${model} HTTP ${response.status}`);
    error.status = response.status;
    error.body = errBody;
    throw error;
  }

  const data = await response.json();
  const description = extractText(data);
  if (!description) {
    throw new Error('Resposta vazia do modelo.');
  }
  return description;
};

export const GeminiService = {
  modes: PROMPTS,

  analyzeImage: async (base64Image, mode = 'scene') => {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error(
        'Chave do Gemini não configurada. Defina EXPO_PUBLIC_GEMINI_API_KEY no arquivo .env.'
      );
    }

    const prompt = PROMPTS[mode] || PROMPTS.scene;
    const models = ENV.GEMINI_MODELS || ['gemini-2.5-flash'];
    let lastError = null;

    for (const model of models) {
      try {
        return await requestModel(model, apiKey, base64Image, prompt);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Falha ao consultar o Gemini.');
  },

  isConfigured: () => Boolean(getApiKey()),
};
