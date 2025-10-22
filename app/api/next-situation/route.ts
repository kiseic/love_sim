import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { unstable_noStore as noStore } from 'next/cache';
import { z } from 'zod';
import { voltAgent, quizAgent } from '@/app/lib/voltagent';
import { openai } from '@/app/lib/ai/openai';
import { GenerateProblemResponse, Problem } from '@/app/lib/types';

function extractJsonString(input: string): string {
  const fencedMatch = input.match(/```\s*json\s*([\s\S]*?)\s*```/i) || input.match(/```\s*([\s\S]*?)\s*```/);
  if (fencedMatch && fencedMatch[1]) return fencedMatch[1].trim();
  const firstBrace = input.indexOf('{');
  const lastBrace = input.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return input.slice(firstBrace, lastBrace + 1).trim();
  }
  return input.trim();
}

const requestSchema = z.object({
  previousQuestion: z.string().min(1),
  previousChoices: z
    .object({ a: z.string(), b: z.string(), c: z.string(), d: z.string() }),
  selectedChoice: z.enum(['a', 'b', 'c', 'd']),
});

interface OpenAIProblemResponse {
  question: string;
  choices: { a: string; b: string; c: string; d: string };
}

interface OpenAIResponse {
  problems: OpenAIProblemResponse[];
}

