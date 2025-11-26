import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Color, LogoIdea, FontPairing, UXCopy, Tagline, IllustrationIdea, SocialMediaPost, IconIdea, PresentationSlide, BlogPostIdea, ProductName, AdCopy, PhotoShootConcept, PatternIdea, BrandArchetype, CreativeBriefSection, DesignTrend, FuturePredictionResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (file: File) => {
  return new Promise<{ mimeType: string, data: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        // result is "data:mime/type;base64,..."
        const parts = result.split(';base64,');
        const mimeType = parts[0].split(':')[1];
        const data = parts[1];
        resolve({ mimeType, data });
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const generateMoodBoardImages = async (prompt: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Aesthetic, high-quality, professional mood board concept: ${prompt}`,
            config: {
              numberOfImages: 4,
              outputMimeType: 'image/jpeg',
              aspectRatio: '4:3',
            },
        });

        return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
    } catch (error) {
        console.error("Error generating mood board images:", error);
        throw new Error("Failed to generate mood board. Please try again.");
    }
};

const paletteSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "A descriptive name for the color (e.g., 'Sunset Orange', 'Forest Green')." },
        hex: { type: Type.STRING, description: "The hexadecimal code for the color (e.g., '#FF4500')." },
      },
      required: ["name", "hex"],
    },
};

export const generateColorPaletteFromText = async (prompt: string): Promise<Color[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a harmonious and visually appealing 5-color palette based on this theme: "${prompt}". Provide descriptive names for each color.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: paletteSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Color[];
    } catch (error) {
        console.error("Error generating color palette from text:", error);
        throw new Error("Failed to generate color palette. Please check your prompt and try again.");
    }
};

export const generateColorPaletteFromImage = async (imageFile: File): Promise<Color[]> => {
    try {
        const imagePart = { inlineData: await fileToGenerativePart(imageFile) };
        const textPart = { text: "Extract a harmonious and visually appealing 5-color palette from this image. Provide descriptive names for each color." };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: paletteSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Color[];
    } catch (error) {
        console.error("Error generating color palette from image:", error);
        throw new Error("Failed to analyze the image. Please try a different image.");
    }
};


export const generateLogoIdeas = async (companyName: string, description: string): Promise<LogoIdea[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Brainstorm 3 distinct and creative logo concepts for a company named "${companyName}". The company is described as: "${description}". For each concept, provide a name and a detailed visual description.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            concept: { type: Type.STRING, description: "A short, catchy name for the logo concept (e.g., 'The Innovator', 'Organic Growth')." },
                            description: { type: Type.STRING, description: "A detailed visual description of the logo, including shapes, colors, and style." },
                        },
                        required: ["concept", "description"],
                    },
                }
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as LogoIdea[];
    } catch (error) {
        console.error("Error generating logo ideas:", error);
        throw new Error("Failed to generate logo ideas. Please refine your description.");
    }
}

export const suggestFontPairings = async (fontName: string, context: string): Promise<FontPairing[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `I'm using the font "${fontName}" for a project described as: "${context}". Suggest 2 excellent font pairings. For each pairing, suggest a body font and provide a brief rationale for why the pairing works well.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            heading: { type: Type.STRING, description: "The heading font, which should be the one provided by the user." },
                            body: { type: Type.STRING, description: "The suggested complementary body font (e.g., 'Roboto', 'Lato')." },
                            description: { type: Type.STRING, description: "A brief explanation of why this font pairing is effective for the given context." },
                        },
                        required: ["heading", "body", "description"],
                    },
                }
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as FontPairing[];
    } catch (error) {
        console.error("Error generating font pairings:", error);
        throw new Error("Failed to suggest font pairings. Please try again.");
    }
}

export const generateImageFromSketch = async (prompt: string, imageFile: File): Promise<string> => {
    try {
        const imagePart = { inlineData: await fileToGenerativePart(imageFile) };
        const textPart = { text: `Transform this sketch into a high-quality, detailed image based on the following instructions: "${prompt}"` };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        
        throw new Error("The AI did not generate an image. It might have responded with text only. Please try adjusting your prompt.");

    } catch (error) {
        console.error("Error generating image from sketch:", error);
        if (error instanceof Error && error.message.includes("400")) {
             throw new Error("There was an issue with the request. The uploaded image might not be supported or the prompt could be unsafe. Please try again.");
        }
        throw new Error("Failed to generate image. Please try a different sketch or prompt.");
    }
};

