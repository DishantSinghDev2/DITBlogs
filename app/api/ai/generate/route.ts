import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { JSONContent } from "@tiptap/core"; // Import JSONContent

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

const defaultContent: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Start writing here...",
        },
      ],
    },
  ],
};

async function validateJSONContent(content: JSONContent): Promise<boolean> {
  // Basic validation to ensure the content matches the required structure
  return (
    content.type === "doc" &&
    Array.isArray(content.content) &&
    content.content.every(
      (node) =>
        node.type &&
        node.content &&
        Array.isArray(node.content) &&
        node.content.length > 0 // Ensure the node has non-empty content
    )
  );
}

async function convertTextToJSONContent(text: string): Promise<JSONContent> {
  try {
    // 1. Attempt to directly parse the text. This works if the AI is already generating valid JSON.
    try {
      const parsedContent: JSONContent = JSON.parse(text);
      // Filter out empty nodes
      parsedContent.content = (parsedContent.content ?? []).filter(
        (node) =>
          node.type &&
          node.content &&
          Array.isArray(node.content) &&
          node.content.length > 0
      );
      return parsedContent;
    } catch (directParseError) {
      console.log("Direct JSON parse failed. Attempting to extract JSON from text.");
      // If that fails, attempt to extract the JSON from a code block.
      const jsonRegex = /```(?:json)?\n([\s\S]*?)\n```/; // Matches ```json ... ``` or ``` ... ```
      const match = text.match(jsonRegex);

      if (match && match[1]) {
        try {
          const extractedJson = match[1].trim();
          const parsedContent: JSONContent = JSON.parse(extractedJson);
          // Filter out empty nodes
          parsedContent.content = (parsedContent.content ?? []).filter(
            (node) =>
              node.type &&
              node.content &&
              Array.isArray(node.content) &&
              node.content.length > 0
          );
          return parsedContent;
        } catch (extractionParseError) {
          console.error("Extraction parse error:", extractionParseError);
          throw new Error("Failed to parse extracted JSON: " + (extractionParseError as Error).message);
        }
      } else {
        console.log("No JSON code block found. Attempting to create basic JSON.");
        // As a last resort, create basic JSON with the text in a paragraph
        return {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: text }],
            },
          ],
        };
      }
    }
  } catch (error: any) {
    console.error("Failed to convert text to JSON content:", error);
    throw new Error("Failed to convert text to JSON content: " + error.message);
  }
}


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, currentContent, mode } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Select the appropriate model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let systemPrompt = "";
    let userPrompt = "";

    // Configure the prompt based on the mode
    // Configure the prompt based on the mode
    switch (mode) {
      case "write":
        systemPrompt = `
      I. Core (Must Follow):
      JSON: Every document is a single JSON object: {"type": "doc", "content": [ ... ]}.
      content Array: Holds document elements (paragraphs, headings, lists, etc.) in correct order.
      
      II. Element Syntax (Examples):
      Paragraph: {"type": "paragraph", "content": [{"type": "text", "text": "text"}]}
      Heading: {"type": "heading", "attrs": {"level": 1}, "content": [{"type": "text", "text": "text"}]} (level: 1-6)
      Bullet List: {"type": "bulletList", "content": [list items...]} (each item is a listItem containing a paragraph)
      Code Block: {"type": "codeBlock", "attrs": {"language": "javascript"}, "content": [{"type": "text", "text": "code"}]} (language optional)
      Image: {"type": "image", "attrs": {"src": "url", "alt": "alt", "title": "title"}}
      Horizontal Rule: {"type": "horizontalRule"}
      Task List: {"type": "taskList", "content": [task items...]} (each item is taskItem with attrs: {"checked": true/false})
      Blockquote: {"type": "blockquote", "content": [ paragraph]}
      
      III. Text Formatting (Marks):
      Apply to text: {"type": "text", "text": "text", "marks": [mark array]}
      Marks: "bold", "italic", "code", "strike", "superscript", "subscript", "link" (requires href, target, rel), "highlight" (requires color)
      
      IV. AI Keys (Consistency):
      Strict Schema: AI must follow the exact element structure.

      You are a professional blog writer. Write high-quality, engaging content based on the user's request. Return the content in JSON format that is suitable for a Tiptap editor. Content should be in JSON format. Do not include any other text or explanation at all.
    `;
        userPrompt = prompt;
        break;
      case "improve":
        systemPrompt = `
      I. Core (Must Follow):
      JSON: Every document is a single JSON object: {"type": "doc", "content": [ ... ]}.
      content Array: Holds document elements (paragraphs, headings, lists, etc.) in correct order.
      
      II. Element Syntax (Examples):
      Paragraph: {"type": "paragraph", "content": [{"type": "text", "text": "text"}]}
      Heading: {"type": "heading", "attrs": {"level": 1}, "content": [{"type": "text", "text": "text"}]} (level: 1-6)
      Bullet List: {"type": "bulletList", "content": [list items...]} (each item is a listItem containing a paragraph)
      Code Block: {"type": "codeBlock", "attrs": {"language": "javascript"}, "content": [{"type": "text", "text": "code"}]} (language optional)
      Image: {"type": "image", "attrs": {"src": "url", "alt": "alt", "title": "title"}}
      Horizontal Rule: {"type": "horizontalRule"}
      Task List: {"type": "taskList", "content": [task items...]} (each item is taskItem with attrs: {"checked": true/false})
      Blockquote: {"type": "blockquote", "content": [ paragraph]}
      
      III. Text Formatting (Marks):
      Apply to text: {"type": "text", "text": "text", "marks": [mark array]}
      Marks: "bold", "italic", "code", "strike", "superscript", "subscript", "link" (requires href, target, rel), "highlight" (requires color)
      
      IV. AI Keys (Consistency):
      Strict Schema: AI must follow the exact element structure.

      You are a professional editor. Improve the following content while maintaining its original meaning. Return the content in JSON format that is suitable for a Tiptap editor. Content should be updated by instruction. No extra text or explanation.
      Content should be in JSON format. Do not include any other text or explanation at all.
    `;
        userPrompt = `Improve the following content based on this instruction: ${prompt}\n\nContent to improve: ${currentContent}`;
        break;
      case "image":
        systemPrompt = `
      You are a professional image description generator. Create detailed image descriptions that can be used for AI image generation.
    `;
        userPrompt = `Create a detailed image description for: ${prompt}`;
        break;
      default:
        systemPrompt = `
      I. Core (Must Follow):
      JSON: Every document is a single JSON object: {"type": "doc", "content": [ ... ]}.
      content Array: Holds document elements (paragraphs, headings, lists, etc.) in correct order.
      
      II. Element Syntax (Examples):
      Paragraph: {"type": "paragraph", "content": [{"type": "text", "text": "text"}]}
      Heading: {"type": "heading", "attrs": {"level": 1}, "content": [{"type": "text", "text": "text"}]} (level: 1-6)
      Bullet List: {"type": "bulletList", "content": [list items...]} (each item is a listItem containing a paragraph)
      Code Block: {"type": "codeBlock", "attrs": {"language": "javascript"}, "content": [{"type": "text", "text": "code"}]} (language optional)
      Image: {"type": "image", "attrs": {"src": "url", "alt": "alt", "title": "title"}}
      Horizontal Rule: {"type": "horizontalRule"}
      Task List: {"type": "taskList", "content": [task items...]} (each item is taskItem with attrs: {"checked": true/false})
      Blockquote: {"type": "blockquote", "content": [ paragraph]}
      
      III. Text Formatting (Marks):
      Apply to text: {"type": "text", "text": "text", "marks": [mark array]}
      Marks: "bold", "italic", "code", "strike", "superscript", "subscript", "link" (requires href, target, rel), "highlight" (requires color)
      
      IV. AI Keys (Consistency):
      Strict Schema: AI must follow the exact element structure.

      You are a helpful writing assistant. Return the content in JSON format that is suitable for a Tiptap editor.
    `;
        userPrompt = prompt;
    }


    // Generate content
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
      ],
    });

    const response = result.response;
    const generatedText = response.text();

    // Validate and return data based on the mode
    let responseData: { content: JSONContent };
    switch (mode) {
      case "write":
      case "improve":
        responseData = { content: await convertTextToJSONContent(generatedText) };
        break;
      case "image":
        responseData = { content: defaultContent }; // Image case must return JSONContent as well. It's best to provide default content or an error.
        break;
      default:
        responseData = { content: await convertTextToJSONContent(generatedText) };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}