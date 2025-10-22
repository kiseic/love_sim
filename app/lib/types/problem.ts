export type ProblemType = 
  | 'math'
  | 'programming'
  | 'science'
  | 'language'
  | 'logic'
  | 'general'
  | 'love';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Subject = 
  // Special option for all subjects
  | 'all'
  // Math subjects
  | 'algebra'
  | 'geometry'
  | 'calculus'
  | 'statistics'
  | 'trigonometry'
  // Programming subjects
  | 'algorithms'
  | 'data-structures'
  | 'web-development'
  | 'databases'
  | 'system-design'
  // Science subjects
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'earth-science'
  // Language subjects
  | 'grammar'
  | 'vocabulary'
  | 'reading-comprehension'
  | 'writing'
  // Logic subjects
  | 'puzzles'
  | 'reasoning'
  | 'patterns'
  // General
  | 'general-knowledge'
  | 'trivia'
  // Love subjects
  | 'love';

export interface Problem {
  id: string;
  type: ProblemType;
  subject?: Subject;
  difficulty: Difficulty;
  question: string;
  answer?: string;
  explanation?: string;
  hints?: string[];
  // 4択問題用の選択肢を追加
  choices: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  metadata?: {
    topic?: string;
    tags?: string[];
    estimatedTime?: number; // in minutes
    model?: string; // 使用したAIモデル
  };
  createdAt: Date;
  updatedAt?: Date;
}

export interface GenerateProblemRequest {
  type: ProblemType;
  subject?: Subject;
  difficulty: Difficulty;
  count: number;
  topic?: string;
  includeAnswer: boolean;
  includeExplanation: boolean;
  includeHints: boolean;
  customInstructions?: string;
}

export interface GenerateProblemResponse {
  problems: Problem[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}