export const generateMagicMorphImage = async (prompt: string, imageFile: File): Promise<string> => {
    try {
        const imagePart = { inlineData: await fileToGenerativePart(imageFile) };
        const textPart = { text: `Apply this creative and magical transformation to the image, based on the following prompt: "${prompt}". Morph the shapes and text in the image to match the new style, texture, or concept described.` };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        
        throw new Error("The AI did not generate an image. It might have responded with text only. Please try adjusting your prompt.");

    } catch (error) {
        console.error("Error generating magic morph image:", error);
        if (error instanceof Error && error.message.includes("400")) {
             throw new Error("There was an issue with the request. The uploaded image might not be supported or the prompt could be unsafe. Please try again.");
        }
        throw new Error("Failed to generate image. Please try a different image or prompt.");
    }
};

export const removeImageBackground = async (imageFile: File): Promise<string> => {
    try {
        const imagePart = { inlineData: await fileToGenerativePart(imageFile) };
        const textPart = { text: "Segment the main subject from the background. Make the background fully transparent. The output must be a PNG." };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        
        throw new Error("The AI did not generate an image. It might have responded with text only. Please try again.");

    } catch (error) {
        console.error("Error removing image background:", error);
        if (error instanceof Error && error.message.includes("400")) {
             throw new Error("There was an issue with the request. The uploaded image might not be supported or the prompt could be unsafe. Please try again.");
        }
        throw new Error("Failed to remove background. Please try a different image.");
    }
};

export const enhanceImage = async (imageFile: File, style: string = 'None'): Promise<string> => {
    try {
        const imagePart = { inlineData: await fileToGenerativePart(imageFile) };
        
        const basePrompt = "Act as a state-of-the-art AI image processing engine. Your primary goal is to upscale and enhance this image to a hyper-realistic, crystal-clear quality equivalent to 8K resolution. Your process must be meticulous. First, detect **all faces and bodies** in the photograph. Then, perform a multi-stage enhancement: 1. **Full Image Restoration**: Apply intelligent denoising, correct colors for vibrancy and natural tones, and perform adaptive sharpening across the entire image. 2. **Hyper-Detail Reconstruction**: Reconstruct fine details in textures, fabrics, and backgrounds. 3. **8K Face & Body Enhance**: For every detected person, meticulously restore and enhance facial features (eyes, skin texture, hair strands) and body details (clothing texture, skin tones). The result should be incredibly sharp and clear, rivaling a professional high-resolution photograph. This is the most critical step.";

        const stylePrompts: { [key: string]: string } = {
            'Movie': "After enhancement, apply a cinematic, movie-like color grade. Slightly increase contrast, add a subtle teal and orange look, and a fine grain to mimic film.",
            'Glam': "After enhancement, apply a glamorous, soft-focus beauty effect. Make the skin look exceptionally radiant and smooth, enhance makeup, and add a subtle, flattering bloom effect.",
            'Cute': "After enhancement, apply a 'cute' aesthetic. Slightly enlarge and brighten the eyes, add a touch of rosy blush to the cheeks, and soften the overall image for a sweet, innocent look.",
            'Natural': "After enhancement, prioritize a natural look. Skin texture should be clear but realistic, not overly smooth. Colors should be true to life. The goal is a clean, 'no-makeup' makeup look.",
            'Silk': "After enhancement, create an ultra-smooth, silky skin texture. Minimize all blemishes and pores for a flawless, porcelain-like finish, while keeping eyes and hair sharp.",
            'Charm': "After enhancement, add a warm, charming glow. Increase color saturation slightly, add a gentle warming filter, and ensure the smile looks bright and engaging.",
        };

        const finalPrompt = style && style !== 'None' && stylePrompts[style]
            ? `${basePrompt} 4. **Stylistic Adjustment**: ${stylePrompts[style]} The final output must be a crystal-clear, high-quality, photorealistic PNG image reflecting this style.`
            : `${basePrompt} The final output must be a crystal-clear, high-quality, photorealistic PNG image.`;

        const textPart = { text: finalPrompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        
        throw new Error("The AI did not generate an image. It might have responded with text only. Please try again.");

    } catch (error) {
        console.error("Error enhancing image:", error);
        if (error instanceof Error && error.message.includes("400")) {
             throw new Error("There was an issue with the request. The uploaded image might not be supported or the prompt could be unsafe. Please try again.");
        }
        throw new Error("Failed to enhance the image. Please try a different image.");
    }
};


export const generateUXCopy = async (componentDescription: string): Promise<UXCopy[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate 3 distinct microcopy options for a UI component described as: "${componentDescription}". For each option, provide the copy and a brief rationale for why it's effective.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            option: { type: Type.STRING, description: "The suggested microcopy text." },
                            rationale: { type: Type.STRING, description: "A brief explanation of the copy's strengths (e.g., tone, clarity)." },
                        },
                        required: ["option", "rationale"],
                    },
                }
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as UXCopy[];
    } catch (error) {
        console.error("Error generating UX copy:", error);
        throw new Error("Failed to generate UX copy. Please refine your description.");
    }
}

