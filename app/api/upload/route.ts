import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { image, name } = body

    if (!image || !name) {
      return NextResponse.json({ error: "Image and name are required" }, { status: 400 })
    }

    // Call the external image upload API
    const response = await fetch("https://upload-images-hosting-get-url.p.rapidapi.com/upload", {
      method: "POST",
      headers: {
        "x-rapidapi-key": "e973e51e4amshab2d42c92a50214p178e13jsn7ddbd1e429f2",
        "x-rapidapi-host": "upload-images-hosting-get-url.p.rapidapi.com",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        image,
        name,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to upload image")
    }

    const data = await response.json()

    return NextResponse.json({
      url: data.data.url
    }, { status: 200})
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
