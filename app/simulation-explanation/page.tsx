'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { useProblemStore } from '@/app/lib/store/problemStore';
import { useProfileStore } from '@/app/lib/store/profileStore';
import { getButtonText, getQuestionNumberText } from '@/app/lib/utils/problemNavigation';

type Label = 'BEST' | 'GOOD' | 'BAD';

type SkillScores = {
  思いやり: number;
  積極性: number;
  面白さ: number;
  コミュニケーション: number;
  観察力: number;
};

// 古い形式のスコアデータとの互換性のための型定義
type LegacySkillScores = SkillScores & {
  感情理解?: number;
  判断力?: number;
};

type ExplanationEntry = {
  label: Label;
  labelReason: string;
  skillScores: SkillScores;
  strengths: { title: string; description: string }[];
  improvements: { title: string; description: string }[];
  tips: { title: string; description: string }[];
};

type EvaluateChoiceResponse = {
  explanations: {
    a: ExplanationEntry;
    b: ExplanationEntry;
    c: ExplanationEntry;
    d: ExplanationEntry;
  };
};

function getBadgeColor(label: Label) {
  if (label === 'BEST') return 'bg-green-500';
  if (label === 'GOOD') return 'bg-blue-500';
  return 'bg-red-500';
}

function getLabelMeta(label?: Label) {
  const L = label || 'BAD';
  switch (L) {
    case 'BEST':
      return {
        badge: 'bg-emerald-500/90 text-white',
        bar: 'from-emerald-400 to-emerald-600',
        tint: 'bg-emerald-50/70',
        icon: '🌟',
      } as const;
    case 'GOOD':
      return {
        badge: 'bg-sky-500/90 text-white',
        bar: 'from-sky-400 to-sky-600',
        tint: 'bg-sky-50/70',
        icon: '👍',
      } as const;
    default:
      return {
        badge: 'bg-rose-500/90 text-white',
        bar: 'from-rose-400 to-rose-600',
        tint: 'bg-rose-50/70',
        icon: '⚠️',
      } as const;
  }
}

