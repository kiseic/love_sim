# Simulation Display Components

恋愛シミュレーション画面を構成するReactコンポーネント群です。

## コンポーネント一覧

### SimulationDisplay
メインのシミュレーション画面コンポーネントです。

**Props:**
- `initialScenario`: 初期シナリオ（オプション）
- `onAnswerSelected`: 答えが選択された時のコールバック関数（オプション）

**機能:**
- 4つの選択肢ボタンの表示
- 自由記述入力欄
- 確定ボタン
- 選択された答えの表示
- リセット機能

### ChoiceButton
四隅に配置される選択肢ボタンコンポーネントです。

**Props:**
- `text`: ボタンのテキスト
- `position`: ボタンの位置（0: 左上, 1: 右上, 2: 左下, 3: 右下）
- `isSelected`: 選択されているかどうか
- `onClick`: クリック時のコールバック関数
- `isVisible`: 表示されているかどうか

**特徴:**
- 吹き出しスタイルのデザイン
- 浮遊アニメーション効果
- レスポンシブ対応

### QuestionText
画面下部に表示される質問テキストコンポーネントです。

**Props:**
- `text`: 表示するテキスト
- `isVisible`: 表示されているかどうか

### SelectedAnswer
選択された答えを表示するコンポーネントです。

**Props:**
- `answer`: 選択された答えのテキスト
- `onReset`: リセット時のコールバック関数

**特徴:**
- ハートビートアニメーション効果
- リセットボタン付き

## 使用方法

```tsx
import { SimulationDisplay, Scenario } from '@/app/components/simulation-display';

const scenario: Scenario = {
  character: { name: "美咲", avatar: "👩" },
  text: "「今度の休日、一緒にどこか行かない？」美咲があなたに提案してきました。",
  options: [
    "「いいね！どこに行きたい？」と積極的に応える",
    "「うーん、ちょっと忙しいかも...」と曖昧に答える", 
    "「君の好きな場所に付き合うよ」と優しく答える",
    "「映画でも見に行こうか」と具体的な提案をする"
  ]
};

export default function MyPage() {
  const handleAnswerSelected = (answer: string) => {
    console.log('選択された答え:', answer);
  };

  return (
    <SimulationDisplay
      initialScenario={scenario}
      onAnswerSelected={handleAnswerSelected}
    />
  );
}
```

## スタイリング

Tailwind CSSを使用してスタイリングされています。カスタムアニメーションも含まれています：

- `floatAnimation`: 選択肢ボタンの浮遊効果
- `heartbeatPulse`: 選択された答えのハートビート効果

## レスポンシブ対応

- モバイル: 縦長レイアウト（9:16）
- デスクトップ: 横長レイアウト（16:9）
- 各要素のサイズと位置が画面サイズに応じて調整されます