export const generateTaglines = async (companyName: string, description: string): Promise<Tagline[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate 3 catchy taglines for a company named "${companyName}", which is a "${description}". For each tagline, describe its style (e.g., 'Modern & Punchy', 'Elegant & Trustworthy').`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            tagline: { type: Type.STRING, description: "The suggested tagline." },
                            style: { type: Type.STRING, description: "The style or tone of the tagline." },
                        },
                        required: ["tagline", "style"],
                    },
                }
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Tagline[];
    } catch (error) {
        console.error("Error generating taglines:", error);
        throw new Error("Failed to generate taglines. Please try again.");
    }
}

export const generateIllustrationIdeas = async (theme: string): Promise<IllustrationIdea[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Brainstorm 3 distinct illustration concepts based on the theme: "${theme}". For each concept, provide a name and a detailed visual description including style, color palette, and composition.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            concept: { type: Type.STRING, description: "A short, catchy name for the illustration concept." },
                            description: { type: Type.STRING, description: "A detailed visual description of the illustration." },
                        },
                        required: ["concept", "description"],
                    },
                }
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as IllustrationIdea[];
    } catch (error) {
        console.error("Error generating illustration ideas:", error);
        throw new Error("Failed to generate illustration ideas. Please try again.");
    }
}

export const generateSocialMediaPosts = async (topic: string, platform: string): Promise<SocialMediaPost[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Create 2 different social media post drafts for the platform "${platform}" about the topic "${topic}". Include the post text and a suggestion for a visual to accompany it.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            platform: { type: Type.STRING, description: "The target social media platform." },
                            postText: { type: Type.STRING, description: "The full text for the social media post, including any hashtags." },
                            suggestion: { type: Type.STRING, description: "A suggestion for an accompanying visual (e.g., 'A photo of...', 'An animated GIF of...')." },
                        },
                        required: ["platform", "postText", "suggestion"],
                    },
                }
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as SocialMediaPost[];
    } catch (error) {
        console.error("Error generating social media posts:", error);
        throw new Error("Failed to generate social media posts. Please try again.");
    }
}

export const generateImageDescription = async (imageFile: File): Promise<string> => {
    try {
        const imagePart = { inlineData: await fileToGenerativePart(imageFile) };
        const textPart = { text: "Describe this image in detail. Focus on the main subject, setting, colors, and mood. This description will be used for creative inspiration and accessibility (alt-text)." };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating image description:", error);
        throw new Error("Failed to analyze the image. Please try a different image.");
    }
};


export const generateIconSetIdeas = async (style: string, icons: string): Promise<IconIdea[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Brainstorm descriptive concepts for an icon set. The desired style is "${style}". The icons needed are for: ${icons}. For each icon, provide a concept name and a detailed visual description.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            concept: { type: Type.STRING, description: "The name of the icon (e.g., 'Profile')." },
                            description: { type: Type.STRING, description: "A detailed visual description of the icon's design." },
                        },
                        required: ["concept", "description"],
                    },
                }
            },
        });
        return JSON.parse(response.text.trim()) as IconIdea[];
    } catch (error) {
        console.error("Error generating icon ideas:", error);
        throw new Error("Failed to generate icon ideas. Please try again.");
    }
};

export const generatePresentationSlides = async (topic: string, audience: string): Promise<PresentationSlide[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a 5-slide presentation outline for the topic "${topic}". The target audience is ${audience}. For each slide, provide a title, 3-4 bullet points of content, and a creative visual idea.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: "The title of the slide." },
                            content: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key bullet points for the slide." },
                            visualIdea: { type: Type.STRING, description: "A suggestion for a visual element on the slide." },
                        },
                        required: ["title", "content", "visualIdea"],
                    },
                }
            },
        });
        return JSON.parse(response.text.trim()) as PresentationSlide[];
    } catch (error) {
        console.error("Error generating presentation slides:", error);
        throw new Error("Failed to generate presentation slides. Please try again.");
    }
};

export const generateBlogPostIdeas = async (topic: string): Promise<BlogPostIdea[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate 3 blog post ideas for the topic "${topic}". For each idea, provide a catchy title and a 4-point outline (introduction, point 1, point 2, conclusion).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: "The catchy title of the blog post." },
                            outline: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A 4-point outline for the post." },
                        },
                        required: ["title", "outline"],
                    },
                }
            },
        });
        return JSON.parse(response.text.trim()) as BlogPostIdea[];
    } catch (error) {
        console.error("Error generating blog post ideas:", error);
        throw new Error("Failed to generate blog post ideas. Please try again.");
    }
};

export const generateProductNames = async (description: string): Promise<ProductName[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Brainstorm 5 creative product names for the following product: "${description}". For each name, provide a brief rationale.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "The suggested product name." },
                            rationale: { type: Type.STRING, description: "A brief reason why this name is effective." },
                        },
                        required: ["name", "rationale"],
                    },
                }
            },
        });
        return JSON.parse(response.text.trim()) as ProductName[];
    } catch (error) {
        console.error("Error generating product names:", error);
        throw new Error("Failed to generate product names. Please try again.");
    }
};

export const generateAdCopy = async (product: string, audience: string, platform: string): Promise<AdCopy[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate 2 ad copy variations for a "${product}" targeting "${audience}" on the platform "${platform}". For each, provide a short, punchy headline and a slightly longer body text.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            headline: { type: Type.STRING, description: "The ad headline." },
                            body: { type: Type.STRING, description: "The ad body text." },
                            platform: { type: Type.STRING, description: "The target platform." },
                        },
                        required: ["headline", "body", "platform"],
                    },
                }
            },
        });
        return JSON.parse(response.text.trim()) as AdCopy[];
    } catch (error) {
        console.error("Error generating ad copy:", error);
        throw new Error("Failed to generate ad copy. Please try again.");
    }
};

export const generatePhotoShootConcepts = async (product: string): Promise<PhotoShootConcept[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate 3 distinct photo shoot concepts for a product described as: "${product}". For each, provide a concept name and a detailed description covering mood, setting, props, and lighting.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            concept: { type: Type.STRING, description: "The name of the photo shoot concept." },
                            description: { type: Type.STRING, description: "A detailed description of the concept." },
                        },
                        required: ["concept", "description"],
                    },
                }
            },
        });
        return JSON.parse(response.text.trim()) as PhotoShootConcept[];
    } catch (error) {
        console.error("Error generating photo shoot concepts:", error);
        throw new Error("Failed to generate photo shoot concepts. Please try again.");
    }
};

export const generatePatternIdeas = async (theme: string): Promise<PatternIdea[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Describe 3 unique seamless pattern ideas based on the theme: "${theme}". For each, provide a name and a detailed description of the motifs, color palette, and overall style.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "The name of the pattern." },
                            description: { type: Type.STRING, description: "A detailed description of the pattern." },
                        },
                        required: ["name", "description"],
                    },
                }
            },
        });
        return JSON.parse(response.text.trim()) as PatternIdea[];
    } catch (error) {
        console.error("Error generating pattern ideas:", error);
        throw new Error("Failed to generate pattern ideas. Please try again.");
    }
};

export const identifyBrandArchetype = async (description: string): Promise<BrandArchetype> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following brand description and identify its primary brand archetype (e.g., The Hero, The Sage, The Jester): "${description}". Provide the archetype, a description of it, and 3-4 design cues (colors, typography, imagery) that align with it.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        archetype: { type: Type.STRING, description: "The identified brand archetype." },
                        description: { type: Type.STRING, description: "A description of the archetype." },
                        designCues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Design cues associated with the archetype." },
                    },
                    required: ["archetype", "description", "designCues"],
                }
            },
        });
        return JSON.parse(response.text.trim()) as BrandArchetype;
    } catch (error) {
        console.error("Error identifying brand archetype:", error);
        throw new Error("Failed to identify brand archetype. Please try again.");
    }
};

export const generateCreativeBrief = async (project: string, goal: string): Promise<CreativeBriefSection[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a creative brief for a project named "${project}" with the main goal: "${goal}". Create sections for: Objective, Target Audience, Key Message, and Deliverables.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: "The title of the brief section." },
                            content: { type: Type.STRING, description: "The content of the brief section." },
                        },
                        required: ["title", "content"],
                    },
                }
            },
        });
        return JSON.parse(response.text.trim()) as CreativeBriefSection[];
    } catch (error) {
        console.error("Error generating creative brief:", error);
        throw new Error("Failed to generate creative brief. Please try again.");
    }
};

export const generateDesignTrendExplanation = async (trendName: string): Promise<DesignTrend> => {
    try {
        const response = await ai.models.generateContent({
           model: "gemini-2.5-flash",
           contents: `Please provide an explanation for the design trend "${trendName}". Structure your response as a JSON object with the following keys: "name" (string), "explanation" (string), and "characteristics" (an array of strings).`,
           config: {
             tools: [{googleSearch: {}}],
           },
        });

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(chunk => chunk.web).map(chunk => chunk.web!) as { uri: string; title: string }[] || [];
        const result = JSON.parse(response.text.trim());
        result.sources = sources.map(source => ({ web: source }));
        
        return result as DesignTrend;
    } catch (error) {
        console.error("Error generating design trend explanation:", error);
        throw new Error("Failed to explain design trend. It might be too new or obscure. Try another trend.");
    }
};

export const generateFuturePrediction = async (topic: string, timeframe: string): Promise<Omit<FuturePredictionResult, 'id'|'timestamp'|'topic'|'timeframe'>> => {
    try {
        const response = await ai.models.generateContent({
           model: "gemini-2.5-flash",
           contents: `Acting as a futurist and trend analyst, provide a detailed and well-reasoned prediction about the future of "${topic}" within the timeframe of "${timeframe}". Base your prediction on current trends, data, and potential technological advancements. Structure the prediction with a clear heading and several paragraphs.`,
           config: {
             tools: [{googleSearch: {}}],
           },
        });

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(chunk => chunk.web).map(chunk => chunk.web!) as { uri: string; title: string }[] || [];
        const predictionText = response.text.trim();
        
        return { prediction: predictionText, sources: sources.map(source => ({ web: source })) };
    } catch (error) {
        console.error("Error generating future prediction:", error);
        throw new Error("Failed to generate prediction. The topic might be too complex or obscure. Please try again.");
    }
};

export const generateToyImage = async (prompt: string, category: string, imageFile?: File): Promise<string> => {
    try {
        const styleInstruction = `The style should be a ${category} toy, like a collectible vinyl figure, with a glossy finish, studio lighting, and isolated on a clean, professional background.`;

        if (imageFile) {
            const imagePart = { inlineData: await fileToGenerativePart(imageFile) };
            const textPart = { text: `Using the reference image for inspiration (style, character features, colors), create a vibrant, playful, 3D rendered toy of: ${prompt}. ${styleInstruction}` };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
            throw new Error("The AI did not generate an image. It might have responded with text only. Please try adjusting your prompt.");
        } else {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: `A vibrant, playful, 3D rendered toy of: ${prompt}. ${styleInstruction}`,
                config: {
                  numberOfImages: 1,
                  outputMimeType: 'image/jpeg',
                  aspectRatio: '1:1',
                },
            });
            return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        }
    } catch (error) {
        console.error("Error generating toy image:", error);
         if (error instanceof Error && error.message.includes("400")) {
             throw new Error("There was an issue with the request. The uploaded image might not be supported or the prompt could be unsafe. Please try again.");
        }
        throw new Error("Failed to generate toy image. Please try a different prompt or image.");
    }
};

export const generateVectorStyleImage = async (prompt: string, style: string, aspectRatio: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A high-quality, professional vector graphic of: ${prompt}. Style: ${style}. The image must have clean lines, sharp edges, and a minimalist aesthetic. Generate as an SVG-style illustration on a transparent background.`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png', // Use PNG for transparency
              aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
            },
        });
        return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
    } catch (error) {
        console.error("Error generating vector-style image:", error);
        throw new Error("Failed to generate vector-style image. Please adjust your prompt and try again.");
    }
};

