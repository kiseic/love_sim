'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SimulationDisplay } from '@/app/components/simulation-display';
import { type Scenario } from '@/app/components/simulation-display/SimulationDisplay';
import { useProblemStore } from '@/app/lib/store/problemStore';
import { useProfileStore } from '@/app/lib/store/profileStore';
import { getQuestionNumberText, getButtonText } from '@/app/lib/utils/problemNavigation';

export default function SimulationPage() {
  const router = useRouter();
  const { progress, nextPhase } = useProblemStore();
  const { profileData } = useProfileStore();
  
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
        <div className="max-w-md mx-auto mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              {getQuestionNumberText(progress)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((progress.currentQuestionIndex + 1) / progress.totalQuestions) * 100}%` }}
            ></div>
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
