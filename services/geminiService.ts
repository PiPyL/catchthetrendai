import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        resolve({ mimeType: file.type, data: base64String });
      } else {
        reject(new Error('Could not read the file as a base64 string.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const generatePromptFromTrend = async (trendImageFile: File, faceImageFile: File, additionalInfo: string): Promise<{ initialPrompt: string; finalPrompt: string }> => {
  // Step 1: Analyze the trend image to create a base prompt using a more detailed prompt.
  const trendImage = await fileToBase64(trendImageFile);
  const analyzePrompt = `As an expert AI image prompt creator, analyze this image in great detail. Then, create a single, detailed prompt to generate a similar image.
  
  ### Return result:
  Only return the content of the prompt, without any additional explanation.`;

  const analyzeResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{
        parts: [
            { text: analyzePrompt },
            { inlineData: { mimeType: trendImage.mimeType, data: trendImage.data } }
        ]
    }],
     config: {
      temperature: 0.4,
    },
  });

  const initialPrompt = analyzeResponse.text.trim();

  // Step 2: Refine the prompt with the face image using a structured prompt with clear instructions.
  const faceImage = await fileToBase64(faceImageFile);

  const additionalInfoPrompt = additionalInfo ? `Based on the additional information provided by the user in the ADDITIONAL INSTRUCTIONS section, update the prompt's content to better match the user's request while ensuring it does not affect the image trend.

### ADDITIONAL INSTRUCTIONS: "${additionalInfo}"` : ""

const refinePromptText = `You are an expert in creating prompts for AI image generation. Perform the following task:

- Trend AI image prompt template: This is a prompt template for an AI image trend that is currently popular on social media.
- The user wants to create a trend image from the character in the photo they provided. Perform a detailed analysis of the character's image. Then, create a prompt from the template provided below to generate a trend image that suits the character provided by the user.
- IMPORTANT: **Ensure the face in the generated AI image retains the facial features of the character in the user-provided image.**
- If the user's character image contains fashion information, use that fashion information to update the prompt (if the AI image trend does not focus on fashion such as shirts, pants, hats, etc.) to create an AI image that is most suitable for the character.

${additionalInfoPrompt}

### Trend AI image prompt template:
${initialPrompt}

### Return result:
- **Only return the content of the prompt, without any additional explanation.**
`
  
  const refineResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{
        parts: [
            { text: refinePromptText },
            { inlineData: { mimeType: faceImage.mimeType, data: faceImage.data } }
        ]
    }],
     config: {
      temperature: 0.2,
    },
  });
  
  const finalPrompt = refineResponse.text.trim();
  return { initialPrompt, finalPrompt };
};

export const createTrendImage = async (prompt: string, faceImageFile: File): Promise<{ imageUrl: string; text: string }> => {
  const faceImage = await fileToBase64(faceImageFile);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: [{
      parts: [
        { inlineData: { mimeType: faceImage.mimeType, data: faceImage.data } },
        { text: prompt },
      ],
    }],
    config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  let imageUrl = '';
  let text = 'No text response from the model.';

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    } else if (part.text) {
      text = part.text;
    }
  }

  if (!imageUrl) {
    throw new Error('Image generation failed. The model did not return an image.');
  }

  return { imageUrl, text };
};