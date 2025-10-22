# 問題進行状況管理ストア

このストアは、問題の進行状況を管理し、適切なタイミングでループから抜けて結果表示に進むための状態管理を提供します。

## 機能

- 現在の問題番号の管理
- 問題表示→解説→次の問題/結果表示の流れ制御
- 最後の問題かどうかの判定
- ボタンテキストの動的変更

## 使用方法

### 1. ストアの初期化

```typescript
import { useProblemStore } from '../store/problemStore';

// 問題数を設定して初期化
const { initializeProgress } = useProblemStore();
initializeProgress(2); // 2問の問題セット
```

### 2. 進行状況の取得

```typescript
const { progress } = useProblemStore();

// 現在の状態を確認
console.log(`問題 ${progress.currentQuestionIndex + 1} / ${progress.totalQuestions}`);
console.log(`現在のフェーズ: ${progress.currentPhase}`);
console.log(`最後の問題: ${progress.isLastQuestion}`);
```

### 3. フェーズの進行

```typescript
const { nextPhase } = useProblemStore();

// ボタンクリック時に次のフェーズへ
const handleNextClick = () => {
  nextPhase();
};
```

### 4. ボタンテキストの動的表示

```typescript
import { getButtonText, getQuestionNumberText } from '../utils/problemNavigation';

const { progress } = useProblemStore();

// ボタンテキストを取得
const buttonText = getButtonText(progress);

// 問題番号テキストを取得
const questionNumberText = getQuestionNumberText(progress);
```

## フェーズの流れ

1. **問題表示** (`problem`)
   - ボタン: 「次へ」
   - クリック時: 解説フェーズへ

2. **解説** (`explanation`)
   - 最後の問題の場合: ボタン「結果を見る」→ 完了フェーズへ
   - 途中の問題の場合: ボタン「次の問題へ」→ 次の問題の問題表示フェーズへ

3. **完了** (`completed`)
   - 結果表示画面へ

## 例：2問の問題セット

```
問題1表示 → 問題1解説 → 問題2表示 → 問題2解説 → 結果表示
```

## 実際の実装例

### プロフィール設定画面での初期化

```typescript
// LoveSimulationForm.tsx
const { initializeProgress } = useProblemStore();

const startSimulation = () => {
  // プロフィールデータをstoreに保存
  setStoreProfileData(profileData);
  
  // 問題数を問題ストアに設定
  const questionCount = parseInt(profileData.numberOfQuestions);
  if (questionCount > 0) {
    initializeProgress(questionCount);
  }
  
  // シミュレーション画面に遷移
  router.push('/simulation');
};
```

### シミュレーション画面での使用

```typescript
// simulation/page.tsx
const { progress, nextPhase } = useProblemStore();

const handleAnswerSelected = (answer: string) => {
  // 問題ストアの次のフェーズに進む
  nextPhase();
  
  // 解説ページに遷移（URLパラメータは不要）
  router.push('/simulation-explanation');
};
```

### 解説画面でのボタン制御

```typescript
// simulation-explanation/page.tsx
const { progress, nextPhase } = useProblemStore();

const handleNext = () => {
  // 問題ストアの次のフェーズに進む
  nextPhase();
  
  // 現在のフェーズに基づいて適切なページに遷移
  if (progress.currentPhase === 'completed') {
    router.push('/simulation-result'); // 結果ページへ
  } else {
    router.push('/simulation'); // 次の問題へ
  }
};

// ボタンテキストを動的に表示
<Button onClick={handleNext}>
  {getButtonText(progress)} {/* "次へ" → "次の問題へ" → "結果を見る" */}
</Button>
```

## 利用可能なメソッド

- `initializeProgress(totalQuestions: number)`: 問題数を設定して初期化
- `nextPhase()`: 次のフェーズに進む（問題→解説→次の問題/完了）
- `nextQuestion()`: 次の問題に進む（内部で使用）
- `resetProgress()`: 進行状況をリセット
- `progress`: 現在の進行状況を取得

## 注意事項

- `currentQuestionIndex` は0から開始します
- `totalQuestions` は実際の問題数を設定してください
- ストアは問題セット開始時に `initializeProgress()` で初期化してください
- 問題セット終了時は `resetProgress()` でリセットしてください
- プロフィール設定で選択された問題数が自動的に問題ストアに反映されます
- 解説ページでは固定のテキストが表示され、URLパラメータは不要です
