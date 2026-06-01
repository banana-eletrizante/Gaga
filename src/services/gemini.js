import { ENV } from '../config/env';

export const GeminiService = {
  analyzeImage: async (base64Image) => {
    const apiKey = ENV.GEMINI_API_KEY;

    if (!apiKey || apiKey === "AIzaSyC4wjPnF4NOLYIoGwElaqUiMRWenNdbRBc") {
      throw new Error("Chave de API do Gemini não configurada em src/config/env.js");
    }

    // Atualizado para usar o modelo gemini-2.5-flash (o 1.5 foi descontinuado)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            },
            {
              text: "Você é um assistente de voz amigável para pessoas cegas ou com baixa visão. Descreva o ambiente ou objeto à frente da câmera de forma clara. Diga quais são os principais objetos, pessoas presentes e a disposição espacial (ex: na esquerda, na direita, no centro). Seja conciso e descritivo. Idioma: Português do Brasil."
            }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erro de resposta do servidor: ${response.status}`);
    }

    const data = await response.json();
    const description = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!description) {
      throw new Error("Resposta inválida ou vazia recebida do modelo.");
    }

    return description;
  }
};