interface LLMResponse {
  text?: string;
}

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
  status?: number;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<Response> {
  console.log('[debug][next-situation] request:', request.body);
  try {
    noStore();
    const raw = await request.json();
    console.log('[debug][next-situation] raw:', raw);
    //const data = requestSchema.parse(raw);

    const cookieStore = await cookies();
    let sid = cookieStore.get('sid')?.value;
    let shouldSetSid = false;
    if (!sid) {
      sid = crypto.randomUUID();
      shouldSetSid = true;
    }
    const userId = sid!;

    // 画像生成（最小変更: api/generate と同様に1枚生成、失敗しても続行）
    let imageDataUrl: string | undefined = undefined;
    try {
      const imagePrompt = [
        `直前のシチュエーション: ${raw.previousQuestion}`,
        raw?.previousChoices ? `選択肢: A:${raw.previousChoices.a} / B:${raw.previousChoices.b} / C:${raw.previousChoices.c} / D:${raw.previousChoices.d}` : '',
        `ユーザーの選択: ${String(raw.selectedChoice).toUpperCase()}`,
        '上記の文脈から自然に続く次の場面を、やわらかい色調の正方形イメージとして生成してください。',
        'テキストやロゴは入れないこと。人物は自然体で、抽象・概念図ではなくシーンの雰囲気が伝わる絵にしてください。'
      ].filter(Boolean).join('\n');
      console.log('[debug][next-situation:image] prompt.head:', imagePrompt.slice(0, 200));
      const imgRes = await openai.images.generate({
        model: 'dall-e-3',
        prompt: imagePrompt,
        size: '1024x1024'
      });
      const imageData = imgRes?.data?.[0];
      const b64 = (imageData as { b64_json?: string; b64Json?: string })?.b64_json || 
                  (imageData as { b64_json?: string; b64Json?: string })?.b64Json || undefined;
      if (b64) {
        imageDataUrl = `data:image/png;base64,${b64}`;
        console.log('[debug][next-situation:image] got b64_json length:', b64.length);
      } else if ((imageData as { url?: string })?.url) {
        imageDataUrl = String((imageData as { url?: string }).url);
        console.log('[debug][next-situation:image] got url:', imageDataUrl);
      }
    } catch (e) {
      console.warn('[debug][next-situation] image-generate failed:', e);
    }

    //const systemPrompt = createSystemPrompt(data);
    //const userPrompt = createUserPrompt(data);
    //const prompt = `${systemPrompt}\n\n${userPrompt}`;
    const prompt = `「${raw.previousQuestion}」というシチュエーションにおいて、\n\n ${raw.selectedChoice}という選択肢を選びました。この選択肢を選んだことにより、次に進むべきシチュエーションが生まれます。\n\n選択肢を踏まえた次のシチュエーションを考え、その内容をquestionに、そこで取ることのできる選択肢をchoicesに4択で含めて解答してください。\n\n応答形式:\n{\n  "problems": [\n    {\n      "question": "問題文",\n      "choices": { "a": "選択肢1", "b": "選択肢2", "c": "選択肢3", "d": "選択肢4" }\n    }\n  ]\n}`;
    console.log('[debug][next-situation] prompt:', prompt);
    const selectedAgent = voltAgent.getAgent('quiz') || quizAgent;
    const res = await selectedAgent.generateText(prompt, { userId, conversationId: sid! });
    console.log('[debug][next-situation] res:', res);
    const content = typeof res === 'string' ? res : ((res as LLMResponse).text ?? String(res));
    if (!content) throw new Error('LLMからの応答が空です');

    let parsed: OpenAIResponse;
    try {
      parsed = JSON.parse(extractJsonString(content)) as OpenAIResponse;
    } catch {
      const err = new Error('failed_to_parse_llm_json') as ErrorWithStatusCode;
      err.statusCode = 502;
      throw err;
    }
    if (!parsed || !Array.isArray(parsed.problems)) {
      const err = new Error('invalid_llm_json_shape') as ErrorWithStatusCode;
      err.statusCode = 502;
      throw err;
    }

    const problems: Problem[] = parsed.problems.map((p, index) => ({
      id: `${Date.now()}-${index}`,
      type: 'general',
      /*
      subject: data.subject,
      difficulty: data.difficulty || 'medium',
      answer: data.includeAnswer ? p.answer : undefined,
      explanation: data.includeExplanation ? p.explanation : undefined,
      hints: data.includeHints ? p.hints : undefined,
      questionType: data.questionType,
      choices: data.questionType === 'multiple_choice' ? p.choices : undefined,
      metadata: { topic: undefined, estimatedTime: p.estimatedTime, model: 'via-volt-agent' },
      createdAt: new Date(),
      */
      difficulty: 'medium',
      question: p.question,
      choices: p.choices,
      metadata: {
        ...(index === 0 && imageDataUrl ? { tags: [`image:${imageDataUrl}`] } : {})
      },
      createdAt: new Date(),
    }));

    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (shouldSetSid && sid) headers.append('Set-Cookie', `sid=${sid}; Path=/; HttpOnly; SameSite=Lax`);
    const response: GenerateProblemResponse = { problems };
    return new Response(JSON.stringify(response), { status: 200, headers });
  } catch (error) {
    console.error('[debug][next-situation] error:', request.body);
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: '入力内容に問題があります', details: error.errors.map((e) => ({ path: e.path, message: e.message })) }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.error('Error generating next situation:', error);
    const err = error as ErrorWithStatusCode;
    const message = err instanceof Error ? String(err.message || '') : String(err ?? '');
    const lower = message.toLowerCase();
    if (
      lower.includes('getaddrinfo') ||
      lower.includes('enotfound') ||
      lower.includes('eai_again') ||
      lower.includes('econnreset') ||
      lower.includes('socket hang up') ||
      lower.includes('fetch failed') ||
      lower.includes('etimedout') ||
      lower.includes('econnrefused') ||
      lower.includes('network error')
    ) {
      return new Response(
        JSON.stringify({ error: 'LLMサービスに接続できません（DNS/ネットワーク）。ネットワーク設定またはプロキシを確認してください。' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const status = typeof err?.statusCode === 'number' ? err.statusCode : typeof err?.status === 'number' ? err.status : 500;
    return new Response(
      JSON.stringify({ error: '次のシチュエーション生成中にエラーが発生しました' }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function createSystemPrompt(data: z.infer<typeof requestSchema>): string {
  return `あなたは会話型シチュエーション問題の作成専門家です。直前の選択や文脈を踏まえ、自然な流れで次のシチュエーション問題を1つだけ生成してください。\n必ずJSON形式で回答してください。\n応答形式\n{\n  "problems": [\n    {\n      "question": "問題文",\n      "question_type": "multiple_choice | fill_in_the_blank | short_answer",\n      "answer": "IncludeAnswerがtrueの場合のみ",\n      "explanation": "IncludeExplanationがtrueの場合のみ",\n      "hints": ["ヒント1", "ヒント2"],\n      "estimatedTime": 2\n    }\n  ]\n}`;
}

function createUserPrompt(data: z.infer<typeof requestSchema>): string {
  const lines: string[] = [];
  lines.push('直前の問題文:');
  lines.push(data.previousQuestion);
  if (data.previousChoices) {
    lines.push('直前の選択肢:');
    lines.push(`A: ${data.previousChoices.a}`);
    lines.push(`B: ${data.previousChoices.b}`);
    lines.push(`C: ${data.previousChoices.c}`);
    lines.push(`D: ${data.previousChoices.d}`);
  }
  if (data.selectedChoice) {
    lines.push(`ユーザーが選んだ選択肢: ${data.selectedChoice.toUpperCase()}`);
  }
  lines.push('次のシチュエーション問題を1つ、自然な流れで続けてください。');
  /*
  if (data.subject) lines.push(`科目/コンテキスト: ${data.subject}`);
  if (data.difficulty) lines.push(`難易度: ${data.difficulty}`);
  if (data.includeExplanation) lines.push('詳細な解説を含めてください。');
  if (data.includeHints) lines.push('2つのヒントを含めてください。');
  if (data.questionType) {
    if (data.questionType === 'multiple_choice') {
      lines.push('問題形式: 4択（choices を含める）');
    } else if (data.questionType === 'fill_in_the_blank') {
      lines.push('問題形式: 空欄補充');
    } else if (data.questionType === 'short_answer') {
      lines.push('問題形式: 記述式');
    }
  }
  */
  return lines.join('\n');
}

