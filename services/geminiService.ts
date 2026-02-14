
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePaparazziShot = async (city: string) => {
  const ai = getAIClient();
  const prompt = `A high-end paparazzi street style photo from ${city} fashion week. A celebrity walking past a crowd, wearing avant-garde luxury fashion and distinct accessories. Sharp focus, motion blur in background, 8k cinematic lighting, ultra-realistic textures.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio: "3:4", imageSize: "1K" }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return {
        url: `data:image/png;base64,${part.inlineData.data}`,
        prompt
      };
    }
  }
  throw new Error("Failed to capture shot");
};

export const analyzeFashionTrend = async (prompt: string, agentName: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze this fashion scene: "${prompt}". Identify 3 key items/accessories. Then, as the fashion critic ${agentName}, explain what people in Aspen, Tokyo, and London would be buying instead or as a similar variation to this specific style. Return JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          identifiedItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                suggestedAcquisition: { type: Type.STRING }
              },
              required: ["name", "category", "suggestedAcquisition"]
            }
          },
          regionalTrends: {
            type: Type.OBJECT,
            properties: {
              Aspen: { type: Type.STRING },
              Tokyo: { type: Type.STRING },
              London: { type: Type.STRING }
            }
          },
          agentVerdict: { type: Type.STRING }
        },
        required: ["identifiedItems", "regionalTrends", "agentVerdict"]
      }
    }
  });

  return JSON.parse(response.text);
};
