// /home/dit/blogs/DITBlogs/app/api/ai/image-gen/route.ts
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Ensure your API key is set in your environment variables
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // --- Image Generation Logic ---
        const result = await genAI.models.generateContent({
            model: 'gemini-2.0-flash-preview-image-generation',
            contents: [
                {
                    role: "user",
                    parts: [{ text: `Generate an image of: ${prompt}` }],
                },
            ],
            config: {
                responseModalities: ['Text', 'Image'],
                candidateCount: 1,
            },
        });

        const parts = (await result).candidates[0]?.content?.parts;
        const imagePart = parts?.find((p: any) => p.inlineData);

        if (imagePart?.inlineData?.data) {
            const { mimeType, data } = imagePart.inlineData;
            const imageUrl = `data:${mimeType};base64,${data}`;

            // The response is Tiptap JSON content for an image node
            return NextResponse.json({ imageUrl });
        } else {
            console.error(
                "Image generation response was empty or invalid:",
                JSON.stringify(result, null, 2)
            );
            throw new Error("Image generation failed: No image data found in the response.");
        }
    } catch (error: any) {
        console.error("AI Generation API Error:", error);
        return NextResponse.json(
            { error: error.message || "An internal server error occurred" },
            { status: 500 }
        );
    }
}