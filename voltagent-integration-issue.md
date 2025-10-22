# VoltAgent InMemoryStorage統合による会話履歴管理機能の実装

## 概要

現在のクイズプロダクトにVoltAgentのInMemoryStorageを統合し、問題生成時の会話履歴管理機能を実装します。これにより、ユーザーとの対話コンテキストを保持し、よりパーソナライズされた問題生成体験を提供します。

## 現状分析

### 現在のアーキテクチャ
- **フレームワーク**: Next.js 15.4.2 + TypeScript
- **状態管理**: Zustand（`useProblemStore`）
- **AI統合**: OpenAI API（直接統合）
- **データ構造**: 
  - `Problem`: 問題の基本情報
  - `ProblemHistory`: 問題履歴（Zustandで管理）
  - `AppState`: アプリケーション状態

### 現在の制限
- 問題生成時に会話コンテキストが保持されない
- ユーザーの学習進捗や好みが反映されない
- 問題生成の一貫性が不足
- 履歴はZustandで管理されているが、ページリロード時に失われる
it
## 提案する統合

### 目標
VoltAgentのInMemoryStorageを統合して以下を実現：
- 問題生成時の会話履歴管理
- ユーザーの学習パターンの記憶
- パーソナライズされた問題生成
- セッション間での学習進捗の保持

### 統合アーキテクチャ

#### 1. VoltAgentエージェントの設定
```typescript
// app/lib/ai/voltagent-agent.ts
import { Agent } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";
import { InMemoryStorage } from "@voltagent/core";

export const quizAgent = new Agent({
  name: "quiz-generator",
  instructions: `あなたは教育用クイズ生成の専門家です。
  ユーザーの学習レベル、好み、過去の問題履歴を考慮して、
  最適な問題を生成してください。
  
  以下の点に注意してください：
  - ユーザーの学習進捗に合わせた難易度調整
  - 過去に間違えた問題の類似問題の生成
  - 学習者の興味に基づいたトピック選択
  - 段階的な学習を促進する問題構成`,
  llm: new VercelAIProvider(),
  model: openai("gpt-5-2025-08-07"),
  memory: new InMemoryStorage({
    storageLimit: 50, // 会話履歴の最大保持数
  }),
});
```

#### 2. 会話管理サービスの実装
```typescript
// app/lib/services/conversation-manager.ts
import { quizAgent } from '../ai/voltagent-agent';
import { Problem, GenerateProblemRequest } from '../types';

export class ConversationManager {
  private static instance: ConversationManager;
  
  static getInstance(): ConversationManager {
    if (!ConversationManager.instance) {
      ConversationManager.instance = new ConversationManager();
    }
    return ConversationManager.instance;
  }

  async generateProblemsWithContext(
    request: GenerateProblemRequest,
    userId: string,
    conversationId: string
  ): Promise<Problem[]> {
    // 会話履歴を含むプロンプトの構築
    const contextPrompt = await this.buildContextPrompt(request, userId, conversationId);
    
    // VoltAgentを使用した問題生成
    const response = await quizAgent.generateText(contextPrompt, {
      userId,
      conversationId,
    });

    // レスポンスの解析とProblemオブジェクトへの変換
    return this.parseProblemsFromResponse(response, request);
  }

  private async buildContextPrompt(
    request: GenerateProblemRequest,
    userId: string,
    conversationId: string
  ): Promise<string> {
    // 過去の学習履歴を考慮したプロンプト構築
    const history = await this.getLearningHistory(userId, conversationId);
    
    return `
以下の条件で問題を生成してください：

${this.formatRequest(request)}

学習履歴：
${this.formatHistory(history)}

過去の学習パターンを考慮し、ユーザーのレベルに適した問題を生成してください。
    `;
  }

  private async getLearningHistory(userId: string, conversationId: string) {
    // 会話履歴の取得（VoltAgentのメモリから）
    // 実装詳細は後述
  }
}
```

#### 3. 拡張された型定義
```typescript
// app/lib/types/conversation.ts
export interface ConversationContext {
  userId: string;
  conversationId: string;
  learningLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredSubjects: Subject[];
  weakAreas: Subject[];
  lastStudySession?: Date;
  totalProblemsSolved: number;
  averageScore: number;
}

export interface LearningHistory {
  problemId: string;
  userAnswer?: string;
  isCorrect: boolean;
  timeSpent: number;
  difficulty: Difficulty;
  subject: Subject;
  createdAt: Date;
}

// 既存のAppStateを拡張
export interface AppState {
  // 既存のフィールド...
  
  // 新しいフィールド
  conversationContext: ConversationContext | null;
  setConversationContext: (context: ConversationContext) => void;
  learningHistory: LearningHistory[];
  addLearningHistory: (entry: LearningHistory) => void;
}
```

