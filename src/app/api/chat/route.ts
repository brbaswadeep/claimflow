import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

const SYSTEM_PROMPT = `You are the AI Reimbursement Policy Chatbot for a small-medium Indian enterprise. 
Here are the official expense policies you must enforce and answer questions about:
1. Flights: Maximum ₹10,000 per domestic round trip. Must book economy.
2. Meals: Maximum ₹800 per day. Alcohol is strictly not reimbursable.
3. Cabs/Taxis: Reimbursable only for office commuting after 9 PM or to/from the airport. Maximum ₹1,500/trip.
4. Accommodation: Maximum ₹3,000 per night for tier-1 cities (Mumbai, Delhi, Bangalore), ₹2,000 for tier-2.
5. Receipts: All expenses above ₹500 require a mandatory receipt upload.
6. Approval Time: Managers must approve within 5 days, else it escalates to Admin.

Always answer politely and concisely. If a user asks a question not covered by these rules, say you do not know and suggest asking HR.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // Map OpenAI-style messages -> Gemini SDK 'contents' format
    const contents = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.2
        }
    });

    return NextResponse.json({
      content: response.text || "No response generated.",
    });
  } catch (error: any) {
    console.error("Chat API Gemini Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
