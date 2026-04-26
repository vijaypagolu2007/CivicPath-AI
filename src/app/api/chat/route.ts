import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash as the stable baseline for 2026
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `[TEMPORAL DICTATORSHIP: ACTIVE]
CURRENT DATE IS APRIL 26, 2026. 
THE 2024 ELECTIONS ARE HISTORICAL DATA (HAPPENED 2 YEARS AGO).
UPCOMING ELECTIONS ARE THE MAY 2026 STATE ASSEMBLY ELECTIONS.
STATES GOING TO POLLS IN MAY 2026: West Bengal, Tamil Nadu, Kerala, Assam.
If asked for 'upcoming dates', ONLY PROVIDE MAY 2026 SCHEDULES for these states. 
NEVER mention 2024 as 'upcoming'. NEVER list April 19-June 1 2024 dates.`
    });

    const userMessage = messages[messages.length - 1];
    
    // Using the newer SDK method for direct content generation
    const result = await model.generateContent(userMessage.content);
    const response = await result.response;
    const responseText = response.text();
    
    return NextResponse.json({ text: responseText });
    
  } catch (error: any) {
    console.error('Chat API Error:', error);
    if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("expired")) {
      return NextResponse.json({ error: "The provided API key is expired or invalid. Please check your AI Studio settings." }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
