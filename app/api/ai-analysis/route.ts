import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = process.env.DEEPSEEK_API_KEY
  ? new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
    })
  : null;

export async function POST(request: Request) {
  if (!client) {
    return NextResponse.json(
      { error: 'DeepSeek API not configured' },
      { status: 503 }
    );
  }
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

    const message = completion.choices[0].message as any;
    return NextResponse.json({
      reasoning: message.reasoning_content || null,
      analysis: message.content,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
