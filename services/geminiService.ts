
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { HomeraAiRequest } from "../types";
import { subscriptionPlans } from "../config/subscriptions";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const interpretRequest = async (prompt: string, userTierId: string = 'standard'): Promise<HomeraAiRequest> => {
  const modelId = "gemini-2.5-flash";

  // Look up plan details from config
  const plan = subscriptionPlans.find(p => p.id === userTierId) || subscriptionPlans[0];
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      interpretation: { type: Type.STRING },
      homera_ai_api_payload: {
        type: Type.OBJECT,
        properties: {
          image_url: { type: Type.STRING },
          task_type: { 
            type: Type.STRING, 
            enum: ['RENOVATION', 'STAGING', 'DECLUTTER', 'STYLE_TRANSFER', 'UPSCALE'] 
          },
          style: { type: Type.STRING },
          objects_to_remove: { type: Type.ARRAY, items: { type: Type.STRING } },
          description: { type: Type.STRING },
          quality: { type: Type.STRING, enum: ['DRAFT', 'STANDARD', 'HIGH', 'HIGH_DETAIL', 'ULTRA_REALISTIC'] },
          target_resolution: { type: Type.STRING },
          consistency_check: { type: Type.BOOLEAN }
        },
        required: ["image_url", "task_type", "description", "quality", "target_resolution", "consistency_check"]
      }
    },
    required: ["interpretation", "homera_ai_api_payload"]
  };

  const response = await ai.models.generateContent({
    model: modelId,
    contents: `
      You are the AI engine behind Homera Studios Ai. 
      Analyze the following real-estate transformation request: "${prompt}".
      
      Current User Plan: ${plan.name}
      Target Resolution: ${plan.resolution}
      Quality Engine: ${plan.qualityKey.toUpperCase()}

      MANDATORY RULES:
      1. You MUST set 'target_resolution' to "${plan.resolution}".
      2. You MUST set 'quality' based on the plan:
         - standard -> STANDARD
         - premium_2k -> HIGH_DETAIL
         - ultra_4k -> ULTRA_REALISTIC
         - ultra_realistic_16k -> ULTRA_REALISTIC
      3. If the user asks for 'upscale', 'enhance', 'improve quality', 'super resolution', or uses the 'Smart Upscale' button, set 'task_type' to 'UPSCALE'.
      
      FOR UPSCALE TASKS:
      - The 'description' MUST be: "Perform a deep-learning based super-resolution upscale. Denoise, sharpen, and rebuild lost texture details. Maintain exact original content structure and lighting."

      Write a vivid description for the image generation model.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.2,
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to interpret request.");
  
  return JSON.parse(text) as HomeraAiRequest;
};

export const executeTransformation = async (imageFile: File, refinedPrompt: string, targetResolution: string): Promise<string> => {
  // Select Model & Config based on Resolution
  let modelId = "gemini-2.5-flash-image"; // Default for standard/speed
  let imageSizeConfig: string | undefined;

  // Check for 2K, 4K, or 16K requirements
  // Note: 16K will use the max available 4K setting as per API capabilities
  if (targetResolution.includes('3840') || targetResolution.includes('2160') || targetResolution.includes('15369')) {
     modelId = "gemini-3-pro-image-preview";
     imageSizeConfig = "4K";
  } else if (targetResolution.includes('2560') || targetResolution.includes('1440')) {
     modelId = "gemini-3-pro-image-preview";
     imageSizeConfig = "2K";
  }
  // Standard (1080p) falls back to gemini-2.5-flash-image or default params

  console.log(`[Execute] Using Model: ${modelId}, Size: ${imageSizeConfig || 'Default'}`);

  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  // Check if this is an upscale request based on the prompt content
  const isUpscale = refinedPrompt.includes("super-resolution");
  
  const additionalContext = isUpscale
    ? " Mode: Super-Resolution. Rebuild textures and increase pixel density. Do not hallucinate new objects. Strictly maintain the original image composition and style, just higher quality."
    : " Maintain the structural integrity of the room (walls, windows, ceiling) unless explicitly told to renovate them. Ensure photorealistic lighting and textures suitable for high-end real estate.";

  // Prepare Config
  const generateConfig: any = {};
  if (imageSizeConfig) {
    generateConfig.imageConfig = { imageSize: imageSizeConfig };
  }

  const response = await ai.models.generateContent({
    model: modelId,
    contents: {
      parts: [
        { text: refinedPrompt + additionalContext },
        { inlineData: { mimeType: imageFile.type, data: base64Data } }
      ]
    },
    config: generateConfig
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No content generated.");

  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image returned.");
};