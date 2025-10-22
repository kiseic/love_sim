import { ProblemType, Subject, Difficulty } from '../types';

export interface PromptTemplate {
  system: string;
  user: string;
}

const difficultyDescriptions: Record<Difficulty, string> = {
  easy: '基礎的な概念の理解を確認する',
  medium: '応用力と論理的思考を必要とする',
  hard: '高度な分析力と創造的思考を必要とする'
};

export const mathPrompts: Record<string, PromptTemplate> = {
  algebra: {
    system: '代数学の問題を作成する数学教育の専門家として行動してください。',
    user: '方程式、不等式、関数、数列などの代数的概念に関する問題を作成してください。'
  },
  geometry: {
    system: '幾何学の問題を作成する数学教育の専門家として行動してください。',
    user: '図形の性質、証明、座標幾何、立体幾何などに関する問題を作成してください。'
  },
  calculus: {
    system: '微積分の問題を作成する数学教育の専門家として行動してください。',
    user: '極限、微分、積分、級数などの微積分概念に関する問題を作成してください。'
  },
  statistics: {
    system: '統計学の問題を作成する数学教育の専門家として行動してください。',
    user: '確率、分布、検定、推定などの統計的概念に関する問題を作成してください。'
  },
  trigonometry: {
    system: '三角法の問題を作成する数学教育の専門家として行動してください。',
    user: '三角関数、三角方程式、三角恒等式などに関する問題を作成してください。'
  }
};

export const programmingPrompts: Record<string, PromptTemplate> = {
  algorithms: {
    system: 'アルゴリズムとデータ構造の問題を作成するプログラミング教育の専門家として行動してください。',
    user: 'ソート、探索、グラフ、動的計画法などのアルゴリズム問題を作成してください。実装言語は不問とします。'
  },
  'data-structures': {
    system: 'データ構造の問題を作成するプログラミング教育の専門家として行動してください。',
    user: '配列、リスト、スタック、キュー、木構造、グラフなどのデータ構造に関する問題を作成してください。'
  },
  'web-development': {
    system: 'Web開発の問題を作成するプログラミング教育の専門家として行動してください。',
    user: 'HTML/CSS、JavaScript、フレームワーク、API設計などのWeb開発に関する問題を作成してください。'
  },
  databases: {
    system: 'データベースの問題を作成するプログラミング教育の専門家として行動してください。',
    user: 'SQL、正規化、インデックス、トランザクションなどのデータベース概念に関する問題を作成してください。'
  },
  'system-design': {
    system: 'システム設計の問題を作成するソフトウェアアーキテクチャの専門家として行動してください。',
    user: 'スケーラビリティ、可用性、パフォーマンス、セキュリティを考慮したシステム設計問題を作成してください。'
  }
};

export const sciencePrompts: Record<string, PromptTemplate> = {
  physics: {
    system: '物理学の問題を作成する科学教育の専門家として行動してください。',
    user: '力学、電磁気学、熱力学、量子力学などの物理概念に関する問題を作成してください。'
  },
  chemistry: {
    system: '化学の問題を作成する科学教育の専門家として行動してください。',
    user: '原子構造、化学反応、有機化学、無機化学などの化学概念に関する問題を作成してください。'
  },
  biology: {
    system: '生物学の問題を作成する科学教育の専門家として行動してください。',
    user: '細胞生物学、遺伝学、生態学、進化論などの生物学概念に関する問題を作成してください。'
  },
  'earth-science': {
    system: '地球科学の問題を作成する科学教育の専門家として行動してください。',
    user: '地質学、気象学、海洋学、天文学などの地球科学概念に関する問題を作成してください。'
  }
};

export const languagePrompts: Record<string, PromptTemplate> = {
  grammar: {
    system: '言語学習の問題を作成する語学教育の専門家として行動してください。',
    user: '文法規則、品詞、文構造などに関する問題を作成してください。'
  },
  vocabulary: {
    system: '語彙学習の問題を作成する語学教育の専門家として行動してください。',
    user: '単語の意味、語源、同義語、反意語などに関する問題を作成してください。'
  },
  'reading-comprehension': {
    system: '読解力の問題を作成する語学教育の専門家として行動してください。',
    user: '文章理解、要約、推論などの読解力を測る問題を作成してください。'
  },
  writing: {
    system: '文章作成の問題を作成する語学教育の専門家として行動してください。',
    user: 'エッセイ、レポート、創作文などの文章作成課題を作成してください。'
  }
};

export const logicPrompts: Record<string, PromptTemplate> = {
  puzzles: {
    system: '論理パズルを作成するパズル作成の専門家として行動してください。',
    user: '数独、クロスワード、論理パズルなどの頭の体操問題を作成してください。'
  },
  reasoning: {
    system: '論理的思考の問題を作成する論理学の専門家として行動してください。',
    user: '演繹、帰納、類推などの論理的推論に関する問題を作成してください。'
  },
  patterns: {
    system: 'パターン認識の問題を作成する認知科学の専門家として行動してください。',
    user: '数列、図形、規則性などのパターン認識問題を作成してください。'
  }
};

//TODO: プロンプト頑張る人が上手く書いてほしい
export const lovePrompts: Record<string, PromptTemplate> = {
  love: {
    system: '恋愛シミュレーションの問題を作成する恋愛の専門家として行動してください。',
    user: '自分と相手のステータスを次のように設定します。\n自分\n age: 22\n gender :女性\n occupation: 大学院生\n traits: 理系、感情的、優しい\npreferences: お酒、海外旅行、オーケストラ\n background:研究室とアルバイトと就活を両立中\n\n 相手\n age: 23\ngender: 男性\n ocupation:エンタメ総合職\n traits:几帳面、身長が高い\n preferences:筋トレ、きれいなものが好き\n background :今年から新卒\n relationship:マッチングアプリで出会って、LINEで1日2往復程度の連絡をする\nstage:今度初めて会う\n 直面する可能性のあるシチュエーションを考えて、問題を作成する\n'
  } 
};

export function getPromptTemplate(type: ProblemType, subject?: Subject): PromptTemplate {
  let prompts: Record<string, PromptTemplate> | undefined;
  
  switch (type) {
    case 'math':
      prompts = mathPrompts;
      break;
    case 'programming':
      prompts = programmingPrompts;
      break;
    case 'science':
      prompts = sciencePrompts;
      break;
    case 'language':
      prompts = languagePrompts;
      break;
    case 'logic':
      prompts = logicPrompts;
      break;
    case 'love':
      prompts = lovePrompts;
      break;
    default:
      return {
        system: '教育問題を作成する専門家として行動してください。',
        user: '一般的な知識問題を作成してください。'
      };
  }
  
  if (subject && prompts && prompts[subject]) {
    return prompts[subject];
  }
  
  // デフォルトプロンプト
  return {
    system: `${type}分野の問題を作成する教育専門家として行動してください。`,
    user: `${type}に関する教育的な問題を作成してください。`
  };
}

export function enhancePromptWithDifficulty(basePrompt: string, difficulty: Difficulty): string {
  const description = difficultyDescriptions[difficulty];
  return `${basePrompt}\n\n難易度: ${difficulty} - ${description}`;
}