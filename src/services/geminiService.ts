import { GoogleGenAI, Type, Schema } from "@google/genai";
import { HomeraAiRequest } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Step 1: Interpret the user's request into a structured JSON plan.
 * Uses `gemini-2.5-flash` for fast reasoning and JSON output.
 * 
 * AUTOMATIC UPSCALING LOGIC IMPLEMENTED HERE:
 * The prompt strictly forces the model to select the correct resolution based on tier.
 */
export const interpretRequest = async (prompt: string, userTier: string = 'FREE'): Promise<HomeraAiRequest> => {
  const modelId = "gemini-2.5-flash";

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      interpretation: {
        type: Type.STRING,
        description: "A natural language summary of what will be done, explaining the transformation to the user.",
      },
      homera_ai_api_payload: {
        type: Type.OBJECT,
        properties: {
          image_url: { type: Type.STRING, description: "Use placeholder '<uploaded_image_blob>'" },
          task_type: { 
            type: Type.STRING, 
            enum: ['RENOVATION', 'STAGING', 'DECLUTTER', 'STYLE_TRANSFER'] 
          },
          style: { type: Type.STRING, description: "The architectural style (e.g. Modern, Japandi)" },
          objects_to_remove: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          description: { 
            type: Type.STRING, 
            description: "A highly detailed, visual description of the final image for the generative engine." 
          },
          quality: { type: Type.STRING, enum: ['DRAFT', 'STANDARD', 'HIGH', 'HIGH_DETAIL', 'ULTRA_REALISTIC'] },
          target_resolution: { type: Type.STRING, description: "The resolution dimensions, e.g., '1920x1080'." },
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
      
      User Subscription Tier: ${userTier}

      AUTOMATIC UPSCALING RULES (MANDATORY):
      - FREE Tier: Output MUST be '1920x1080'. Quality 'STANDARD'.
      - PREMIUM_2K Tier: Output MUST be '2560x1440'. Quality 'HIGH_DETAIL'.
      - ULTRA_4K Tier: Output MUST be '3840x2160'. Quality 'ULTRA_REALISTIC'.
      - ULTRA_16K Tier: Output MUST be '15369x8640'. Quality 'ULTRA_REALISTIC'.

      You must strictly adhere to the resolution for the provided tier. Users cannot override this.

      Determine the task type, style, and objects to remove.
      Most importantly, write a 'description' that is a vivid, standalone prompt for an image generation model to execute this change on an existing image.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.2, // Low temperature for consistent JSON
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to interpret request.");
  
  return JSON.parse(text) as HomeraAiRequest;
};

/**
 * Step 2: Execute the transformation.
 * Uses `gemini-2.5-flash-image` (simulating the Homera Studios Ai rendering engine).
 */
export const executeTransformation = async (imageFile: File, refinedPrompt: string): Promise<string> => {
  const modelId = "gemini-2.5-flash-image"; // The visual expert model

  // Convert file to Base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const response = await ai.models.generateContent({
    model: modelId,
    contents: {
      parts: [
        {
          text: refinedPrompt 
            + " Maintain the structural integrity of the room (walls, windows, ceiling) unless explicitly told to renovate them. "
            + "Ensure photorealistic lighting and textures suitable for high-end real estate."
        },
        {
          inlineData: {
            mimeType: imageFile.type,
            data: base64Data
          }
        }
      ]
    }
  });

  // Extract the image from the response
  // The SDK might return multiple parts, we look for the inlineData
  const parts = response.candidates?.[0]?.content?.parts;
  
  if (!parts) throw new Error("No content generated.");

  // Iterate to find the image part
  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("The model did not return an image. It might have refused the request.");
};