export const generateAIComicStory = async (idea: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a creative comic book writer. Write a short, 3-panel comic book script based on this simple idea: "${idea}". 
            For each panel, describe the scene, the characters, and any dialogue.
            Format the output clearly with "Panel 1:", "Panel 2:", and "Panel 3:".
            The descriptions should be vivid and provide clear instructions for an illustrator.
            Example:
            Panel 1: A majestic castle on a hill at sunset. A lone knight on horseback approaches. Knight (V.O.): "It's been a long journey..."
            Panel 2: Close up on the knight's determined face. He looks up at the castle.
            Panel 3: The massive castle gates begin to open slowly. The knight says, "But the real test is about to begin."`,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating AI comic story:", error);
        throw new Error("Failed to generate the story. Please try a different idea.");
    }
};

export const generateAIComic = async (story: string, style: string, layout: string, bubbleShape: string, fontSize: string): Promise<string> => {
    try {
        const layoutInstruction = layout === 'Auto panel layout'
            ? 'Automatically determine a dynamic and effective panel layout that best serves the story.'
            : `Arrange the story into a ${layout}.`;
            
        const detailedPrompt = `
        Create a single, cohesive comic book page based on the following story and instructions.
        Do not generate individual panels, but a single image that looks like a complete comic page.

        **Story:**
        ${story}

        **Visual Instructions:**
        - **Overall Art Style:** ${style}. This should influence character design, coloring, and line work.
        - **Panel Layout:** ${layoutInstruction}
        - **Speech Bubbles:** Use ${bubbleShape}-shaped speech bubbles for dialogue. Text inside should be clear and legible, with a relative font size of ${fontSize}.
        - **Composition:** Ensure the panels flow logically and create a dynamic reading experience.
        - **Coloring:** Use a vibrant and professional color palette that matches the selected art style.

        Generate the final output as one complete image.
        `;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: detailedPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '3:4', // A common comic book page ratio
            },
        });
        return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    } catch (error) {
        console.error("Error generating AI comic:", error);
        throw new Error("Failed to generate the comic. The prompt might be too complex or contain restricted content. Please try again.");
    }
};

export const generateCharacterDescription = async (name: string, concept: string, traits: string, backstory: string, referenceImages?: File[]): Promise<string> => {
    try {
        const textPrompt = `Based on the following character details AND any provided reference images, generate a detailed and consistent visual description suitable for an image generation AI. Analyze the reference images for style, clothing, accessories, and overall mood. Synthesize these visual cues with the text description to create a cohesive character concept. Be specific about facial features, hair, clothing, body type, and any key accessories to ensure visual consistency.
        
        Name: ${name}
        Concept: ${concept}
        Personality: ${traits}
        Backstory: ${backstory}
        
        Visual Description:`;

        const contents: { parts: any[] } = { parts: [{ text: textPrompt }] };

        if (referenceImages && referenceImages.length > 0) {
            const imageParts = await Promise.all(
                referenceImages.map(file => fileToGenerativePart(file).then(part => ({ inlineData: part })))
            );
            contents.parts.push(...imageParts);
        }
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating character description:", error);
        throw new Error("Failed to generate the character description. Please try again.");
    }
};

export const generateEmoji = async (prompt: string, imageFile?: File): Promise<string> => {
    try {
        if (imageFile) {
            const imagePart = { inlineData: await fileToGenerativePart(imageFile) };
            const textPart = { text: `Turn the person/character in this image into a high-quality, vibrant, expressive, custom emoji based on the following description: "${prompt}". The emoji should be in a digital sticker style with clean lines, bright colors, a glossy finish, and isolated on a transparent background.` };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
            throw new Error("The AI did not generate an image. It might have responded with text only. Please try adjusting your prompt.");
        } else {
            // Text-only generation
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: `A high-quality, vibrant, expressive, custom emoji of: ${prompt}. Style: digital sticker, clean lines, bright colors, glossy finish, isolated on a white background.`,
                config: {
                  numberOfImages: 1,
                  outputMimeType: 'image/png',
                  aspectRatio: '1:1',
                },
            });
            return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
        }
    } catch (error) {
        console.error("Error generating emoji:", error);
        if (error instanceof Error && error.message.includes("400")) {
             throw new Error("There was an issue with the request. The uploaded image might not be supported or the prompt could be unsafe. Please try again.");
        }
        throw new Error("Failed to generate emoji. Please try again.");
    }
};

export const generateSignature = async (name: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A professional, elegant, stylish, handwritten signature for the name "${name}". Style: Calligraphic, clean lines, black ink on a transparent background. The signature should be legible yet artistic. Do not include any other text or elements.`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png', // PNG for transparency
              aspectRatio: '16:9',
            },
        });
        return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
    } catch (error) {
        console.error("Error generating signature:", error);
        throw new Error("Failed to generate signature. Please try a different name or try again later.");
    }
};