#### 4. API統合
```typescript
// app/api/generate/route.ts の更新
import { ConversationManager } from '@/app/lib/services/conversation-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = generateProblemSchema.parse(body);
    
    // ユーザーIDと会話IDの取得（セッション管理から）
    const userId = getUserIdFromSession(request);
    const conversationId = getConversationIdFromSession(request);
    
    // VoltAgentを使用した問題生成
    const conversationManager = ConversationManager.getInstance();
    const problems = await conversationManager.generateProblemsWithContext(
      validatedData,
      userId,
      conversationId
    );
    
    const response: GenerateProblemResponse = {
      problems,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    // エラーハンドリング...
  }
}
```

#### 5. セッション管理の実装
```typescript
// app/lib/services/session-manager.ts
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export class SessionManager {
  static getUserId(request: NextRequest): string {
    const cookieStore = cookies();
    let userId = cookieStore.get('user-id')?.value;
    
    if (!userId) {
      userId = `user-${uuidv4()}`;
      // クッキーを設定（実際の実装ではレスポンスヘッダーで設定）
    }
    
    return userId;
  }

  static getConversationId(request: NextRequest): string {
    const cookieStore = cookies();
    let conversationId = cookieStore.get('conversation-id')?.value;
    
    if (!conversationId) {
      conversationId = `conv-${uuidv4()}`;
      // クッキーを設定
    }
    
    return conversationId;
  }
}
```

### 実装手順

#### Phase 1: 基盤実装
1. **VoltAgent依存関係の追加**
   ```bash
   npm install @voltagent/core @voltagent/vercel-ai @ai-sdk/openai
   ```

2. **基本的なエージェント設定**
   - `app/lib/ai/voltagent-agent.ts`の作成
   - InMemoryStorageの設定

3. **会話管理サービスの実装**
   - `app/lib/services/conversation-manager.ts`の作成
   - 基本的な会話履歴管理機能

#### Phase 2: 統合実装
1. **API統合**
   - 既存の`/api/generate/route.ts`の更新
   - VoltAgentを使用した問題生成への移行

2. **セッション管理**
   - ユーザーIDと会話IDの管理
   - クッキーベースのセッション管理

3. **型定義の拡張**
   - 会話コンテキストと学習履歴の型定義
   - Zustandストアの拡張

#### Phase 3: 高度な機能
1. **学習パターン分析**
   - ユーザーの学習進捗の分析
   - 弱点分野の特定

2. **パーソナライゼーション**
   - 学習レベルに基づく難易度調整
   - 興味に基づくトピック選択

3. **履歴永続化**
   - オプションでファイルベース永続化の実装
   - 開発環境での履歴保持

### ファイル構造の変更

```
app/
├── lib/
│   ├── ai/
│   │   ├── openai.ts (既存)
│   │   ├── prompts.ts (既存)
│   │   └── voltagent-agent.ts (新規)
│   ├── services/
│   │   ├── conversation-manager.ts (新規)
│   │   └── session-manager.ts (新規)
│   ├── types/
│   │   ├── conversation.ts (新規)
│   │   └── ... (既存)
│   └── store/
│       └── problemStore.ts (拡張)
├── api/
│   └── generate/
│       └── route.ts (更新)
└── components/
    └── ... (既存)
```

### 技術的考慮事項

#### 1. パフォーマンス
- InMemoryStorageの使用により高速な会話履歴アクセス
- メモリ使用量の監視と制限設定
- 会話履歴の自動クリーンアップ

#### 2. セキュリティ
- ユーザーIDの適切な管理
- 会話履歴のプライバシー保護
- セッション管理のセキュリティ

#### 3. スケーラビリティ
- 将来的なデータベース統合への移行可能性
- 複数ユーザー対応の準備
- 分散環境での動作

### 受け入れ基準

- [ ] VoltAgentエージェントの基本設定
- [ ] 会話管理サービスの実装
- [ ] API統合の完了
- [ ] セッション管理の実装
- [ ] 型定義の拡張
- [ ] 基本的な会話履歴機能の動作確認
- [ ] 既存機能との互換性確認
- [ ] エラーハンドリングの実装
- [ ] 単体テストの作成
- [ ] ドキュメントの更新

### メリット

1. **パーソナライズされた学習体験**: ユーザーの学習履歴に基づく問題生成
2. **学習進捗の追跡**: 継続的な学習パターンの分析
3. **一貫性のある問題生成**: 会話コンテキストを考慮した問題選択
4. **開発効率の向上**: VoltAgentの成熟したフレームワークの活用
5. **将来の拡張性**: より高度なAI機能への基盤構築

### リスクと対策

#### リスク
- VoltAgentの学習コスト
- メモリ使用量の増加
- 既存機能への影響

#### 対策
- 段階的な実装とテスト
- メモリ使用量の監視
- 既存機能の完全な後方互換性確保

## ラベル
- `enhancement`
- `ai-integration`
- `conversation-management`
- `voltagent`
- `memory-system`

## 優先度
高 - ユーザー体験の大幅な向上が期待される

## 推定作業量
1-2週間（段階的実装）
