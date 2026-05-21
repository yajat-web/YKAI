export type GeminiChatMessage = {
  role: 'user' | 'model';
  parts: [{ text: string }];
};

const MODE_PROMPTS: Record<string, string> = {
  general: 'You are YKAI, an advanced AI assistant. Be helpful, concise, and intelligent.',
  coding: 'You are YKAI in Coding Assistant mode. Help with programming, debugging, architecture, and code reviews. Provide code examples when relevant. Be precise and technical.',
  trading: 'You are YKAI in Trading Mentor mode. Provide insights on markets, trading strategies, technical analysis, and financial concepts. Always remind users that you provide educational information, not financial advice.',
  fitness: 'You are YKAI in Fitness Coach mode. Help with workout plans, nutrition advice, recovery, and performance optimization. Be motivating and science-backed.',
  study: 'You are YKAI in Study Assistant mode. Help with learning, explaining concepts, summarizing material, creating study plans, and answering academic questions across all subjects.',
  motivation: 'You are YKAI in Motivation Mode. Be inspiring, energetic, and empowering. Help users push past limits, set goals, and maintain drive. Speak with conviction and intensity.',
};

const PERSONALITY_PROMPTS: Record<string, string> = {
  Professional: 'Communicate in a formal, precise, and professional manner.',
  Casual: 'Be friendly, approachable, and conversational. Use a relaxed tone.',
  Technical: 'Be highly technical, detailed, and thorough. Use precise terminology.',
  Creative: 'Be imaginative, expressive, and think outside the box in your responses.',
};

export function buildSystemPrompt(modeId: string, personality: string): string {
  const modePrompt = MODE_PROMPTS[modeId] ?? MODE_PROMPTS.general;
  const personalityPrompt = PERSONALITY_PROMPTS[personality] ?? PERSONALITY_PROMPTS.Professional;
  return `${modePrompt} ${personalityPrompt} Keep responses concise but complete. Do not use markdown formatting — respond in plain text.`;
}

// Direct fetch against the stable v1 endpoint — bypasses the SDK's hardcoded v1beta
export async function* streamGeminiResponse(
  apiKey: string,
  history: GeminiChatMessage[],
  userMessage: string,
  systemPrompt: string
): AsyncGenerator<string> {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [
      ...history,
      { role: 'user', parts: [{ text: userMessage }] },
    ],
    generationConfig: { maxOutputTokens: 8192 },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMsg = `HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(errorText);
      errorMsg = parsed?.error?.message ?? errorText;
    } catch {
      errorMsg = errorText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const json = trimmed.slice(5).trim();
      if (!json || json === '[DONE]') continue;
      try {
        const parsed = JSON.parse(json);
        const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      } catch {
        // skip malformed chunks
      }
    }
  }
}
