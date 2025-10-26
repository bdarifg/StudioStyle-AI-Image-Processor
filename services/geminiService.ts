
import { GoogleGenAI, Modality } from "@google/genai";

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the "data:image/...;base64," part
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

const processImageWithPrompt = async (
    base64Image: string, 
    mimeType: string, 
    prompt: string
): Promise<string> => {
    // API key is read from environment variables
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType,
                        },
                    },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return part.inlineData.data;
                }
            }
        }
        
        throw new Error("No image data found in Gemini response.");

    } catch (error) {
        console.error("Error processing image with Gemini:", error);
        throw new Error("Failed to process image with AI. Please check the console for more details.");
    }
};

export const removeBackground = async (base64Image: string, mimeType: string): Promise<string> => {
    const prompt = "Please remove the background from this image accurately. Detect complex edges like hair, fabric, or transparent objects. The output should be a clean PNG with a true transparent background, preserving all details, textures, colors, and sharpness of the main subject. Do not add any shadows or enhancements.";
    return processImageWithPrompt(base64Image, mimeType, prompt);
};

export const addWhiteBackground = async (base64Image: string, mimeType: string): Promise<string> => {
    const prompt = "Take this image of a subject and place it on a clean, solid white background (#FFFFFF). Enhance the image to studio quality by correcting the lighting, balancing contrast and brightness, and adding a natural, soft drop shadow beneath the subject to give it depth. Preserve all original details, textures, and colors of the subject.";
    return processImageWithPrompt(base64Image, mimeType, prompt);
};
