import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const { word1, word2 } = await req.json();

    if (!word1?.trim() || !word2?.trim()) {
      return NextResponse.json({ error: "Two words required." }, { status: 400 });
    }

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

    const story = completion.choices[0].message.content;
    return NextResponse.json({ story });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Story generation failed. The universe is clearly not cooperating." },
      { status: 500 }
    );
  }
}
