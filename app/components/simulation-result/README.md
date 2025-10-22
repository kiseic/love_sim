# SimulationResult Component

恋愛シミュレーションの結果を表示するコンポーネントです。HTMLファイルの`result.html`を参考にして作成されました。

## 機能

- 🎉 達成率の表示
- 💕 関係性の変化表示（例：友達 → 恋人同士）
- 👥 プレイヤーと対象のキャラクター表示
- 🌸 桜の花びらアニメーション
- 📱 結果のシェア機能（Twitter、LINE、クリップボード）
- 🔄 続きのストーリー開始
- 🎮 新しいゲーム開始
- 🎨 美しいアニメーションとトランジション

## ページ遷移の流れ

```
ホームページ (/)
    ↓
シミュレーションページ (/simulation)
    ↓ (回答選択)
解説ページ (/simulation-explanation)
    ↓ (次のシナリオまたは結果)
シミュレーションページ (/simulation) または 結果ページ (/simulation-result)
    ↓ (結果ページから)
    ├─ 続きをする → シミュレーションページ (/simulation)
    ├─ もう一度プレイ → ホームページ (/)
    └─ 結果をシェア → シェア機能実行
```

### 遷移の詳細

1. **ホームページ** → **シミュレーションページ**
   - ユーザーがシミュレーションを開始

2. **シミュレーションページ** → **解説ページ**
   - 回答選択後、選択内容の解説を表示

3. **解説ページ** → **次のシナリオまたは結果ページ**
   - 最後のシナリオでない場合：次のシナリオに進む
   - 最後のシナリオの場合：結果ページに進む

4. **結果ページ** → **各ページ**
   - 「続きをする」：シミュレーションページに戻る
   - 「もう一度プレイ」：ホームページに戻る
   - 「結果をシェア」：シェア機能を実行

## 使用方法

```tsx
import { SimulationResult } from '@/app/components/simulation-result';

export default function MyPage() {
  const handleContinue = () => {
    // 続きのストーリーを開始する処理
  };

  const handlePlayAgain = () => {
    // 新しいゲームを開始する処理
  };

  const handleShare = () => {
    // 結果をシェアする処理
  };

  return (
    <SimulationResult
      achievementRate={85}
      beforeRelation="友達"
      afterRelation="恋人同士"
      playerImage="/path/to/player.jpg"
      targetImage="/path/to/target.jpg"
      backgroundVideo="/path/to/video.mp4"
      onContinue={handleContinue}
      onPlayAgain={handlePlayAgain}
      onShare={handleShare}
    />
  );
}
```

## Props

| プロパティ | 型 | デフォルト値 | 説明 |
|-----------|----|-------------|------|
| `achievementRate` | `number` | `85` | 達成率（パーセント） |
| `beforeRelation` | `string` | `'友達'` | これまでの関係性 |
| `afterRelation` | `string` | `'恋人同士'` | 新しい関係性 |
| `playerImage` | `string` | `undefined` | プレイヤーの画像URL |
| `targetImage` | `string` | `undefined` | 対象の画像URL |
| `backgroundVideo` | `string` | `undefined` | 背景動画のURL |
| `onContinue` | `() => void` | `undefined` | 続きをするボタンのクリックハンドラー |
| `onPlayAgain` | `() => void` | `undefined` | もう一度プレイボタンのクリックハンドラー |
| `onShare` | `() => void` | `undefined` | 結果をシェアボタンのクリックハンドラー |

## 特徴

### アニメーション
- 桜の花びらが定期的に生成され、画面を舞い散る
- カードが下からスライドインするアニメーション
- ボタンのホバーエフェクトとトランジション
- 関係性の変化表示のパルスアニメーション

### レスポンシブデザイン
- モバイルデバイスにも対応
- フレックスボックスレイアウトで柔軟な配置

### アクセシビリティ
- セマンティックなHTML構造
- 適切なコントラスト比
- キーボードナビゲーション対応

### 状態管理
- URLパラメータを使用したシナリオ進行状況の管理
- 適切なページ遷移とユーザー体験の提供

## カスタマイズ

コンポーネントのスタイルは、Tailwind CSSクラスを使用してカスタマイズできます。また、CSS変数を使用して色やサイズを調整することも可能です。

## 依存関係

- React 18+
- Next.js 13+ (App Router)
- Tailwind CSS
- 既存のUIコンポーネント（Button、Card、Badge）
