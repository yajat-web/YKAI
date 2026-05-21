export type GeminiChatMessage = {
  role: "user" | "model";
  parts: [{ text: string }];
};

const MODE_PROMPTS: Record<string, string> = {
  general:
    "You are YKAI, an advanced AI assistant. Be helpful, concise, and intelligent.",
  coding:
    "You are YKAI in Coding Assistant mode. Help with programming, debugging, architecture, and code reviews. Provide code examples when relevant. Be precise and technical.",
  trading:
    "You are YKAI in Trading Mentor mode. Provide insights on markets, trading strategies, technical analysis, and financial concepts. Always remind users that you provide educational information, not financial advice.",
  fitness:
    "You are YKAI in Fitness Coach mode. Help with workout plans, nutrition advice, recovery, and performance optimization. Be motivating and science-backed.",
  study:
    "You are YKAI in Study Assistant mode. Help with learning, explaining concepts, summarizing material, creating study plans, and answering academic questions across all subjects.",
  motivation:
    "You are YKAI in Motivation Mode. Be inspiring, energetic, and empowering. Help users push past limits, set goals, and maintain drive. Speak with conviction and intensity.",
};

const PERSONALITY_PROMPTS: Record<string, string> = {
  Professional: "Communicate in a formal, precise, and professional manner.",
  Casual: "Be friendly, approachable, and conversational. Use a relaxed tone.",
  Technical:
    "Be highly technical, detailed, and thorough. Use precise terminology.",
  Creative:
    "Be imaginative, expressive, and think outside the box in your responses.",
};

export function buildSystemPrompt(modeId: string, personality: string): string {
  const modePrompt = MODE_PROMPTS[modeId] ?? MODE_PROMPTS.general;
  const personalityPrompt =
    PERSONALITY_PROMPTS[personality] ?? PERSONALITY_PROMPTS.Professional;
  return `${modePrompt} ${personalityPrompt} Keep responses concise but complete. Do not use markdown formatting — respond in plain text.`;
}

// Direct fetch against the stable v1 endpoint — bypasses the SDK's hardcoded v1beta
export async function* streamGeminiResponse(
  apiKey: string,
  history: GeminiChatMessage[],
  userMessage: string,
  systemPrompt: string,
): AsyncGenerator<string> {
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const body = {
    model: "llama-3.1-8b-instant",
    messages: [
      ...history.map((m: any) => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.parts?.[0]?.text || "",
      })),
      {
        role: "user",
        content: userMessage,
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
    stream: false,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Request failed");
  }

  yield data.choices?.[0]?.message?.content || "No response";
  }

 