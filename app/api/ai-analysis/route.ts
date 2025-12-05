import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { ticker, fundamentals, technicals } = await request.json();

    const systemPrompt = `You are a quantitative financial analyst using 'Math V2' logic.
Verify the financial health of ${ticker}.
1. Check if the P/E ratio (${fundamentals.trailingPE}) aligns with the growth rate (${fundamentals.epsGrowthYoYPct}%).
2. Calculate the Intrinsic Value using a simplified DCF.
3. Output your reasoning step-by-step.`;

    const completion = await client.chat.completions.create({
      model: 'deepseek-reasoner',
      messages: [{ role: 'user', content: systemPrompt }],
      stream: false,
    });

    return NextResponse.json({
      reasoning: completion.choices[0].message.reasoning_content,
      analysis: completion.choices[0].message.content,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
