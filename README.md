# 🎓 2025年夏季インターンシップ GMOメディア「コエテコStudyコース」へようこそ！

## 📌 プロジェクト概要

このプロジェクトは、GMOメディアが運営する「コエテコStudy」で実際に稼働している問題AIジェネレーター機能を基に作成された、インターンシップ用の教育プロジェクトです。

### インターンシップの目的

1. **実践的な開発経験**: 本番稼働を意識した技術スタックでの開発
2. **創造性の発揮**: 既存機能への創意工夫による価値向上
3. **チーム開発の体験**: コードレビューやCI/CDを通じた協働作業

### 期待される成果

- 既存機能の改善・拡張
- 新機能の企画・実装
- コード品質の向上
- ユーザー体験の向上

## 🚀 クイックスタート

### 1. 環境構築

```bash
# リポジトリのフォーク（GitHubで実施）
# フォークしたリポジトリをクローン
git clone https://github.com/[your-username]/summer-internship-2025-sandbox
cd summer-internship-2025-sandbox

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.localを編集してOPENAI_API_KEYを設定（インターン開始時に配布）
```

### 2. 開発サーバーの起動

```bash
npm run dev
# http://localhost:3000 でアプリケーションが起動します
```

## 🏗️ 開発フロー

### ブランチ戦略

```bash
# 新機能の開発
git checkout -b feature/your-feature-name

# バグ修正
git checkout -b fix/bug-description

# リファクタリング
git checkout -b refactor/target-description
```

### Pull Request (PR) の作成

1. **ブランチで開発**
   ```bash
   git add .
   git commit -m "feat: 新機能の説明"
   git push origin feature/your-feature-name
   ```

2. **GitHubでPRを作成**
   - タイトル: `[種別] 簡潔な説明`
   - 本文には以下を含める：
     - 変更内容の詳細
     - 動作確認の方法
     - スクリーンショット（UI変更の場合）

3. **自動デプロイ**
   - PR作成時: プレビュー環境が自動作成されます
   - mainマージ時: 本番環境に自動デプロイされます

### コミットメッセージ規約

```
feat: 新機能の追加
fix: バグ修正
docs: ドキュメントの更新
style: フォーマット修正（機能に影響なし）
refactor: リファクタリング
test: テストの追加・修正
chore: ビルドプロセスやツールの変更
```

## 🛠️ 技術仕様

### アーキテクチャ概要

このアプリケーションは、Next.jsのフルスタック機能を活用した構成になっています。

```
【ユーザー画面】
    ↓
[1] フロントエンド (React + TypeScript)
    - 問題生成フォーム
    - 問題表示・編集画面
    - 履歴管理
    ↓
[2] 状態管理 (Zustand)
    - 生成された問題の保存
    - UI状態の管理
    - 履歴データの管理
    ↓
[3] APIルート (Next.js API Routes)
    - リクエストの受付
    - バリデーション (Zod)
    - エラーハンドリング
    ↓
[4] AI連携 (OpenAI API)
    - プロンプトの構築
    - 問題の生成
    - レスポンスの整形
    ↓
【生成された問題を表示】
```

### システムの流れ

1. **ユーザー入力** → フォームで問題の条件を設定
2. **データ検証** → Zodでバリデーション
3. **API通信** → Next.jsのAPIルートへPOSTリクエスト
4. **AI処理** → OpenAI APIで問題生成
5. **状態更新** → Zustandストアに保存
6. **画面更新** → Reactコンポーネントが再レンダリング

### 主要コンポーネント

#### 1. ProblemGeneratorForm (`app/components/problem-generator/ProblemGeneratorForm.tsx`)
- **役割**: 問題生成のパラメータ入力フォーム
- **技術**: React Hook Form + Zod によるバリデーション
- **改善ポイント**: より直感的なUI、リアルタイムプレビュー機能

#### 2. ProblemDisplay (`app/components/problem-display/`)
- **役割**: 生成された問題の表示・編集
- **技術**: React コンポーネント
- **改善ポイント**: リッチテキストエディタ、数式レンダリング

#### 3. API Route (`app/api/generate/route.ts`)
- **役割**: OpenAI APIとの通信、問題生成ロジック
- **技術**: Next.js Route Handlers
- **改善ポイント**: レート制限、エラーハンドリング強化

#### 4. Store (`app/lib/store/problemStore.ts`)
- **役割**: アプリケーション全体の状態管理
- **技術**: Zustand
- **改善ポイント**: 永続化、履歴の詳細管理

### 技術スタックの詳細

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| **フレームワーク** | Next.js 15.4 | フルスタックWebアプリケーション |
| **言語** | TypeScript | 型安全な開発 |
| **スタイリング** | Tailwind CSS | ユーティリティファーストCSS |
| **状態管理** | Zustand | シンプルで軽量な状態管理 |
| **フォーム** | React Hook Form + Zod | フォーム管理とバリデーション |
| **AI** | OpenAI API | 問題生成エンジン |
| **デプロイ** | AWS Amplify | CI/CD統合デプロイメント |

## 💡 改善アイデア集

### 🎯 機能拡張のアイデア

#### 1. 学習管理機能
```typescript
// 例: 学習進捗トラッキング
interface LearningProgress {
  userId: string;
  problemsSolved: number;
  correctRate: number;
  weakSubjects: Subject[];
}
```
- ユーザーごとの学習履歴
- 正答率の記録
- 苦手分野の分析

#### 2. 問題のカスタマイズ機能
- テンプレートベースの問題生成
- 画像やグラフを含む問題
- インタラクティブな問題（ドラッグ&ドロップなど）

