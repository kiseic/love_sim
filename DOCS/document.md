```// プロフィール情報
interface ProfileData {
  my: {
    age: string;
    gender: string;
    occupation: string;
    traits: string;
    preference: string;
    background: string;
    detailedDescription: string;
  };
  partner: {
    age: string;
    gender: string;
    occupation: string;
    traits: string;
    preference: string;
    background: string;
    detailedDescription: string;
  };
  relationship: string;
  stage: string;
  goal: string;
  numberOfQuestions: string;
}
```

## 画面遷移
```mermaid
graph TD
    A["/"] --> B["/simulation"]
    B --> C["/simulation-explanation"]
    C --> D{最後？}
    D -->|いいえ| B
    D -->|はい| E["/simulation-result"]
    E --> F{選択}
    F -->|新恋愛| A
    F -->|シェア| H["シェア機能"]
```