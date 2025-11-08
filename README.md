# Love Simulation

Love Simulation は、恋愛シミュレーションを題材にしたインタラクティブな学習体験を提供する Next.js 製アプリケーションです。ユーザーは自分と相手のプロフィールを入力し、VoltAgent を経由した大規模言語モデル（LLM）が生成する分岐シナリオを進めながら、選択肢ごとの解説と総合診断を得られます。本プロダクトは React 19 と TypeScript を基盤とし、Tailwind CSS による UI 表現と Zustand による状態管理を組み合わせて構築されています。

## プロダクト概要

- プロフィール入力およびプリセット機能で、恋愛シナリオの初期条件を簡単に設定できます。
- `POST /api/generate` が最初のシナリオと四択問題を生成し、選択結果は `POST /api/evaluate-choice` によってスコアリングされます。
- 進行中の選択は `POST /api/next-situation` を通じて次のシチュエーションに反映され、DALL·E 3 による情景画像もあわせて生成されます。
- シナリオを完了すると `POST /api/result` が総合レポートを作成し、レーダーチャートやタイプ診断を表示します。
- LLM 連携は `@voltagent/core` の InMemoryStorage を用いた `QuizAgent` が担い、会話コンテキストを維持します。

## アーキテクチャ

1. ユーザーはトップページ（`/`）でプロフィールを入力し、Zod によるバリデーションを通過します。
2. `LoveSimulationForm` がプロフィール情報を `useProfileStore` に保存し、問題数に応じて `useProblemStore` を初期化します。
3. API ルートが OpenAI API（gpt-5 系モデルおよび DALL·E 3）を呼び出し、`voltagent.ts` で定義された `QuizAgent` がメモリを保持しながら応答を生成します。
4. フロントエンドはセッション単位のメモリとして `sessionStorage` を併用し、直近の生成結果と選択肢評価をキャッシュします。
5. `/simulation` で問題を解き、`/simulation-explanation` で各選択肢の評価とスコアを確認し、最終的に `/simulation-result` で診断結果を閲覧します。
6. `app/ops` には EventSource ベースのオペレーションビューを配置し、SSE を実装することで `agentEventBus` のイベントを監視できる設計になっています（バックエンド実装は別途追加が必要です）。

## 主な機能

- **プロフィールプリセット**: `app/lib/constants/presets.ts` に定義された 10 種類のシナリオテンプレートから即時に条件を読み込めます。
- **問題生成と評価**: `app/api/generate/route.ts` と `app/api/evaluate-choice/route.ts` がそれぞれ初期問題と選択肢評価を担当します。評価結果は JSON 形式のスコアと改善提案を含みます。
- **次シチュエーション生成**: `app/api/next-situation/route.ts` は直前の選択内容を踏まえたシナリオ更新と画像生成を行います。生成された画像は Base64 データ URI として返却され、メタデータの `tags` に格納されます。
- **最終結果レポート**: `app/api/result/route.ts` が総合スコア、恋愛タイプ、相性アドバイスを生成します。フロントエンドでは Canvas を用いたレーダーチャートで視覚化します。
- **UI コンポーネント**: `app/components/ui` 以下にボタン、カード、モーダル、プリセットカード、アバターアップロードなどの再利用可能なコンポーネントを配置しています。
- **学習リソース**: `DOCS/` ディレクトリに初期設計資料（HTML モックアップと解説）が保存されています。UI の再現や遷移確認に活用できます。

## 開発環境のセットアップ

1. リポジトリをクローンします。
   ```bash
   git clone <repository-url>
   cd love_sim
   ```
2. 依存関係をインストールします。
   ```bash
   npm install
   ```
3. 環境変数を設定します。`.env.example` を参考に `.env.local` を作成し、OpenAI の API キーを登録してください。
   ```bash
   cp .env.example .env.local
   # OPENAI_API_KEY=sk-... を設定
   ```
   `app/lib/ai/openai.ts` は起動時に `OPENAI_API_KEY` を必須とするため、未設定のままではサーバーがエラーで停止します。
4. 開発サーバーを起動します。
   ```bash
   npm run dev
   ```
   Turbopack が有効な Next.js 開発サーバーが `http://localhost:3000` で立ち上がります。

## 利用可能なスクリプト

| コマンド | 説明 |
| -------- | ---- |
| `npm run dev` | 開発サーバーを起動します。|
| `npm run build` | 本番ビルドを実行します。|
| `npm run start` | ビルド済み成果物を起動します。|
| `npm run lint` | ESLint による静的解析を実行します。|

## ディレクトリ構成（主要部分）

```
app/
  page.tsx                  # トップページ（プロフィール入力フォーム）
  simulation/               # シミュレーション進行ページ
  simulation-explanation/   # 選択肢評価表示ページ
  simulation-result/        # 最終結果ページ
  ops/                      # オペレーションダッシュボード
  api/
    generate/route.ts       # 初期シナリオ生成 API
    next-situation/route.ts # 次シチュエーション生成 API
    evaluate-choice/route.ts# 選択肢評価 API
    result/route.ts         # 総合結果生成 API
  components/
    love-simulation/        # LoveSimulationForm など入力フォーム群
    simulation-display/     # シナリオ表示と選択 UI
    simulation-result/      # 結果画面コンポーネント
    ui/                     # 共通 UI コンポーネント
  lib/
    ai/                     # OpenAI クライアントとプロンプト
    constants/              # プリセット定義
    store/                  # Zustand ストア
    types/                  # 型定義
    voltagent.ts            # VoltAgent と QuizAgent の設定
```

## AI エージェントとメモリ管理

