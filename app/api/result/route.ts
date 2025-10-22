import { NextRequest } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { cookies } from 'next/headers';
import { quizAgent } from '@/app/lib/voltagent';
import { ProfileData, Problem } from '@/app/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ResultRequest {
  profileData: ProfileData;
  problems: Problem[];
  selectedAnswers: string[];
}

interface SkillScore {
  思いやり: number;
  観察力: number;
  コミュニケーション: number;
  面白さ: number;
  積極性: number;
}

interface ChoiceAnalysis {
  label: 'BEST' | 'GOOD' | 'BAD';
  labelReason: string;
  skillScores: SkillScore;
  strengths: Array<{ title: string; description: string }>;
  improvements: Array<{ title: string; description: string }>;
  tips: Array<{ title: string; description: string }>;
}

interface ProblemResult {
  question: string;
  selectedAnswer: string;
  analysis: ChoiceAnalysis;
}

interface ResultResponse {
  scores: SkillScore;
  loveType: {
    title: string;
    description: string;
  };
  growthTips: {
    strengthAdvice: string;
    improvementAdvice: string;
  };
  compatibility: {
    type: string;
    description: string;
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
    const body: ResultRequest = await request.json();

    const cookieStore = await cookies();
    let sid = cookieStore.get('sid')?.value;
    let shouldSetSid = false;
    if (!sid) {
      sid = crypto.randomUUID();
      shouldSetSid = true;
    }

    // プロフィール情報を整理
    const profileInfo = [
      '【自分】',
      `年齢: ${body.profileData.my.age}`,
      `性別: ${body.profileData.my.gender}`,
      `職業: ${body.profileData.my.occupation}`,
      `性格: ${body.profileData.my.traits}`,
      `趣味・好み: ${body.profileData.my.preference}`,
      `背景: ${body.profileData.my.background}`,
      `詳細: ${body.profileData.my.detailedDescription}`,
      '',
      '【相手】',
      `年齢: ${body.profileData.partner.age}`,
      `性別: ${body.profileData.partner.gender}`,
      `職業: ${body.profileData.partner.occupation}`,
      `性格: ${body.profileData.partner.traits}`,
      `趣味・好み: ${body.profileData.partner.preference}`,
      `背景: ${body.profileData.partner.background}`,
      `詳細: ${body.profileData.partner.detailedDescription}`,
      '',
      `【関係性】${body.profileData.relationship}`,
      `【現在の段階】${body.profileData.stage}`,
      `【目標】${body.profileData.goal}`,
    ].join('\n');

    // 問題と選択された回答を整理
    const problemHistory = body.problems.map((problem, index) => {
      const selectedAnswer = body.selectedAnswers[index] || '';
      
      return [
        `問題${index + 1}: ${problem.question}`,
        `選択した回答: ${selectedAnswer}`,
        ''
      ].join('\n');
    }).join('\n');

    const systemPrompt = `あなたは恋愛シミュレーションゲームの結果分析AIです。
以下の情報を基に、ユーザーの選択パターンを分析し、総合的な結果レポートを作成してください。

【出力条件】
1. 出力は必ず次のJSON形式で返すこと:

{
  "scores": {
    "思いやり": 数値,
    "観察力": 数値,
    "コミュニケーション": 数値,
    "面白さ": 数値,
    "積極性": 数値
  },
  "loveType":{
    "title": "タイプ名（1〜2語）",
    "description": "タイプの説明（2文程度）"
  },
  "growthTips": {
    "strengthAdvice": "強みを活かすアドバイス（1文程度）",
    "improvementAdvice": "改善ポイントに関するアドバイス(1文程度)"
  },
  "compatibility": {
    "type": "相性の良いタイプ名",
    "description": "そのタイプの説明（2文程度）"
  }
}

2. 5つの軸（思いやり・観察力・面白さ・積極性・コミュニケーション力）の点数を計算。
3. 5つの軸の点数から恋愛偏差値を(整数に丸め/範囲は30~85に収めて)算出する。
【文体ルール】カジュアル寄りだが、分析として筋が通っていること。また「正しい／間違っている」などの断定は避け、行動の特徴や可能性として記述すること。`;

    const userPrompt = `以下のプロフィール情報と問題選択履歴を利用してください。

${profileInfo}

【問題選択履歴】
${problemHistory}

上記の情報を基に、ユーザーの恋愛スキルと選択パターンを分析し、総合的な結果レポートを作成してください。`;

    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    const res = await quizAgent.generateText(prompt, { userId: sid!, conversationId: sid! });
    const content = typeof res === 'string' ? res : (res as LLMResponse)?.text ?? '';
    if (!content) throw new Error('LLMからの応答が空です');

    let result: ResultResponse;
    try {
      result = JSON.parse(extractJsonString(content));
    } catch {
      const err = new Error('failed_to_parse_llm_json') as ErrorWithStatusCode;
      err.statusCode = 502;
      throw err;
    }

    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (shouldSetSid && sid) headers.append('Set-Cookie', `sid=${sid}; Path=/; HttpOnly; SameSite=Lax`);
    return new Response(JSON.stringify(result), { status: 200, headers });
  } catch (error) {
    console.error('Error generating result:', error);
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
      JSON.stringify({ error: '結果生成中にエラーが発生しました' }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
