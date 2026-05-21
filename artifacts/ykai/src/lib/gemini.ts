import { GoogleGenerativeAI } from '@google/generative-ai';

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

export async function* streamGeminiResponse(
  apiKey: string,
  history: GeminiChatMessage[],
  userMessage: string,
  systemPrompt: string
): AsyncGenerator<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash-latest',
    systemInstruction: systemPrompt,
  });
  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(userMessage);
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}
