import { Agent, InMemoryStorage, VoltOpsClient, VoltAgent } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";
import { createOpenAI } from "@ai-sdk/openai";

/*
const voltOpsClient =
  process.env.VOLTAGENT_PUBLIC_KEY && process.env.VOLTAGENT_SECRET_KEY
    ? new VoltOpsClient({
        publicKey: process.env.VOLTAGENT_PUBLIC_KEY,
        secretKey: process.env.VOLTAGENT_SECRET_KEY,
        observability: true,
        prompts: true,
      })
    : undefined;
*/

// OPENAI_BASE_URL が指定されている場合は baseURL を上書き（プロキシ/オンプレ互換）
const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const quizAgent = new Agent({
  name: "QuizAgent",
  // コンソールのプロンプト管理から取得（フェイル時は従来の文言にフォールバック）
  instructions: async ({ prompts }) => {
    const fallback = "過去の会話文脈を踏まえて、クイズの生成や説明を行うアシスタント。";
    try {
      return await prompts.getPrompt({ promptName: "QuizAgent", label: "production" });
    } catch {
      return fallback;
    }
  },
  llm: new VercelAIProvider(),
  model: openaiProvider("gpt-5-mini-2025-08-07"),
  // DBなし（プロセス内メモリ）
  memory: new InMemoryStorage({ storageLimit: 50 }),
  // 観測・プロンプト管理を有効化
  //...(voltOpsClient ? { voltOpsClient } : {}),
});

export type QuizAgent = typeof quizAgent;

// VoltOps（可観測性）構成
export const voltAgent = new VoltAgent({
  agents: {
    quiz: quizAgent,
  },
  //...(voltOpsClient ? { voltOpsClient } : {}),
});
