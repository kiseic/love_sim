import { NextRequest } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { cookies } from 'next/headers';
import { quizAgent } from '@/app/lib/voltagent';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface EvaluateChoiceRequest {
  question: string;
  choices: { a: string; b: string; c: string; d: string };
  selectedChoice: 'a' | 'b' | 'c' | 'd';
  questionType: string;
  subject?: string;
  // 生成APIのレスポンスなど、評価時に参照したい追加コンテキスト
  context?: unknown;
}

interface ChoiceEvaluation {
  selectedChoice: 'a' | 'b' | 'c' | 'd';
  evaluation: 'Best' | 'Good' | 'Bad';
  explanation: string;
  allChoices: {
    a: { evaluation: 'Best' | 'Good' | 'Bad'; explanation: string };
    b: { evaluation: 'Best' | 'Good' | 'Bad'; explanation: string };
    c: { evaluation: 'Best' | 'Good' | 'Bad'; explanation: string };
    d: { evaluation: 'Best' | 'Good' | 'Bad'; explanation: string };
  };
}

interface LLMResponse {
  text?: string;
}

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
  status?: number;
}

function extractJsonString(input: string): string {
  const fencedMatch =
    input.match(/```\s*json\s*([\s\S]*?)\s*```/i) ||
    input.match(/```\s*([\s\S]*?)\s*```/);
  if (fencedMatch && fencedMatch[1]) return fencedMatch[1].trim();
  const firstBrace = input.indexOf('{');
  const lastBrace = input.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return input.slice(firstBrace, lastBrace + 1).trim();
  }
  return String(input).trim();
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    noStore();
    const body: EvaluateChoiceRequest = await request.json();

    const cookieStore = await cookies();
    let sid = cookieStore.get('sid')?.value;
    let shouldSetSid = false;
    if (!sid) {
      sid = crypto.randomUUID();
      shouldSetSid = true;
    }

    const systemPrompt = `\nあなたは恋愛シミュレーションゲームの解説生成AIです。
 以下の２つの情報を基に、問題文に対する各選択肢の評価とその解説を出力条件に従って作ってください。
(メモリを参照)
 １．相手と自分のプロフィール
 ２．初期設定の関係性と前回までの問題への解答履歴

【出力条件】
1. 出力は必ず次のJSON形式で返すこと（各選択肢に評価ラベルを追加する）:

{
"explanations": {
"a": {
"label": "BEST | GOOD | BAD",
"labelReason": "ワンフレーズの理由",
"skillScores": { "思いやり": 数値, "観察力": 数値, "コミュニケーション": 数値, "積極性": 数値, "面白さ": 数値 },
"strengths": [
{ "title": "見出し", "description": "ワンフレーズ解説" },
{ "title": "見出し", "description": "ワンフレーズ解説" }
],
"improvements": [
{ "title": "見出し", "description": "ワンフレーズ解説" },
{ "title": "見出し", "description": "ワンフレーズ解説" }
],
"tips": [
{ "title": "TIP見出し", "description": "ワンフレーズ解説" },
{ "title": "TIP見出し", "description": "ワンフレーズ解説" }
]
},
"b": { ... },
"c": { ... },
"d": { ... }
}
}

２． skillScores は各項目を １〜９９点 の範囲でつけること。４つの選択肢が、近い点数にならないように、なるべく散らばるように点数を付けること。
３．strengths と improvements は各２つずつ記載すること。

    * 必ず title と description のペアで出力すること。
    * title は端的な見出し（例：相手への配慮、積極性）
    * description はワンフレーズ（例：疲れている相手に気づき適切な提案ができています）

４．tipsは各２つずつ記載すること。

    * 必ず title と description のペアで出力すること。
    * description はワンフレーズで、「アッ」と思える切り口にする（例：相手のSNS投稿を次の会話のきっかけにする）。

５．評価ラベル（BEST / GOOD / BAD）の付与ルール

    * 4つのうち必ず1つだけ BEST。
    * 残り3つは GOOD または BAD。少なくとも1つは BAD を含める。
    * ラベルは 総合評価に基づいて決める。基本は下式の重み付き合計を用い、同点の場合はタイブレーク規則に従う。
        * 基本重み（状況が「相手が疲れている」「好意段階」など配慮重視のとき）
            * 思いやり×1.2、面白さ×1.2、観察力×1.0、コミュニケーション×1.0、積極性×1.0
        * 目標や段階で調整してよい（例：終盤で告白が目標→コミュニケーションと積極性を各+0.2）。
    * タイブレーク規則

        1. 相手の「好み」や性格と整合する方を上位。
        2. 前回までの選択と自然に接続している方を上位（流れを断たない）。
        3. それでも同等なら、スコアのバランスが良い方を上位。

    * labelReason にはワンフレーズで根拠を書く（例：「疲れへの配慮が目標と段階に合う」）。

６．文体はカジュアル寄りだが、分析として筋が通っていること。
 また、絶対的に「正しい／間違っている」などの断定は避け、行動の特徴や可能性として表現すること。
`;


    const contextNote = body?.context
      ? `\n\n追加コンテキスト（生成APIのレスポンスなど）:\n${typeof body.context === 'string' ? body.context : JSON.stringify(body.context, null, 2)}`
      : '';

    const userPrompt = `以下の問題と選択肢を評価してください。\n\n問題文:\n${body.question}\n\n選択肢:\nA: ${body.choices.a}\nB: ${body.choices.b}\nC: ${body.choices.c}\nD: ${body.choices.d}\n\n選択された選択肢: ${body.selectedChoice.toUpperCase()}\n\n応答形式:\n{\n  "selectedChoice": "a|b|c|d",\n  "evaluation": "Good|Better|Bad",\n  "explanation": "選択された選択肢の説明",\n  "allChoices": {\n    "a": { "evaluation": "Good|Better|Bad", "explanation": "..." },\n    "b": { "evaluation": "Good|Better|Bad", "explanation": "..." },\n    "c": { "evaluation": "Good|Better|Bad", "explanation": "..." },\n    "d": { "evaluation": "Good|Better|Bad", "explanation": "..." }\n  }\n}`;

    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    const res = await quizAgent.generateText(prompt, { userId: sid!, conversationId: sid! });
    const content = typeof res === 'string' ? res : (res as LLMResponse)?.text ?? '';
    if (!content) throw new Error('LLMからの応答が空です');

    let evaluation: ChoiceEvaluation;
    try {
      evaluation = JSON.parse(extractJsonString(content));
    } catch {
      const err = new Error('failed_to_parse_llm_json') as ErrorWithStatusCode;
      err.statusCode = 502;
      throw err;
    }

    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (shouldSetSid && sid) headers.append('Set-Cookie', `sid=${sid}; Path=/; HttpOnly; SameSite=Lax`);
    return new Response(JSON.stringify(evaluation), { status: 200, headers });
  } catch (error) {
    console.error('Error evaluating choice:', error);
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
      JSON.stringify({ error: '選択肢の評価中にエラーが発生しました' }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

