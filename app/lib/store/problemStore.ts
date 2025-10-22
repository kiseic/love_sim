import { create } from 'zustand';
import { ProblemStore } from '../types/store';
import { Problem } from '../types/problem';

export const useProblemStore = create<ProblemStore>((set, get) => ({
  progress: {
    currentQuestionIndex: 0,
    totalQuestions: 0,
    currentPhase: 'problem',
    isLastQuestion: false,
  },
  selectedProblemId: null,
  problems: [], // 生成された問題を保存する配列
  selectedAnswers: [], // 各問題の選択を保存する配列

  nextQuestion: () => {
    const { progress } = get();
    if (progress.currentQuestionIndex < progress.totalQuestions - 1) {
      set((state) => ({
        progress: {
          ...state.progress,
          currentQuestionIndex: state.progress.currentQuestionIndex + 1,
          currentPhase: 'problem',
          isLastQuestion: state.progress.currentQuestionIndex + 1 === state.progress.totalQuestions - 1,
        },
      }));
    }
  },

  nextPhase: () => {
    const { progress } = get();
    if (progress.currentPhase === 'problem') {
      set((state) => ({
        progress: {
          ...state.progress,
          currentPhase: 'explanation',
        },
      }));
    } else if (progress.currentPhase === 'explanation') {
      if (progress.isLastQuestion) {
        // 最後の問題の場合は完了フェーズへ
        set((state) => ({
          progress: {
            ...state.progress,
            currentPhase: 'completed',
          },
        }));
      } else {
        // 次の問題へ
        get().nextQuestion();
      }
    }
  },

  resetProgress: () => {
    set({
      progress: {
        currentQuestionIndex: 0,
        totalQuestions: 0,
        currentPhase: 'problem',
        isLastQuestion: false,
      },
      selectedAnswers: [], // 選択履歴もリセット
    });
  },

  initializeProgress: (totalQuestions: number) => {
    set({
      progress: {
        currentQuestionIndex: 0,
        totalQuestions,
        currentPhase: 'problem',
        isLastQuestion: totalQuestions === 1,
      },
      selectedAnswers: new Array(totalQuestions).fill(''), // 問題数分の空配列で初期化
    });
  },
  
  setSelectedProblemId: (id: string) => {
    set({ selectedProblemId: id });
  },
  
  setProblems: (problems: Problem[]) => {
    set({ problems });
  },
  
  clearProblems: () => {
    set({ problems: [] });
  },

  setSelectedAnswer: (questionIndex: number, answer: string) => {
    set((state) => ({
      selectedAnswers: state.selectedAnswers.map((ans, index) => 
        index === questionIndex ? answer : ans
      )
    }));
  },

  getSelectedAnswer: (questionIndex: number) => {
    const { selectedAnswers } = get();
    return questionIndex >= 0 && questionIndex < selectedAnswers.length 
      ? selectedAnswers[questionIndex] 
      : null;
  },

  clearSelectedAnswers: () => {
    set({ selectedAnswers: [] });
  },
}));