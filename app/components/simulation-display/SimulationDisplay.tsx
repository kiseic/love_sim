'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { ChoiceButton } from '../simulation-display/ChoiceButton';
import { QuestionText } from '../simulation-display/QuestionText';
import { SelectedAnswer } from '../simulation-display/SelectedAnswer';
import { useProblemStore } from '../../lib/store/problemStore';
import { useProfileStore } from '../../lib/store/profileStore';
import { Problem } from '../../lib/types/problem';
import { storageUtils, ResultData } from '../../lib/utils/storage';

export interface Scenario {
  text: string;
  options: string[];
}

interface SimulationDisplayProps {
  onAnswerSelected?: (answer: string, nextScenario?: Scenario) => void;
  onResultGenerated?: (result: ResultData) => void;
}

export const SimulationDisplay: React.FC<SimulationDisplayProps> = ({
  onAnswerSelected,
  onResultGenerated
}) => {
  const { problems, progress, selectedAnswers, setSelectedAnswer, setProblems } = useProblemStore();
  const { profileData,isGenerating,setIsGenerating } = useProfileStore();
  
  // 現在の問題を取得
  const currentProblem = problems[progress.currentQuestionIndex];
  const imageUrl = currentProblem?.metadata?.tags?.find?.((t: string) => t.startsWith('image:'))?.replace('image:', '');
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[debug][SimulationDisplay] imageUrl:', imageUrl?.slice?.(0, 48));
  }
  
  // 現在の問題からシナリオを作成
  const currentScenario: Scenario = currentProblem ? {
    text: currentProblem.question,
    options: currentProblem.choices ? [
      currentProblem.choices.a,
      currentProblem.choices.b,
      currentProblem.choices.c,
      currentProblem.choices.d
    ] : [
      "選択肢がありません"
    ]
  } : {
    text: "問題が読み込まれていません",
    options: ["問題を生成してください"]
  };
  
  const [selectedAnswer, setSelectedAnswerState] = useState<string | null>(null);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [showSelectedAnswer, setShowSelectedAnswer] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);

  // シナリオが変更されたら状態をリセット
  useEffect(() => {
      setSelectedAnswerState(null);
      setShowConfirmButton(false);
      setShowSelectedAnswer(false);
      setIsAnswering(false);
  }, [currentProblem]);

  const handleChoiceSelect = (answer: string) => {
    setSelectedAnswerState(answer);
    setShowConfirmButton(true);
  };

  const handleFreeTextChange = (value: string) => {
    if (value.trim()) {
      setSelectedAnswerState('free-text');
      setShowConfirmButton(true);
    } else {
      setSelectedAnswerState(null);
      setShowConfirmButton(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedAnswer) return;

    setIsAnswering(true);
    
    const selectedChoiceText: string = currentScenario.options[parseInt(selectedAnswer)];

    // 選択した答えをproblemStoreに保存
    setSelectedAnswer(progress.currentQuestionIndex, selectedChoiceText);
    console.log(progress.currentQuestionIndex, selectedChoiceText);

    setShowSelectedAnswer(true);
    setIsAnswering(false);
    
    // 最終問題かどうかを判定
    const isLastQuestion = progress.currentQuestionIndex >= progress.totalQuestions - 1;
    
    if (isLastQuestion) {
      // 最終問題の場合はresult APIを呼び出し
      await generateResult();
    } else {
      // 最終問題でない場合は次の問題を生成（非同期で実行）
      generateNextQuestion(selectedChoiceText);
    }
    
    if (onAnswerSelected) {
      onAnswerSelected(selectedChoiceText);
    }
  };

  const generateNextQuestion = (selectedChoiceText: string) => {
    setIsGenerating(true);
    // 非同期でnext-situation APIを呼び出し（画面遷移をブロックしない）
    fetch('/api/next-situation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        previousQuestion: currentScenario.text,
        selectedChoice: selectedChoiceText,
      }),
    })
    .then(async (response) => {
      try {
        const responseData = await response.json();
        console.log('[debug][SimulationDisplay] Next situation API Response:', responseData);
        
        // 生成された問題を確認
        if (responseData.problems && Array.isArray(responseData.problems)) {
          console.log('[debug][SimulationDisplay] Generated problems:', responseData.problems.length);
          responseData.problems.forEach((problem: Problem, index: number) => {
            console.log(`[debug][SimulationDisplay] Problem ${index + 1}:`);
            console.log(`  Question: ${problem.question}`);
            console.log(`  Choices:`, problem.choices);
            if (problem.choices) {
              console.log(`  Choice A: ${problem.choices.a}`);
              console.log(`  Choice B: ${problem.choices.b}`);
              console.log(`  Choice C: ${problem.choices.c}`);
              console.log(`  Choice D: ${problem.choices.d}`);
            }
          });
          
          // 生成された問題を現在のインデックスの次の位置に保存
          const nextIndex = progress.currentQuestionIndex + 1;
          const newProblems = [...problems]; // 既存の問題をコピー
          
          // 新しい問題を追加（配列の長さを拡張）
          responseData.problems.forEach((problem: Problem, index: number) => {
            newProblems[nextIndex + index] = problem;
          });
          
          // 生成された問題をストアに保存
          setProblems(newProblems);
          console.log('[debug][SimulationDisplay] Problems stored in store:', newProblems);
          console.log('[debug][SimulationDisplay] First problem question:', newProblems[nextIndex]?.question);
          console.log('[debug][SimulationDisplay] First problem choices:', newProblems[nextIndex]?.choices);
          setIsGenerating(false);
        } else {
          console.warn('[debug][SimulationDisplay] No problems found in response');
        }
      } catch (error) {
        console.error('[debug][SimulationDisplay] Error parsing next situation response:', error);
      }

      // 直前の選択（currentProblem に対する選択）を即時評価して保存（非同期、画面遷移はブロックしない）
      try {
        const indexToLetter = (idx: number): 'a' | 'b' | 'c' | 'd' => (['a','b','c','d'][idx] as 'a' | 'b' | 'c' | 'd');
        const idx = parseInt(selectedAnswer || '0');
        const selectedLetter = indexToLetter(idx);
        if (currentProblem?.choices) {
          fetch('/api/evaluate-choice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: currentProblem.question,
              choices: currentProblem.choices,
              selectedChoice: selectedLetter,
              questionType: 'multiple_choice',
              subject: currentProblem.subject || 'love',
              context: response,
            }),
          })
            .then(async (res) => {
              try {
                const evalJson = await res.json();
                // レスポンスにステータス情報を追加
                const responseWithStatus = {
                  ...evalJson,
                  status: res.status,
                  success: res.ok
                };
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('evaluateResponse', JSON.stringify(responseWithStatus));
                }
              } catch (error) {
                // エラーの場合もステータス情報付きで保存
                const errorResponse = {
                  error: 'Failed to parse response',
                  status: 500,
                  success: false
                };
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('evaluateResponse', JSON.stringify(errorResponse));
                }
              }
            })
            .catch((error) => {
              // ネットワークエラーの場合もステータス情報付きで保存
              const errorResponse = {
                error: 'Network error',
                status: 0,
                success: false
              };
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('evaluateResponse', JSON.stringify(errorResponse));
              }
            });
        }
      } catch {}
    }) 
  };

  const generateResult = async () => {
    if (!profileData) {
      console.error('[debug][SimulationDisplay] Profile data is not available');
      return;
    }

    setIsGenerating(true);
    
    fetch('/api/result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profileData: profileData,
        problems: problems,
        selectedAnswers: selectedAnswers || []
      }),
    })
      .then(async (response) => {
        try {
          const resultData = await response.json();
          console.log('[debug][SimulationDisplay] Result API Response:', resultData);
          
          // resultDataをsessionStorageに保存
          storageUtils.saveResultData(resultData);
          
          if (onResultGenerated) {
            onResultGenerated(resultData);
          }
        } catch (error) {
          console.error('[debug][SimulationDisplay] Error parsing result response:', error);
        }
      })
      .catch((error) => {
        console.error('[debug][SimulationDisplay] Error generating result:', error);
      })
      .finally(() => {
        setIsGenerating(false);
      });
  };
  
  const resetSimulation = () => {
    setSelectedAnswerState(null);
    setShowConfirmButton(false);
    setShowSelectedAnswer(false);
    setIsAnswering(false);
  };

  return (
    <div className="relative w-full h-screen max-w-[calc(100vh*9/16)] max-h-[calc(100vw*16/9)] mx-auto bg-gradient-to-br from-sky-300 via-orange-200 to-orange-300 overflow-hidden rounded-lg">
      {/* 背景オーバーレイ */}
      <div className={`absolute inset-0 bg-black/30 transition-opacity duration-500 ${
        showSelectedAnswer ? 'opacity-0' : 'opacity-100'
      }`} />
      
      {/* ゲームコンテナ */}
      <div className="relative w-full h-full flex flex-col items-center justify-between p-5 aspect-[9/16] md:aspect-[16/9]">
        {/* 中央イメージ（存在時のみ） */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt="scene"
            className="absolute inset-0 m-auto max-w-[85%] max-h-[85%] object-cover rounded-xl shadow-lg pointer-events-none"
            style={{ top: '15%', left: '50%', transform: 'translate(-50%, -50%)' }}
            onLoad={() => {
              // eslint-disable-next-line no-console
              console.log('[debug][SimulationDisplay] image loaded');
            }}
            onError={(e) => {
              // eslint-disable-next-line no-console
              console.warn('[debug][SimulationDisplay] image load error', (e.target as HTMLImageElement)?.src);
            }}
          />
        )}
        {/* 質問テキスト */}
        <QuestionText 
          text={currentScenario.text}
          isVisible={!showSelectedAnswer}
        />
        
        {/* 選択肢コンテナ */}
        {!showSelectedAnswer && (
          <div className="absolute inset-0 z-10">
            {currentScenario.options.map((option, index) => (
              <ChoiceButton
                key={index}
                text={option}
                position={index as 0 | 1 | 2 | 3}
                isSelected={selectedAnswer === index.toString()}
                onClick={() => handleChoiceSelect(index.toString())}
                isVisible={!isAnswering}
              />
            ))}
          </div>
        )}
        
        {/* 確定ボタン */}
        {showConfirmButton && !showSelectedAnswer && (
          <Button
            onClick={handleConfirm}
            className="absolute bottom-[24%] left-1/2 transform -translate-x-1/2 z-20 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:from-rose-600 hover:via-pink-600 hover:to-orange-600"
            size="lg"
          >
            選択する ➤
          </Button>
        )}
        
        {/* 選択された答えの表示 */}
        {showSelectedAnswer && (
          <SelectedAnswer 
            answer={currentScenario.options[parseInt(selectedAnswer || '0')]}
          />
        )}
      </div>
    </div>
  );
};
