import { GoogleGenAI } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Imagen 3 — Google's latest dedicated image generation model (May 2025)
    // Produces photorealistic, high-quality images with better prompt adherence
    // than the Gemini flash preview model.
    const result = await genAI.models.generateImages({
      model: "imagen-3.0-generate-001",
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "16:9",        // Ideal for blog featured images
        outputMimeType: "image/jpeg",
        safetyFilterLevel: "BLOCK_SOME",
      },
    })

    const imageBytes = result.generatedImages?.[0]?.image?.imageBytes
    if (!imageBytes) {
      console.error("Imagen 3 response had no image bytes:", JSON.stringify(result, null, 2))
      throw new Error("Image generation failed: no image returned.")
    }

    // Return as a data URL so the ImageUploader can display and then re-upload
    // to permanent storage (R2 / S3) via /api/upload before saving.
    const imageUrl = `data:image/jpeg;base64,${imageBytes}`
    return NextResponse.json({ imageUrl })

  } catch (error: any) {
    console.error("[IMAGE_GEN]", error)
    return NextResponse.json(
      { error: error.message || "An internal server error occurred" },
      { status: 500 }
    )
  }
}
