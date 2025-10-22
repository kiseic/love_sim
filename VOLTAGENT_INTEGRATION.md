# VoltAgent InMemoryStorage統合実装ドキュメント

## 概要

このドキュメントは、クイズプロダクトにVoltAgentのInMemoryStorageを統合した実装について説明します。

## 実装された機能

### 1. VoltAgentエージェント (`app/lib/ai/voltagent-agent.ts`)

教育用クイズ生成に特化したVoltAgentエージェントを実装しました。

```typescript
export const quizAgent = new Agent({
  name: "quiz-generator",
  instructions: `あなたは教育用クイズ生成の専門家です。
ユーザーの学習レベル、好み、過去の問題履歴を考慮して、
最適な問題を生成してください。`,
  llm: new VercelAIProvider(),
  model: openai("gpt-5-2025-08-07"),
  memory: new InMemoryStorage({
    storageLimit: 50, // 会話履歴の最大保持数
  }),
});
```

**特徴:**
- InMemoryStorageによる高速な会話履歴管理
- 学習進捗を考慮した問題生成
- パーソナライズされた学習体験の提供

### 2. 会話管理サービス (`app/lib/services/conversation-manager.ts`)

VoltAgentとの統合インターフェースを提供するサービスです。

**主要メソッド:**
- `generateProblemsWithContext()`: 会話履歴を考慮した問題生成
- `buildContextPrompt()`: 学習履歴を含むプロンプト構築
- `parseProblemsFromResponse()`: VoltAgentレスポンスの解析

**学習履歴管理:**
- ユーザーの学習パターンの追跡
- 正答率の統計情報
- 弱点分野の特定

### 3. セッション管理サービス (`app/lib/services/session-manager.ts`)

ユーザーIDと会話IDの管理を担当します。

**機能:**
- クッキーベースのセッション管理
- ユーザーIDと会話IDの自動生成
- セッション間での学習進捗保持

### 4. 拡張された型定義 (`app/lib/types/conversation.ts`)

VoltAgent統合に必要な型定義を追加しました。

**新しい型:**
- `ConversationContext`: 会話コンテキスト情報
- `LearningHistory`: 学習履歴データ
- `ConversationMetadata`: 会話メタデータ
- `ExtendedAppState`: 拡張されたアプリケーション状態

### 5. Zustandストアの拡張 (`app/lib/store/problemStore.ts`)

既存のストアにVoltAgent統合用の機能を追加しました。

**新しい状態:**
- `conversationContext`: 会話コンテキスト
- `learningHistory`: 学習履歴
- `conversationMetadata`: 会話メタデータ
- `userId` / `conversationId`: セッション情報

### 6. API統合 (`app/api/generate/route.ts`)

既存のAPIエンドポイントをVoltAgent統合に対応させました。

**変更点:**
- VoltAgentを使用した問題生成
- セッション管理の統合
- フォールバック機能（既存のOpenAI直接統合）
- エラーハンドリングの改善

## 使用方法

### 基本的な問題生成

```typescript
import { ConversationManager } from '@/app/lib/services/conversation-manager';

const conversationManager = ConversationManager.getInstance();
const problems = await conversationManager.generateProblemsWithContext(
  request,
  userId,
  conversationId
);
```

### セッション管理

```typescript
import { SessionManager } from '@/app/lib/services/session-manager';

const userId = SessionManager.getUserId(request);
const conversationId = SessionManager.getConversationId(request);
```

### ストアの使用

```typescript
import { useProblemStore } from '@/app/lib/store/problemStore';

const {
  conversationContext,
  learningHistory,
  setConversationContext,
  addLearningHistory
} = useProblemStore();
```

## アーキテクチャ

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer      │    │   VoltAgent     │
│   (Next.js)     │◄──►│   (Route.ts)     │◄──►│   (InMemory)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Zustand       │    │   Session        │    │   Conversation  │
│   Store         │    │   Manager        │    │   Manager       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## セキュリティ考慮事項

1. **セッション管理**: クッキーベースのセッション管理
2. **データ保護**: 会話履歴のプライバシー保護
3. **エラーハンドリング**: 適切なエラーメッセージとログ

## パフォーマンス最適化

1. **InMemoryStorage**: 高速な会話履歴アクセス
2. **メモリ制限**: 会話履歴の最大保持数制限
3. **フォールバック**: VoltAgent失敗時の既存機能へのフォールバック

## 今後の拡張予定

1. **学習パターン分析**: より詳細な学習進捗分析
2. **パーソナライゼーション**: 学習レベルに基づく難易度調整
3. **履歴永続化**: ファイルベース永続化の実装
4. **データベース統合**: 将来的なデータベース統合への準備

## トラブルシューティング

### よくある問題

1. **VoltAgentの初期化エラー**
   - 依存関係の確認
   - APIキーの設定確認
   - プレースホルダー実装の確認

2. **メモリ使用量の増加**
   - `storageLimit`の調整
   - 定期的なメモリクリーンアップ

3. **セッション管理の問題**
   - クッキーの設定確認
   - ブラウザの設定確認

4. **モジュール解決エラー**
   ```bash
   # 依存関係をインストール
   npm install @voltagent/core @voltagent/vercel-ai @ai-sdk/openai
   
   # プレースホルダー実装を使用（現在の状態）
   # または、実際のVoltAgent統合に切り替え
   ```

### ログの確認

```bash
# 開発サーバーのログを確認
npm run dev

# ビルドエラーの確認
npm run build
```

## テスト

実装の動作確認には、`test-voltagent-integration.js`を使用してください。

```bash
node test-voltagent-integration.js
```

## 貢献

この実装に関する改善提案やバグ報告は、GitHubのIssueでお知らせください。
v