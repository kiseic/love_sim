'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SimulationDisplay } from '@/app/components/simulation-display';
import { useProblemStore } from '@/app/lib/store/problemStore';
import { useProfileStore } from '@/app/lib/store/profileStore';

export default function SimulationPage() {
  const router = useRouter();
  const { progress, nextPhase } = useProblemStore();
  const { profileData } = useProfileStore();
  const hasTotalQuestions = progress.totalQuestions > 0;
  const currentQuestionNumber = hasTotalQuestions
    ? Math.min(progress.currentQuestionIndex + 1, progress.totalQuestions)
    : progress.currentQuestionIndex + 1;
  const progressPercent = hasTotalQuestions
    ? Math.round((currentQuestionNumber / progress.totalQuestions) * 100)
    : 0;
  const clampedPercent = Math.min(Math.max(progressPercent, 0), 100);
  const indicatorOffsetPercent = hasTotalQuestions ? Math.min(Math.max(clampedPercent, 4), 96) : 4;
  const remainingQuestions = hasTotalQuestions
    ? Math.max(progress.totalQuestions - currentQuestionNumber, 0)
    : null;
  const remainingText = remainingQuestions === null
    ? '問題数を読み込み中...'
    : remainingQuestions > 0
      ? `あと ${remainingQuestions} 問でゴール`
      : '結果判定までもう少し';
  const stageLabel = clampedPercent >= 80
    ? 'クライマックス'
    : clampedPercent >= 40
      ? '中盤'
      : '序盤';
  const stageMarkers = [
    { label: '序盤', value: 0 },
    { label: '中盤', value: 50 },
    { label: 'クライマックス', value: 100 },
  ];
  const questionLabel = hasTotalQuestions
    ? `問題 ${currentQuestionNumber} / ${progress.totalQuestions}`
    : `問題 ${currentQuestionNumber}`;
  
  // プロフィールデータがない場合はホームに戻る
  useEffect(() => {
    if (!profileData) {
      router.push('/');
      return;
    }
    
    // 問題ストアが初期化されていない場合は初期化
    if (progress.totalQuestions === 0) {
      const questionCount = parseInt(profileData.numberOfQuestions);
      if (questionCount > 0) {
        // 問題ストアの初期化はLoveSimulationFormで行われるはずだが、
        // 念のためここでもチェック
        console.log('問題数を初期化:', questionCount);
      }
    }
  }, [profileData, progress.totalQuestions, router]);

  const handleAnswerSelected = async (answer: string) => {
    console.log('選択された答え:', answer);
    
    // 問題ストアの次のフェーズに進む
    nextPhase();
    
    const evaluateResponse = sessionStorage.getItem('evaluateResponse');
    if (!evaluateResponse) {
      console.log('評価APIの結果を待機中...');
      await waitForEvaluateResponse();
    }
    
    // 解説ページに遷移（URLパラメータは不要）
    router.push('/simulation-explanation');
  };
  const waitForEvaluateResponse = (): Promise<void> => {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const evaluateResponse = sessionStorage.getItem('evaluateResponse');
        if (evaluateResponse) {
          try {
            const evalData = JSON.parse(evaluateResponse);
            // ステータス200のレスポンスかチェック
            if (evalData.status === 200 || !evalData.error) {
              clearInterval(checkInterval);
              resolve();
            }
          } catch (error) {
            // JSON解析エラーの場合は続行
          }
        }
      }, 1000);
    });
  };

  const resetSimulation = () => {
    // 最初の画面（ホームページ）に戻る
    router.push('/');
  };

  // プロフィールデータがない場合はローディング表示
  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        {/* ページ単体の見出しはヘッダーに統合済みのため非表示に変更 */}
        
        {/* 進捗表示 - 問題ストアを使用 */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="rounded-2xl border border-purple-100/60 bg-white/90 p-5 shadow-xl backdrop-blur-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-gray-400">
                  現在のステップ
                </p>
                <p className="text-2xl font-semibold text-gray-900">{questionLabel}</p>
                <p className="text-sm text-gray-500">{remainingText}</p>
              </div>
              <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                <div className="text-left sm:text-right">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    達成率
                  </p>
                  <p className="text-3xl font-bold text-purple-600">{clampedPercent}%</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
                  <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                  {stageLabel}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="relative h-3 overflow-hidden rounded-full bg-gradient-to-r from-slate-100 via-white to-slate-100">
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.35), transparent 45%)',
                    backgroundSize: '10px 10px',
                  }}
                ></div>
                <div
                  className="relative h-full rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 transition-all duration-500 ease-out"
                  style={{ width: `${hasTotalQuestions ? clampedPercent : 0}%` }}
                >
                  <div
                    className="absolute inset-0 opacity-30 mix-blend-screen animate-pulse"
                    style={{
                      backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,0.6) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.6) 75%, transparent 75%, transparent)',
                      backgroundSize: '32px 32px',
                    }}
                  ></div>
                </div>
                <div
                  className="absolute -top-3 flex h-8 w-16 -translate-x-1/2 items-center justify-center rounded-full border border-purple-100 bg-white text-xs font-semibold text-purple-600 shadow-lg transition-all duration-500"
                  style={{ left: `${indicatorOffsetPercent}%` }}
                >
                  {clampedPercent}%
                </div>
              </div>
              <div className="flex justify-between text-[11px] font-medium">
                {stageMarkers.map((marker) => {
                  const isActive = clampedPercent >= marker.value;
                  return (
                    <div key={marker.label} className="flex w-1/3 flex-col items-center gap-1">
                      <span
                        className={`h-2.5 w-2.5 rounded-full border transition-all ${
                          isActive
                            ? 'border-purple-600 bg-purple-600 shadow-[0_0_0_4px_rgba(196,181,253,0.35)]'
                            : 'border-gray-300 bg-white'
                        }`}
                      ></span>
                      <span className={isActive ? 'text-purple-600' : 'text-gray-400'}>{marker.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <SimulationDisplay
            onAnswerSelected={handleAnswerSelected}
          />
        </div>
        
        {/* リセットボタン */}
        <div className="text-center mt-6">
          <button
            onClick={resetSimulation}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
          >
            最初からやり直す
          </button>
        </div>
      </div>
    </div>
  );
}
