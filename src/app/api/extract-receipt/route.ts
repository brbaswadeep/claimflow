import Object from "node:util"; // just for unused reference
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client strictly pointing to NVIDIA NIM
const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export async function POST(req: Request) {
  try {
    const { base64Image } = await req.json();

    if (!base64Image) {
      return NextResponse.json({ error: "Missing base64Image" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "meta/llama-3.2-90b-vision-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this receipt image and extract the following details precisely as structured JSON:
- amount: (number) total amount paid. Strip currency symbols. If not found, use 0.
- merchant: (string) name of the vendor or merchant. If not found, use "Unknown".
- date: (string) ISO format date (YYYY-MM-DD) if available. If not, use current date or empty string.
- tax: (number) total tax amount. If not found, use 0.

Respond ONLY with valid JSON and nothing else.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1024,
      temperature: 0.1, // Keep it deterministic
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from AI");
    }

    // Clean up potential markdown formatting
    let cleanedContent = content;
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/^```\n/, "").replace(/\n```$/, "");
    }
    
    // Attempt parsing
    const parsedData = JSON.parse(cleanedContent.trim());

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("Receipt Extraction Error:", error);
    return NextResponse.json({ error: error.message || "Failed to extract receipt data" }, { status: 500 });
  }
}
