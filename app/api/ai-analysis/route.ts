import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  console.log('[AI Route] POST request received');

  // TEMPORARY HARDCODED KEY FOR TESTING - Will fix env vars after confirming this works
  const apiKey = 'sk-e2cb09bf9123495f8220731144652b2c';

  console.log('[AI Route] Using API key ending with:', apiKey.slice(-4));

  const client = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: apiKey,
  });

  try {
    const body = await request.json();
    const { ticker, fundamentals, technicals } = body;

    console.log('[AI Route] Request received for ticker:', ticker);

    const systemPrompt = `You are a quantitative financial analyst AI.
Your task is to perform a "Deep Math V2" verification of the stock ${ticker}.
1. Analyze the P/E ratio (${fundamentals?.trailingPE ?? 'N/A'}) relative to the Growth Rate (${fundamentals?.epsGrowthYoYPct ?? 'N/A'}%).
2. Perform a simplified Discounted Cash Flow (DCF) estimation (Validation Step).
3. Assess the "DeepSeek Reasoning" behind the current market sentiment and technicals.

Provide two distinct sections:
"REASONING": Detailed step-by-step mathematical and logical deduction.
"ANALYSIS": A strategic summary and conclusion based on the math.

Format your response as a JSON object with keys: "reasoning" and "analysis".`;

    console.log('[AI Route] Calling DeepSeek API...');

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze ${ticker} now.` }
      ],
      response_format: { type: 'json_object' },
      stream: false,
    });

    console.log('[AI Route] DeepSeek API response received');

    const content = completion.choices[0].message.content;
    let parsedContent = { reasoning: '', analysis: '' };

    try {
      if (content) {
        parsedContent = JSON.parse(content);
        console.log('[AI Route] Successfully parsed JSON response');
      }
    } catch (e) {
      console.warn('[AI Route] JSON parse failed, using fallback:', e);
      parsedContent = {
        reasoning: 'Raw output processing...',
        analysis: content || 'No analysis generated.'
      };
    }

    return NextResponse.json({
      reasoning: parsedContent.reasoning,
      analysis: parsedContent.analysis,
    });
  } catch (error: any) {
    console.error('[AI Route] DeepSeek analysis failed:', error);
    console.error('[AI Route] Error details:', {
      message: error?.message,
      status: error?.status,
      type: error?.type,
      code: error?.code,
    });

    return NextResponse.json({
      error: 'Analysis failed',
      details: error?.message || String(error),
      statusCode: error?.status || 500,
    }, { status: 500 });
  }
}
