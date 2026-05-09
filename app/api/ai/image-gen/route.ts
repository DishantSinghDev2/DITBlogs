import { GoogleGenAI } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // --- Try Imagen 4 first (best quality, dedicated image model) ---
    try {
      const result = await genAI.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: "16:9",
          outputMimeType: "image/jpeg",
        },
      })

      const imageBytes = result.generatedImages?.[0]?.image?.imageBytes
      if (imageBytes) {
        return NextResponse.json({ imageUrl: `data:image/jpeg;base64,${imageBytes}` })
      }
    } catch (imagenErr: any) {
      // Imagen 4 not available for this API key (e.g. needs Vertex AI or allowlist)
      // Fall through to Gemini flash image generation below.
      console.warn("[IMAGE_GEN] Imagen 4 unavailable, falling back to Gemini flash:", imagenErr?.message)
    }

    // --- Fallback: gemini-2.0-flash with native image output ---
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: [{ role: "user", parts: [{ text: `Generate an image of: ${prompt}` }] }],
      config: {
        responseModalities: ["Text", "Image"],
        candidateCount: 1,
      },
    })

    const parts = result.candidates?.[0]?.content?.parts
    const imagePart = parts?.find((p: any) => p.inlineData)

    if (imagePart?.inlineData?.data) {
      const { mimeType, data } = imagePart.inlineData
      return NextResponse.json({ imageUrl: `data:${mimeType};base64,${data}` })
    }

    throw new Error("No image data returned from either model.")

  } catch (error: any) {
    console.error("[IMAGE_GEN]", error)
    return NextResponse.json(
      { error: error.message || "An internal server error occurred" },
      { status: 500 }
    )
  }
}
