import { Problem } from './problem';

export interface ProblemHistory {
  id: string;
  problems: Problem[];
  createdAt: Date;
  title?: string;
  description?: string;
}

export interface ProfileData {
  my: {
    age: string;
    gender: string;
    occupation: string;
    traits: string;
    preference: string;
    background: string;
    detailedDescription: string;
  };
  partner: {
    age: string;
    gender: string;
    occupation: string;
    traits: string;
    preference: string;
    background: string;
    detailedDescription: string;
  };
  relationship: string;
  stage: string;
  goal: string;
  numberOfQuestions: string;
}

export interface ProfileStore {
  profileData: ProfileData | null;
  isGenerating: boolean; // 問題生成中の状態
  setProfileData: (data: ProfileData) => void;
  clearProfileData: () => void;
  setIsGenerating: (isGenerating: boolean) => void; // 生成状態を設定する関数
}

// 問題の進行状況を管理するためのインターフェース
export interface ProblemProgress {
  currentQuestionIndex: number; // 現在の問題番号（0から開始）
  totalQuestions: number; // 総問題数
  currentPhase: 'problem' | 'explanation' | 'completed'; // 現在のフェーズ
  isLastQuestion: boolean; // 最後の問題かどうか
}

export interface ProblemStore {
  progress: ProblemProgress;
  selectedProblemId: string | null;
  problems: Problem[]; // 生成された問題を保存
  selectedAnswers: string[]; // 各問題の選択を保存
  nextQuestion: () => void;
  nextPhase: () => void;
  resetProgress: () => void;
  initializeProgress: (totalQuestions: number) => void;
  setSelectedProblemId: (id: string) => void;
  setProblems: (problems: Problem[]) => void; // 問題を設定する関数
  clearProblems: () => void; // 問題をクリアする関数
  setSelectedAnswer: (questionIndex: number, answer: string) => void; // 選択を保存する関数
  getSelectedAnswer: (questionIndex: number) => string | null; // 選択を取得する関数
  clearSelectedAnswers: () => void; // 選択履歴をクリアする関数
}