- `app/lib/voltagent.ts` で `QuizAgent` を生成し、`InMemoryStorage` を利用して会話履歴を保持します。保存上限は 50 エントリです。
- `VoltAgent` によってエージェントをカタログ化し、将来的に複数エージェントを切り替える余地があります。
- VoltAgent の In-Memory Storage や Operation Context の詳細は以下の公式ドキュメントを参照してください。
  - In-Memory Storage: https://voltagent.dev/docs/agents/memory/in-memory/
  - Memory 概要: https://voltagent.dev/docs/agents/memory/overview/
  - Operation Context: https://voltagent.dev/docs/agents/context/
  - Next.js 連携: https://voltagent.dev/docs/integrations/nextjs/
  - チュートリアル: https://voltagent.dev/tutorial/memory/

## 状態管理と永続化

- `useProfileStore` はプロファイル入力と生成状態（`isGenerating`）を保持し、Zustand の `persist` ミドルウェアでブラウザストレージに保存します。
- `useProblemStore` は現在の問題番号、合計問題数、フェーズ（`problem` / `explanation` / `completed`）と選択履歴を扱います。
- API 応答の一部は `sessionStorage` に保存し、ページ遷移間で共有しています（`generateResponse` と `evaluateResponse`）。

## 主要な API 仕様

### `/api/generate`
- **入力**: プロフィール情報（自分・相手・関係性・目標・質問数）。
- **処理**: VoltAgent 経由で LLM を呼び出し、四択問題リストを生成します。ネットワーク障害やタイムアウトに備えたエラーハンドリングを実装しています。
- **出力**: `problems: Problem[]` を含む JSON。各 `Problem` は `choices`、`question`、`createdAt` などを持ちます。

### `/api/evaluate-choice`
- **入力**: 問題文、選択肢、選択した選択肢、問題種別、追加コンテキスト。
- **処理**: 選択肢ごとの評価ラベル（BEST / GOOD / BAD）、スコア、強み・改善点・ヒントを生成します。
- **出力**: `explanations` オブジェクトを含む JSON。ラベル別のメタ情報を返却します。

### `/api/next-situation`
- **入力**: 直前の問題文、選択肢、選択した選択肢。
- **処理**: 次の問題文と選択肢の生成に加え、DALL·E 3 で関連画像を生成します。画像データは Base64 形式または URL として返却されます。
- **出力**: `problems: Problem[]`。画像が生成された場合は `metadata.tags` に `image:data-uri` 形式で格納されます。

### `/api/result`
- **入力**: プロフィール、全問題、ユーザーの選択履歴。
- **処理**: 恋愛スキルの数値化、タイプ分類、相性診断、アドバイスを生成します。
- **出力**: `scores`、`loveType`、`growthTips`、`compatibility` を含む JSON。フロントエンドが結果画面に反映します。

## フロントエンドのページ構成

- `/`: `LoveSimulationForm` がプロフィール入力、プリセット選択、プレビュー、開始操作を受け付けます。
- `/simulation`: `SimulationDisplay` が四択の選択 UI と進行バーを表示します。回答ごとに `useProblemStore` がフェーズを更新します。
- `/simulation-explanation`: Canvas ベースのレーダーチャートと、ラベル別の強み・改善点・ヒントを提示します。
- `/simulation-result`: `SimulationResult` が最終スコア、関係の変化、シェア機能（Twitter、LINE、クリップボード）、再プレイ導線を提供します。
- `/ops`: SSE によりエージェントイベントをモニタリングするための管理画面です。`/api/ops/events` エンドポイントを実装することで `agentEventBus` のスナップショットとリアルタイムイベントを表示できます。

## デザインとスタイリング

- Tailwind CSS を採用し、ユーティリティクラス中心にスタイルを定義しています。
- `SimulationDisplay` ではカスタムアニメーション（浮遊アニメーション、ハートビート）を適用しています。
- `SimulationResult` は動画背景や桜の花びらアニメーションを備え、シェアボタンは各プラットフォーム固有のディープリンクに対応します。
- UI テキストは `app/components/` 以下で集中管理しており、カスタマイズは各コンポーネント単位で行えます。

## 開発フローの推奨事項

- ブランチは `feature/<説明>`、`fix/<説明>` など用途別に作成してください。
- 主要ページや API に変更を加えた場合は `npm run lint` を実行し、型エラーと静的解析の警告を解消してください。
- OpenAI 連携部をモック化する場合は API ルートにスタブレスポンスを追加し、`process.env.OPENAI_API_KEY` の検証を条件分岐でスキップする方法が有効です。

## トラブルシューティング

- **OpenAI API キーが未設定**: 開発サーバー起動時に `OPENAI_API_KEY is not set` エラーが発生します。`.env.local` を再確認してください。
- **LLM への接続失敗**: API レスポンスが 503 を返し、「LLM サービスに接続できません」と表示された場合はネットワーク設定とプロキシ設定を確認してください。
- **選択肢評価が JSON 解析エラーになる**: LLM 応答が JSON 形式でない場合、502 エラーが発生します。プロンプト調整または再試行を行ってください。
- **画像生成が失敗する**: `next-situation` の画像生成エラーは警告ログに記録されます。画像なしでもシミュレーションは継続します。

## 参考資料

- In-Memory Storage: https://voltagent.dev/docs/agents/memory/in-memory/
- Memory 概要: https://voltagent.dev/docs/agents/memory/overview/
- Operation Context: https://voltagent.dev/docs/agents/context/
- Next.js 連携: https://voltagent.dev/docs/integrations/nextjs/
- チュートリアル: https://voltagent.dev/tutorial/memory/
- UI モック: `DOCS/document.html`, `DOCS/result.html`

本 README は本プロダクト単体で開発・運用が可能になるよう、依存関係、システム構成、API 仕様、運用上の注意点を網羅的に記載しています。
