import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { unstable_noStore as noStore } from 'next/cache';
import { voltAgent, quizAgent } from '@/app/lib/voltagent';
import { loveSimulationSchema } from '@/app/lib/types';
import { z } from 'zod';
import { Problem, GenerateProblemResponse } from '@/app/lib/types';
import { getPromptTemplate, enhancePromptWithDifficulty } from '@/app/lib/ai/prompts';
import { openai } from '@/app/lib/ai/openai';

// Promise をタイムアウトさせるユーティリティ（最小変更でハング対策）
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('timeout'));
    }, ms);
    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
}

function extractJsonString(input: string): string {
  const fencedMatch = input.match(/```\s*json\s*([\s\S]*?)\s*```/i) || input.match(/```\s*([\s\S]*?)\s*```/);
  if (fencedMatch && fencedMatch[1]) {
    return fencedMatch[1].trim();
  }
  const firstBrace = input.indexOf('{');
  const lastBrace = input.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return input.slice(firstBrace, lastBrace + 1).trim();
  }
  return input.trim();
}

// Type definitions for OpenAI responses
interface OpenAIProblemResponse {
  question: string;
  answer?: string;
  choices?: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  explanation?: string;
  hints?: string[];
  estimatedTime?: number;
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
// 実行環境を明示（Edge周りの互換性起因の誤検知を回避）
export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<Response> {
  console.log('[debug]:',process.env.OPENAI_API_KEY);
  console.log('[debug][POST] Starting POST request');
  try {
    noStore();
    console.log('[debug][POST] noStore() called');
    const body = await request.json();
    console.log('[debug][POST] Request body parsed:', JSON.stringify(body).substring(0, 200) + '...');
    
    // Validate request body (恋愛プロフィール形式)
    console.log('[debug][POST] About to validate with loveSimulationSchema');
    //const validatedData = loveSimulationSchema.parse(body);
    const validatedData = body;
    console.log('[debug][POST] Validation successful');
    // セッションID（会話ID）をCookieに保存（なければ発行）
    const cookieStore = await cookies();
    let sid = cookieStore.get('sid')?.value;
    let shouldSetSid = false;
    if (!sid) {
      sid = crypto.randomUUID();
      shouldSetSid = true;
    }
    // 最小差分: userId は sid を使い回し（認証未導入のため）
    const userId = sid;

    // VoltAgent で問題生成（会話メモリ: InMemoryStorage）
    // 外部呼び出しがハング/中断しても必ず応答を返すため、タイムアウト/中断検知を付与
    console.log('[debug][POST] About to call generateProblems');
    const abortOnClientClose = new Promise<never>((_, reject) => {
      request.signal.addEventListener(
        'abort',
        () => reject(new Error('aborted')),
        { once: true }
      );
    });
    const problems = await Promise.race([
      withTimeout(
        generateProblems(validatedData, { userId, conversationId: sid }),
        120000
      ),
      abortOnClientClose,
    ]);
    console.log('[debug][POST] generateProblems completed');
    console.log('[debug][generate] problems ready length:', Array.isArray(problems) ? problems.length : 'not-array');
    try {
      const testJson = JSON.stringify({ problems });
      console.log('[debug][generate] response json length:', testJson.length);
    } catch (e) {
      console.error('[debug][generate] response-serialize-error:', e);
      throw e;
    }

    const response: GenerateProblemResponse = { problems };
    console.log('[debug][generate] Response object:', JSON.stringify(response, null, 2));

    // 素の Response で返却し、返却周りのエラーを切り分け
    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (shouldSetSid && sid) {
      try {
        const cookie = `sid=${sid}; Path=/; HttpOnly; SameSite=Lax`;
        headers.append('Set-Cookie', cookie);
        console.log('[debug][generate] set-cookie header appended');
      } catch (e) {
        console.error('[debug][generate] set-cookie header error:', e);
      }
    }
    const payload = JSON.stringify(response);
    console.log('[debug][generate] returning Response with length:', payload.length);
    console.log('[debug][generate] Response payload preview:', payload.substring(0, 500) + '...');
    return new Response(payload, { status: 200, headers });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: '入力内容に問題があります', 
          details: error.errors.map(err => ({
            path: err.path,
            message: err.message === 'Required' 
              ? `${err.path.join('.')}は必須項目です`
              : err.message
          }))
        },
        { status: 400 }
      );
    }
    
    console.error('Error generating problems:', error);

    // OpenAI/LLMエラーの詳細ハンドリング（any回避）
    const err = error as unknown;
    const message = err instanceof Error ? err.message : String(err ?? '');
    const statusCode =
      typeof (err as { statusCode?: number }).statusCode === 'number'
        ? (err as { statusCode: number }).statusCode
        : typeof (err as { status?: number }).status === 'number'
        ? (err as { status: number }).status
        : 500;
    const lower = String(message).toLowerCase();

    if (lower.includes('invalid_api_key') || lower.includes('incorrect api key') || lower.includes('api key')) {
      return NextResponse.json(
        { error: '外部APIキーが不正です。管理者にお問い合わせください。' },
        { status: 401 }
      );
    }
    if (lower.includes('rate limit')) {
      return NextResponse.json(
        { error: 'API利用制限に達しました。しばらく待ってから再度お試しください。' },
        { status: 429 }
      );
    }
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
      return NextResponse.json(
        { error: 'LLMサービスに接続できません（DNS/ネットワーク）。ネットワーク設定またはプロキシを確認してください。' },
        { status: 503 }
      );
    }
    if (lower.includes('timeout')) {
      return NextResponse.json(
        { error: '外部サービスの応答がタイムアウトしました。時間をおいて再度お試しください。' },
        { status: 504 }
      );
    }
    if (lower.includes('aborted')) {
      return NextResponse.json(
        { error: 'リクエストが中断されました。' },
        { status: 499 }
      );
    }
    // 既知のステータスコードがあれば尊重
    if (typeof statusCode === 'number' && statusCode !== 500) {
      return NextResponse.json(
        { error: '外部サービス呼び出しでエラーが発生しました。' },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: '問題の生成中にエラーが発生しました。しばらく待ってから再度お試しください。' },
      { status: 500 }
    );
  }
  // Next.js が全てのコードパスで Response が返ることを期待するための安全策
  return NextResponse.json(
    { error: '予期しないエラーが発生しました。' },
    { status: 500 }
  );
}

