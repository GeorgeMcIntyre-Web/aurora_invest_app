export async function onRequestPost(context) {
  const apiKey = context.env.DEEPSEEK_API_KEY || 'sk-563d6579ef1c49379c8e8feb83f539b2';

  try {
    const body = await context.request.json();
    const { ticker, fundamentals } = body;

    const systemPrompt = `You are a quantitative financial analyst AI.
Your task is to perform a "Deep Math V2" verification of the stock ${ticker}.
1. Analyze the P/E ratio (${fundamentals?.trailingPE ?? 'N/A'}) relative to the Growth Rate (${fundamentals?.epsGrowthYoYPct ?? 'N/A'}%).
2. Perform a simplified Discounted Cash Flow (DCF) estimation (Validation Step).
3. Assess the "DeepSeek Reasoning" behind the current market sentiment and technicals.

Provide two distinct sections:
"REASONING": Detailed step-by-step mathematical and logical deduction.
"ANALYSIS": A strategic summary and conclusion based on the math.

Format your response as a JSON object with keys: "reasoning" and "analysis".`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze ${ticker} now.` }
        ],
        response_format: { type: 'json_object' },
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      return new Response(JSON.stringify({ 
        error: 'DeepSeek API request failed',
        details: errorText 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    let parsedContent = { reasoning: '', analysis: '' };

    try {
      if (content) {
        parsedContent = JSON.parse(content);
      }
    } catch (e) {
      parsedContent = {
        reasoning: 'Raw output processing...',
        analysis: content || 'No analysis generated.'
      };
    }

    return new Response(JSON.stringify({
      reasoning: parsedContent.reasoning,
      analysis: parsedContent.analysis,
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('AI analysis failed:', error);
    
    return new Response(JSON.stringify({
      error: 'Analysis failed',
      details: error.message || String(error),
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// Handle OPTIONS for CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