#### 3. AIの活用拡張
- 生成された問題の難易度自動判定
- ユーザーの理解度に応じた問題推薦
- 解答の自動採点機能

#### 4. コラボレーション機能
- 問題の共有機能
- 先生と生徒のインタラクション
- クラスルーム機能

### 🎨 UI/UX改善のアイデア

#### 1. レスポンシブデザインの強化
```css
/* モバイルファーストのアプローチ */
@media (max-width: 768px) {
  /* モバイル向けの最適化 */
}
```

#### 2. アクセシビリティ向上
- キーボードナビゲーション
- スクリーンリーダー対応
- ハイコントラストモード

#### 3. アニメーション・トランジション
- 問題生成時のローディングアニメーション
- スムーズなページ遷移
- マイクロインタラクション

#### 4. テーマ機能
- ダークモード対応
- カスタムテーマ
- 色覚異常対応

### ⚡ パフォーマンス最適化

#### 1. 画像・アセット最適化
```typescript
// Next.js Image コンポーネントの活用
import Image from 'next/image';
```

#### 2. コード分割
```typescript
// 動的インポートの活用
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
});
```

#### 3. キャッシング戦略
- React Query / SWRの導入
- Service Workerの活用
- CDNの最適化

### 🔒 セキュリティ強化

#### 1. 入力値検証の強化
```typescript
// より厳密なバリデーション
const sanitizeInput = (input: string): string => {
  // XSS対策
  return DOMPurify.sanitize(input);
};
```

#### 2. レート制限
```typescript
// API Routeでのレート制限実装
import rateLimit from 'express-rate-limit';
```

#### 3. 認証・認可
- NextAuth.jsの導入
- ユーザー権限管理
- セッション管理

## 📚 開発ガイドライン

### コーディング規約

#### TypeScript
```typescript
// 良い例: 明示的な型定義
interface User {
  id: string;
  name: string;
  email: string;
}

// 避けるべき: any型の使用
const data: any = fetchData(); // ❌
```

#### React コンポーネント
```typescript
// 良い例: 関数コンポーネント + TypeScript
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ onClick, children, variant = 'primary' }) => {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {children}
    </button>
  );
};
```

### フォルダ構造のベストプラクティス

```
app/
├── components/          # UIコンポーネント
│   ├── common/         # 共通コンポーネント
│   ├── features/       # 機能別コンポーネント
│   └── layouts/        # レイアウトコンポーネント
├── hooks/              # カスタムフック
├── lib/                # ユーティリティ・ライブラリ
├── services/           # API通信ロジック
└── types/              # TypeScript型定義
```

## 📖 学習リソース

### Next.js
- [Next.js 公式ドキュメント](https://nextjs.org/docs)
- [Next.js Learn コース](https://nextjs.org/learn)
- [App Router 完全ガイド](https://nextjs.org/docs/app)

### TypeScript
- [TypeScript ハンドブック](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive 日本語版](https://typescript-jp.gitbook.io/deep-dive/)

### React
- [React 公式ドキュメント](https://react.dev/)
- [React Hooks 詳解](https://react.dev/reference/react)

### AI/機械学習
- [OpenAI API ドキュメント](https://platform.openai.com/docs)
- [プロンプトエンジニアリング ガイド](https://www.promptingguide.ai/jp)

### その他の推奨リソース
- [MDN Web Docs](https://developer.mozilla.org/ja/)
- [web.dev](https://web.dev/)
- [CSS Tricks](https://css-tricks.com/)

## 🐛 トラブルシューティング

### よくある問題と解決方法

#### 1. 環境変数が読み込まれない
```bash
# .env.localファイルの確認
cat .env.local

# 開発サーバーの再起動
npm run dev
```

#### 2. TypeScriptエラー
```bash
# 型定義の更新
npm install --save-dev @types/[package-name]

# TypeScriptの設定確認
npx tsc --noEmit
```

#### 3. ビルドエラー
```bash
# キャッシュのクリア
rm -rf .next
npm run build
```

### デバッグのコツ

#### 1. console.logの活用
```typescript
// 開発環境でのみログ出力
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

#### 2. React Developer Tools
- Chrome/Firefox拡張機能をインストール
- コンポーネントツリーの確認
- Props/Stateの検査

#### 3. Network タブの活用
- API通信の確認
- レスポンスの検証
- パフォーマンス分析

## 🎯 インターン期間中の目標

### Day 1-2: 理解とセットアップ
- [ ] プロジェクト構造の理解
- [ ] 開発環境の構築
- [ ] 既存機能の動作確認

### Day 3-5: 機能開発
- [ ] 改善案の企画
- [ ] 実装開始
- [ ] テストの作成

### Day 6-10: 仕上げとプレゼンテーション
- [ ] コードのリファクタリング
- [ ] ドキュメントの整備
- [ ] 成果発表の準備

## 🤝 サポート

### 質問・相談

- **Slack**: 専用SlackチャンネルでいつでもメンションOKです。
- **ランチ会など**: オフラインで交流できる方は是非！働き方やキャリアなど、何でも遠慮なく質問してください！

### コードレビュー

- PRには必ずレビュアーを設定
- フィードバックは建設的に
- 学びの機会として活用

## 📝 最後に

このインターンシップを通じて、皆さんのプロダクト開発経験に少しでも貢献できれば嬉しいです。疑問があれば何でもメンターに質問してください。
そして、ぜひあなたのアイデアをコエテコStudyに採用させてください！

**Good luck and happy coding! 🚀**

---

*GMOメディア株式会社 サービス開発部 メンター一同*