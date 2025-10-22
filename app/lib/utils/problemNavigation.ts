import { ProblemProgress } from '../types/store';

/**
 * 現在の進行状況に基づいて表示するボタンの種類を決定する
 */
export const getButtonType = (progress: ProblemProgress): 'next' | 'nextQuestion' | 'showResults' => {
  if (progress.currentPhase === 'problem') {
    return 'next'; // 問題表示中は「次へ」ボタン（解説へ）
  } else if (progress.currentPhase === 'explanation') {
    if (progress.isLastQuestion) {
      return 'showResults'; // 最後の問題の解説中は「結果へ」ボタン
    } else {
      return 'nextQuestion'; // 途中の問題の解説中は「次の問題へ」ボタン
    }
  }
  return 'next'; // デフォルト
};

/**
 * ボタンのテキストを取得する
 */
export const getButtonText = (progress: ProblemProgress): string => {
  const buttonType = getButtonType(progress);
  
  switch (buttonType) {
    case 'next':
      return '次へ';
    case 'nextQuestion':
      return '次の問題へ';
    case 'showResults':
      return '結果を見る';
    default:
      return '次へ';
  }
};

/**
 * 現在の問題番号を表示用のテキストに変換する
 */
export const getQuestionNumberText = (progress: ProblemProgress): string => {
  return `問題 ${progress.currentQuestionIndex + 1} / ${progress.totalQuestions}`;
};

/**
 * 次のアクションが可能かどうかを判定する
 */
export const canProceed = (progress: ProblemProgress): boolean => {
  if (progress.currentPhase === 'problem') {
    return true; // 問題表示中は常に次へ進める
  } else if (progress.currentPhase === 'explanation') {
    return true; // 解説中も常に次へ進める
  }
  return false;
};