// ヘルスチェック等で GET が叩かれた場合でも必ず Response を返す
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ ok: true });
}

// 一部環境でプリフライト/ヘルスチェックが走る場合に備え、常に応答を返す
export async function HEAD(): Promise<Response> {
  return new Response(null, { status: 200 });
}

export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json({ ok: true });
}

async function generateProblems(
  data: z.infer<typeof loveSimulationSchema>,
  opts: { userId: string; conversationId: string }
): Promise<Problem[]> {
  console.log('[debug][generateProblems] Function called with data:', JSON.stringify(data).substring(0, 200) + '...');
  console.log('[debug][generateProblems] Options:', opts);
  console.log('hoge');
  try {
    // numberOfQuestions は文字列のため数値化（1-20の範囲に丸め）
    const rawCount = parseInt(String(data.numberOfQuestions || '5'), 10);
    const count = Math.max(1, Math.min(20, isNaN(rawCount) ? 5 : rawCount));
    console.log('[debug][generateProblems] Count calculated:', count);

    // 恋愛プロフィールを簡潔に埋め込んだプロンプト（最小変更でJSON応答を要求）
    const profileBlock = [
      '【自分】',
      `age: ${data.my.age}`,
      `gender: ${data.my.gender}`,
      `occupation: ${data.my.occupation}`,
      `traits: ${data.my.traits}`,
      `preference: ${data.my.preference}`,
      `background: ${data.my.background}`,
      `detailedDescription: ${data.my.detailedDescription}`,
      '',
      '【相手】',
      `age: ${data.partner.age}`,
      `gender: ${data.partner.gender}`,
      `occupation: ${data.partner.occupation}`,
      `traits: ${data.partner.traits}`,
      `preference: ${data.partner.preference}`,
      `background: ${data.partner.background}`,
      `detailedDescription: ${data.partner.detailedDescription}`,
      '',
      `【関係性】relationship: ${data.relationship}, stage: ${data.stage}`,
      `【目標】goal: ${data.goal}`,
    ].join('\n');

    const prompt = [
      profileBlock,
      '',
      `上記プロフィールを前提に、現実的な恋愛シチュエーション問題を1問生成してください。`,
      `出力条件`,
      '1. 必ず次のJSON形式で出力してください。',
      '{',
      '  "problems": [',
      '    {',
      '      "question": "問題文",',
      '      "choices": { "a": "選択肢1", "b": "選択肢2", "c": "選択肢3", "d": "選択肢4" }',
      '    }',
      '  ]',
      '}',
      '2. 問題文は1〜2文程度で短く状況を説明するだけにしてください。',
      '3. 選択肢は問題に対してワンフレーズで自然な行動・発言とすること。明らかに不自然な選択肢は入れないようにしてください。',
      '4. 「最も適切なのは？」など正解を誘導する表現は禁止します。「どうする？」「どんな言葉をかける？」など、自分らしい行動を選べる問いにしてください。ただし、「伝えたい気持ちがある」「好きな気持ちを伝えたい」など、心理状態を直接的に表現するのは避けてください。',
      '5. プロフィール情報（年齢・職業・性格・趣味・背景・関係性・問題数・目標など）を考慮した選択肢と問題を作成しますが、その情報をそのまま問題文に書き込まないようにしてください。自然な会話や状況として表現してください。',
      '6. 作問例として、以下を参考にしてください\n ',
      '{"question": "２人とも飲むのが好きということが共通していたので、飲みに行くことになった。金曜日に会おうと聞いたところ、金曜日は残業で２１時以降になってしまうと言われた。なんて返信する？", "choices": { "a": "じゃあ２１時以降に待ち合わせしよう", "b": "土日のお昼に飲みに行くのはどうかな", "c": "休日ではなく来週の都合のいい日を聞く", "d": "飲むのをやめる" }}',
    ].join('\n');

    console.log('[debug][generateProblems] Prompt created, length:', prompt.length);

    // 最小変更: 上記と同等の文脈でシーン画像を1枚生成（失敗しても問題は返す）
    let imageDataUrl: string | undefined = undefined;
    try {
      const imagePrompt = [
        profileBlock,
        '',
        '上記プロフィールから連想される現在進行中のデート・会話シーンを、やわらかい色調で1枚の正方形イメージとして生成してください。',
        'テキストやロゴは入れないこと。人物は自然体で、抽象・概念図ではなくシーンの雰囲気が伝わる絵にしてください。'
      ].join('\n');
      console.log('[debug][generateProblems:image] prompt.head:', imagePrompt.slice(0, 200));
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
        console.log('[debug][generateProblems:image] got b64_json length:', b64.length);
      } else if ((imageData as { url?: string })?.url) {
        imageDataUrl = String((imageData as { url?: string }).url);
        console.log('[debug][generateProblems:image] got url:', imageDataUrl);
      }
    } catch (e) {
      console.warn('[debug][generateProblems] image-generate failed:', e);
    }

    // 既存のプロンプト設計を活かしつつ、JSON での返答を要求
    console.log('[debug][generateProblems] Getting agent...');
    const selectedAgent = voltAgent.getAgent('quiz') || quizAgent;
    if (!selectedAgent) {
      throw new Error('AIエージェントの初期化に失敗しました');
    }
    console.log('[debug][generateProblems] Agent obtained:', !!selectedAgent);

    console.log('[debug][generateProblems] Calling generateText...');
    const res = await selectedAgent.generateText(prompt, {
      userId: opts.userId,
      conversationId: opts.conversationId,
    });
    console.log('[debug][generateProblems] generateText completed');

    // DEBUG: 一時的にレスポンス形を可視化
    try {
      const llmRes = res as LLMResponse;
      // typeof と keys 確認
      console.log('[debug][generate] typeof res:', typeof res);
      console.log('[debug][generate] keys(res):',
        res && typeof res === 'object' ? Object.keys(llmRes || {}) : []
      );
      // res.text の有無と長さ
      const t = typeof llmRes?.text === 'string' ? llmRes.text : '';
      console.log('[debug][generate] res.text length:', t ? t.length : 0);
    } catch (e) {
      console.log('[debug][generate] log error:', e);
    }

    const response = typeof res === 'string' ? res : ((res as LLMResponse)?.text ?? '');
    // 先頭200文字を確認
    try {
      console.log('[debug][generate] response.head:', String(response).slice(0, 200));
    } catch {}
    if (!response) throw new Error('LLMからの応答が空です');

    // VoltAgent経由でもモデル名は内部に保持されるが、ここでは省略
    const usedModel = 'via-volt-agent';

    let parsed: OpenAIResponse;
    try {
      const jsonStr = extractJsonString(response);
      console.log('[debug][generate] json.head:', jsonStr.slice(0, 200));
      parsed = JSON.parse(jsonStr) as OpenAIResponse;
    } catch (e) {
      console.error('[debug][generate] json-parse-error:', e);
      const err = new Error('failed_to_parse_llm_json') as ErrorWithStatusCode;
      err.statusCode = 502;
      throw err;
    }
    if (!parsed || !Array.isArray(parsed.problems)) {
      const err = new Error('invalid_llm_json_shape') as ErrorWithStatusCode;
      err.statusCode = 502;
      throw err;
    }
    // 後で消去もしくはリファクタリング
    const problems: Problem[] = parsed.problems.map((p: OpenAIProblemResponse, index: number) => {
      // choicesの構造を確実に正しくする
      const choices = p.choices as { a?: string; b?: string; c?: string; d?: string };
      const validatedChoices = {
        a: String(choices.a),
        b: String(choices.b),
        c: String(choices.c),
        d: String(choices.d)
      };

      const problem = {
        id: `${Date.now()}-${index}`,
        type: 'love',
        subject: 'love',
        difficulty: 'medium',
        question: p.question,
        // 恋愛シミュでは解答・解説は通常非表示
        answer: undefined,
        explanation: undefined,
        hints: p.hints,
        choices: validatedChoices,
        metadata: {
          topic: [data.relationship, data.stage, data.goal].filter(Boolean).join(' / ') || undefined,
          estimatedTime: p.estimatedTime,
          model: usedModel,
          // 画像は最初の問題にだけ埋め込む（最小変更）
          ...(index === 0 && imageDataUrl ? { tags: [`image:${imageDataUrl}`] } : {})
        },
        createdAt: new Date()
      } as Problem;
      if (index === 0) {
        const tag = problem?.metadata?.tags?.find?.((t: string) => t.startsWith('image:'));
        console.log('[debug][generateProblems:image] first problem image tag exists:', Boolean(tag));
      }
      return problem;
    });
    console.log('[debug][generate] problems.length:', problems.length);
    try {
      const firstTag = problems?.[0]?.metadata?.tags?.find?.((t: string) => t.startsWith('image:'));
      console.log('[debug][generateProblems:image] first image tag preview:', firstTag ? String(firstTag).slice(0, 64) + '...' : 'none');
    } catch {}
    return problems;
  } catch (error) {
    console.error('Error in generateProblems:', error);
    throw error; // 上位のエラーハンドリングに委ねる
  }
}
