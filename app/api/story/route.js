import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { word1, word2 } = body;

    if (!word1?.trim() || !word2?.trim()) {
      return NextResponse.json({ error: "Two words required." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY environment variable." }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an unhinged, wildly creative short story writer. Your specialty is absurdist fiction that is equal parts ridiculous and oddly profound. You have a flair for the dramatic and a complete disregard for narrative convention. Your stories are funny, surprising, and completely unhinged — but always end with a bizarre gut-punch of a final line.`,
        },
        {
          role: "user",
          content: `Write a short story (3–4 punchy paragraphs) using these two words as your only inspiration: "${word1.trim()}" and "${word2.trim()}". 

The words can appear literally or thematically. The more unexpected the connection, the better. Be hilarious. Be dramatic. Be absurd. Do not hold back.`,
        },
      ],
      temperature: 1.1,
      max_tokens: 600,
    });

    const story = completion.choices?.[0]?.message?.content;

    if (!story) {
      return NextResponse.json(
        { error: "No story came back. The muse is unavailable." },
        { status: 502 }
      );
    }

    return NextResponse.json({ story });
  } catch (err) {
    console.error("Story generation error:", err);
    return NextResponse.json(
      { error: err?.message || "Story generation failed. The universe is clearly not cooperating." },
      { status: 500 }
    );
  }
}