export const generateStyledImage = async (prompt: string, imageFile: File): Promise<string[]> => {
    try {
        const imagePart = { inlineData: await fileToGenerativePart(imageFile) };
        const textPart = { text: `Redress the person in this photo to match the following style description: "${prompt}". The final image should be photorealistic, maintaining the person's face and features but changing their clothes and style. The background should be clean and simple, like a studio photoshoot.` };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const images: string[] = [];
        if (response.candidates && response.candidates.length > 0) {
            for (const candidate of response.candidates) {
                for (const part of candidate.content.parts) {
                    if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                        images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                    }
                }
            }
        }
        
        if (images.length === 0) {
            throw new Error("The AI did not generate an image. It might have responded with text only. Please try adjusting your prompt or using a different photo.");
        }
        
        return images;

    } catch (error) {
        console.error("Error generating styled image:", error);
        if (error instanceof Error && error.message.includes("400")) {
             throw new Error("There was an issue with the request. The uploaded image might not be supported or the prompt could be unsafe. Please try again.");
        }
        throw new Error("Failed to generate styled image. Please try a different image or prompt.");
    }
};

export const generateStylePromptsForImage = async (imageFile: File): Promise<string[]> => {
    try {
        const imagePart = { inlineData: await fileToGenerativePart(imageFile) };
        const textPart = { text: "Analyze the person's outfit in this image. Based on their current style, generate 5 creative and distinct fashion styling prompts to digitally redress them. The prompts should be imaginative and describe a complete outfit." };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            prompt: { type: Type.STRING, description: "A creative fashion styling prompt." },
                        },
                        required: ["prompt"],
                    },
                },
            },
        });
        const jsonText = response.text.trim();
        const prompts = JSON.parse(jsonText) as { prompt: string }[];
        return prompts.map(p => p.prompt);
    } catch (error) {
        console.error("Error generating style prompts for image:", error);
        throw new Error("Failed to generate style prompts. Please try a different image.");
    }
};