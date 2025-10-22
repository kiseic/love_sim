import { z } from 'zod';

export const problemTypeSchema = z.enum([
  'math',
  'programming',
  'science',
  'language',
  'logic',
  'general',
  'love'
]);

export const difficultySchema = z.enum(['easy', 'medium', 'hard']);

export const subjectSchema = z.enum([
  // Special option for all subjects
  'all',
  // Math subjects
  'algebra',
  'geometry',
  'calculus',
  'statistics',
  'trigonometry',
  // Programming subjects
  'algorithms',
  'data-structures',
  'web-development',
  'databases',
  'system-design',
  // Science subjects
  'physics',
  'chemistry',
  'biology',
  'earth-science',
  // Language subjects
  'grammar',
  'vocabulary',
  'reading-comprehension',
  'writing',
  // Logic subjects
  'puzzles',
  'reasoning',
  'patterns',
  // General
  'general-knowledge',
  'trivia',
  // love subjects
  'love'
]);

export const generateProblemSchema = z.object({
  type: problemTypeSchema.describe('問題タイプを選択してください'),
  subject: subjectSchema.optional().describe('科目・分野を選択してください'),
  difficulty: difficultySchema.describe('難易度を選択してください'),
  count: z.number()
    .min(1, { message: '問題数は1以上にしてください' })
    .max(20, { message: '問題数は20以下にしてください' })
    .default(1),
  topic: z.string().optional(),
  includeAnswer: z.boolean().default(true),
  includeExplanation: z.boolean().default(false),
  includeHints: z.boolean().default(false),
  questionType: z.enum(['multiple_choice', 'fill_in_the_blank', 'short_answer']).optional(),
  customInstructions: z.string()
    .max(500, { message: '追加の指示は500文字以内で入力してください' })
    .optional(),
});

// 恋愛シミュレーション用のスキーマ
// 利用していない
export const loveSimulationSchema = z.object({
  my: z.object({
    age: z.string().min(1, { message: '年齢を入力してください' }),
    gender: z.string().min(1, { message: '性別を選択してください' }),
    occupation: z.string().min(1, { message: '職業を入力してください' }),
    traits: z.string().min(1, { message: '性格・特徴を入力してください' }),
    preference: z.string().min(1, { message: '好みを入力してください' }),
    background: z.string().min(1, { message: '経歴・背景を入力してください' }),
    detailedDescription: z.string().min(1, { message: '詳細な説明を入力してください' })
  }),
  partner: z.object({
    age: z.string().min(1, { message: '年齢を入力してください' }),
    gender: z.string().min(1, { message: '性別を選択してください' }),
    occupation: z.string().min(1, { message: '職業を入力してください' }),
    traits: z.string().min(1, { message: '性格・特徴を入力してください' }),
    preference: z.string().min(1, { message: '好みを入力してください' }),
    background: z.string().min(1, { message: '経歴・背景を入力してください' }),
    detailedDescription: z.string().min(1, { message: '詳細な説明を入力してください' })
  }),
  relationship: z.string().min(1, { message: '関係性を選択してください' }),
  stage: z.string().min(1, { message: '関係の段階を選択してください' }),
  goal: z.string().min(1, { message: '目標を入力してください' }),
  numberOfQuestions: z
    .string()
    .min(1, { message: '問題数を選択してください' })
    .refine((v) => {
      const n = parseInt(v, 10);
      return !isNaN(n) && n >= 1 && n <= 20;
    }, { message: '問題数は1〜20の範囲で指定してください' })
});

export type GenerateProblemFormData = z.infer<typeof generateProblemSchema>;
export type LoveSimulationFormData = z.infer<typeof loveSimulationSchema>;