function RadarChart({ scores }: { scores: SkillScores }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const data = useMemo(() => {
    return [
      { name: '思いやり', value: scores.思いやり, color: '#ec4899' },
      { name: '観察力', value: scores.観察力, color: '#3b82f6' },
      { name: 'コミュニケーション', value: scores.コミュニケーション, color: '#10b981' },
      { name: '積極性', value: scores.積極性, color: '#8b5cf6' },  
      { name: '面白さ', value: scores.面白さ, color: '#f59e0b' }   
    ];
  }, [scores]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parentEl = canvas.parentElement as HTMLElement | null;
    if (!parentEl) return;

    function draw() {
      const rect = (parentEl as HTMLElement).getBoundingClientRect();
      const size = Math.min(Math.max(rect.width, 260), 360);
      (canvas as HTMLCanvasElement).width = size;
      (canvas as HTMLCanvasElement).height = size;
      const ctx = (canvas as HTMLCanvasElement).getContext('2d');
      if (!ctx) return;

      const cx = size / 2;
      const cy = size / 2;
      const radius = Math.min(size * 0.38, 140);
      const angleStep = (Math.PI * 2) / data.length;

      ctx.clearRect(0, 0, size, size);

      // rings
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (radius / 5) * i, 0, Math.PI * 2);
        ctx.stroke();
      }

      // axes
      for (let i = 0; i < data.length; i++) {
        const a = i * angleStep - Math.PI / 2;
        const x = cx + Math.cos(a) * radius;
        const y = cy + Math.sin(a) * radius;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // area
      ctx.fillStyle = 'rgba(236, 72, 153, 0.15)';
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 3;
      ctx.beginPath();
      data.forEach((d, i) => {
        const a = i * angleStep - Math.PI / 2;
        const r = (d.value / 100) * radius;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // points and labels
      data.forEach((d, i) => {
        const a = i * angleStep - Math.PI / 2;
        const r = (d.value / 100) * radius;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;

        // point
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // value bubble
        const offset = 14;
        const vx = cx + Math.cos(a) * (r + offset);
        const vy = cy + Math.sin(a) * (r + offset);
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath();
        ctx.arc(vx, vy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = d.color;
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(d.value), vx, vy);
      });

      // category labels
      const labelRadius = radius + 30;
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 12px sans-serif';
      data.forEach((d, i) => {
        const a = i * angleStep - Math.PI / 2;
        const lx = cx + Math.cos(a) * labelRadius;
        const ly = cy + Math.sin(a) * labelRadius;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(d.name, lx, ly);
      });
    }

    draw();
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [data]);

  return (
    <div className="flex justify-center overflow-x-auto">
      <div className="relative min-w-[320px] w-full max-w-[520px] aspect-square">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}

export default function SimulationExplanationPage() {
  const router = useRouter();
  const { progress, nextPhase, getSelectedAnswer, problems } = useProblemStore();
  const { profileData,isGenerating,setIsGenerating } = useProfileStore();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluateChoiceResponse | null>(null);

  const currentProblem = useMemo(() => {
    return problems?.[progress.currentQuestionIndex];
  }, [problems, progress.currentQuestionIndex]);

  const imageUrl = useMemo(() => {
    try {
      return currentProblem?.metadata?.tags?.find?.((t: string) => t.startsWith('image:'))?.replace('image:', '');
    } catch {
      return undefined;
    }
  }, [currentProblem]);

  const selectedAnswerText = getSelectedAnswer(progress.currentQuestionIndex) || '';

  const selectedChoiceKey: 'a' | 'b' | 'c' | 'd' | null = useMemo(() => {
    if (!currentProblem?.choices) return null;
    const entries: Array<['a'|'b'|'c'|'d', string]> = [
      ['a', currentProblem.choices.a],
      ['b', currentProblem.choices.b],
      ['c', currentProblem.choices.c],
      ['d', currentProblem.choices.d],
    ];
    const found = entries.find(([, text]) => String(text) === String(selectedAnswerText));
    return found ? found[0] : null;
  }, [currentProblem, selectedAnswerText]);

  // 画面で表示する評価の対象（初期はユーザー選択、なければ 'a'）
  const [activeKey, setActiveKey] = useState<'a' | 'b' | 'c' | 'd'>('a');
  useEffect(() => {
    setActiveKey(selectedChoiceKey || 'a');
  }, [selectedChoiceKey]);

  useEffect(() => {
    // プロフィールデータがない場合はホームに戻る
    if (!profileData) {
      router.push('/');
      return;
    }
  }, [profileData, router]);

  // 選択結果の評価をセッションから読み込む（APIは呼ばない）
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    try {
      const raw = typeof window !== 'undefined' ? sessionStorage.getItem('evaluateResponse') : null;
      if (!raw) {
        setError('評価データが見つかりませんでした');
        setEvaluation(null);
      } else {
        const json = JSON.parse(raw) as EvaluateChoiceResponse;
        // 古い形式のデータを新しい形式に変換
        const convertedJson: EvaluateChoiceResponse = {
          explanations: {
            a: {
              ...json.explanations.a,
              skillScores: {
                思いやり: json.explanations.a.skillScores.思いやり,
                観察力: json.explanations.a.skillScores.観察力,
                コミュニケーション: json.explanations.a.skillScores.コミュニケーション,
                積極性: (json.explanations.a.skillScores as LegacySkillScores).感情理解 || json.explanations.a.skillScores.積極性,
                面白さ: (json.explanations.a.skillScores as LegacySkillScores).判断力 || json.explanations.a.skillScores.面白さ,
              }
            },
            b: {
              ...json.explanations.b,
              skillScores: {
                思いやり: json.explanations.b.skillScores.思いやり,
                観察力: json.explanations.b.skillScores.観察力,
                コミュニケーション: json.explanations.b.skillScores.コミュニケーション,
                積極性: (json.explanations.b.skillScores as LegacySkillScores).感情理解 || json.explanations.b.skillScores.積極性,
                面白さ: (json.explanations.b.skillScores as LegacySkillScores).判断力 || json.explanations.b.skillScores.面白さ,
              }
            },
            c: {
              ...json.explanations.c,
              skillScores: {
                思いやり: json.explanations.c.skillScores.思いやり,
                観察力: json.explanations.c.skillScores.観察力,
                コミュニケーション: json.explanations.c.skillScores.コミュニケーション,
                積極性: (json.explanations.c.skillScores as LegacySkillScores).感情理解 || json.explanations.c.skillScores.積極性,
                面白さ: (json.explanations.c.skillScores as LegacySkillScores).判断力 || json.explanations.c.skillScores.面白さ,
              }
            },
            d: {
              ...json.explanations.d,
              skillScores: {
                思いやり: json.explanations.d.skillScores.思いやり,
                観察力: json.explanations.d.skillScores.観察力,
                コミュニケーション: json.explanations.d.skillScores.コミュニケーション,
                積極性: (json.explanations.d.skillScores as LegacySkillScores).感情理解 || json.explanations.d.skillScores.積極性,
                面白さ: (json.explanations.d.skillScores as LegacySkillScores).判断力 || json.explanations.d.skillScores.面白さ,
              }
            }
          }
        };
        setEvaluation(convertedJson);
      }
    } catch (e: unknown) {
      setError('評価データの読み込みに失敗しました');
      setEvaluation(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 状態の変更を監視して適切なタイミングで遷移
  useEffect(() => {
    if (isTransitioning) {
      if (progress.currentPhase === 'completed') {
        router.push('/simulation-result');
      } else if (progress.currentPhase === 'problem') {
        router.push('/simulation');
      }
    }
  }, [progress.currentPhase, isTransitioning, router]);

  const handleNext = () => {
    try {
      // 遷移中フラグを設定
      setIsTransitioning(true);
      
      // 問題ストアの次のフェーズに進む
      nextPhase();
      
      router.push('/simulation');
    } catch (error) {
      console.error('handleNext エラー:', error);
      // エラーが発生しても遷移を試行
      router.push('/simulation');
    }
  };

  // プロフィールデータがない場合はローディング表示
  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const active = evaluation?.explanations?.[activeKey] as ExplanationEntry | undefined;

  return (
    <div className="min-h-screen animated-bg relative overflow-x-hidden">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* トップビジュアル（直近のシーン画像を表示） */}
          <div className="relative h-64 md:h-80 mb-8">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="scene"
                className="absolute inset-0 m-auto max-w-[115%] max-h-[115%] object-cover rounded-2xl shadow-lg pointer-events-none"
                style={{ top: '115%', left: '50%', transform: 'translate(-50%, -50%)' }}
              />
            )}
          </div>

          {/* 恋愛TIPs見出し */}
          <div className="text-center mb-12 mt-16">
            <div className="inline-flex items-center gap-4 mb-6">
              <span className="text-6xl">💕</span>
              <h1 className="text-5xl font-bold text-white drop-shadow-2xl">恋愛TIPs</h1>
              <span className="text-6xl">💕</span>
            </div>
            <p className="text-white/90 text-xl font-light tracking-wide">
              あなたの選択から学ぶ恋愛のコツ
            </p>
          </div>

          {/* 評価帯＋選択肢リスト */}
          <div className="container mx-auto px-4 py-6 max-w-5xl">
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4">

              {/* あなたの選択肢（一番上に表示） */}
              {selectedChoiceKey && currentProblem?.choices && (
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <span className="text-2xl">📊</span>
                      <span className="text-lg font-semibold text-gray-800">あなたの選択は</span>
                      <div className={`px-4 py-1.5 rounded-full font-bold text-white ${
                        evaluation?.explanations?.[selectedChoiceKey as keyof typeof evaluation.explanations]?.label === 'BEST' ? 'bg-yellow-400' :
                        evaluation?.explanations?.[selectedChoiceKey as keyof typeof evaluation.explanations]?.label === 'GOOD' ? 'bg-green-500' :
                        evaluation?.explanations?.[selectedChoiceKey as keyof typeof evaluation.explanations]?.label === 'BAD' ? 'bg-red-500' :
                        'bg-green-500'
                      }`}>
                        {evaluation?.explanations?.[selectedChoiceKey as keyof typeof evaluation.explanations]?.label || 'GOOD'}
                      </div>
                      <span className="text-lg font-semibold text-gray-800">です</span>
                    </div>
                    
                    {/* あなたの選択肢をクリック可能なボタンとして表示 */}
                    <button 
                      type="button"
                      onClick={() => setActiveKey(selectedChoiceKey)}
                      className={`choice-btn w-full text-left p-4 rounded-xl border transition-colors ${
                        activeKey === selectedChoiceKey ? 'border-4 border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 ${['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500'][['a','b','c','d'].indexOf(selectedChoiceKey)]} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                          {selectedChoiceKey.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium flex-1">{getSelectedAnswer(progress.currentQuestionIndex)}</span>

                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* その他の選択肢リスト（自分が選択した選択肢を除外） */}
              <div className="space-y-2">
                {currentProblem?.choices && (['a','b','c','d'] as const)
                  .filter(key => key !== selectedChoiceKey) // 自分が選択した選択肢を除外
                  .map((key, index) => {
                    const choiceText = currentProblem.choices[key];
                    const choiceLabel = evaluation?.explanations?.[key]?.label || 'GOOD';
                    const choiceColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500'];
                    const originalIndex = ['a','b','c','d'].indexOf(key); // 元のインデックスを取得
                    const labelColors = {
                      'BEST': 'bg-yellow-400',
                      'GOOD': 'bg-green-500', 
                      'BAD': 'bg-red-500'
                    };
                    
                    return (
                      <button 
                        key={key} 
                        type="button"
                        onClick={() => setActiveKey(key)}
                        className={`choice-btn w-full text-left p-4 rounded-xl border transition-colors ${
                          activeKey === key ? 'border-4 border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 ${choiceColors[originalIndex]} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                            {key.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium flex-1">{choiceText}</span>
                          <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${labelColors[choiceLabel as keyof typeof labelColors] || 'bg-gray-500'}`}>
                              {choiceLabel}
                            </div>

                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
              <p className="mt-3 text-xs text-gray-500 text-center">選択肢をクリックすると、その選択肢の評価が表示されます</p>

            </div>
          </div>

          <div className="p-8 mb-6">



            {active?.skillScores && (
              <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-3xl p-4 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center justify-center gap-2 text-lg">
                  <span className="text-2xl">🎯</span>
                  <span>恋愛スキルレーダー</span>
                </h3>
                <RadarChart scores={active.skillScores} />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-3xl p-6">
                <h3 className="font-semibold text-emerald-800 mb-4 flex items-center gap-3 text-xl">
                  <span className="text-2xl">🌟</span>
                  優れている点
                </h3>
                <div className="space-y-3">
                  {(active?.strengths || []).map((s, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-green-500 text-xl mt-1">✓</span>
                      <div>
                        <p className="font-medium text-gray-800">{s.title}</p>
                        <p className="text-sm text-gray-600">{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-3xl p-6">
                <h3 className="font-semibold text-amber-800 mb-4 flex items-center gap-3 text-xl">
                  <span className="text-2xl">💡</span>
                  さらに伸ばせる点
                </h3>
                <div className="space-y-3">
                  {(active?.improvements || []).map((im, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-amber-500 text-xl mt-1">→</span>
                      <div>
                        <p className="font-medium text-gray-800">{im.title}</p>
                        <p className="text-sm text-gray-600">{im.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {active?.tips && active.tips.length > 0 && (
              <div className="mt-6 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 rounded-3xl p-6">
                <h3 className="font-semibold text-purple-800 mb-4 flex items-center gap-3 text-xl">
                  <span className="text-2xl">🚀</span>
                  実践TIPs
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {active.tips.map((tip, idx) => (
                    <div key={idx} className="bg-white/80 rounded-2xl p-4 border border-purple-100">
                      <p className="font-semibold text-gray-800 mb-1">{tip.title}</p>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          <div className="flex justify-center">
            {isLoading ? (
              <div className="text-sm text-gray-600">評価を読み込み中...</div>
            ) : error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                size="lg"
                disabled={isGenerating}
              >
                {getButtonText(progress)}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
