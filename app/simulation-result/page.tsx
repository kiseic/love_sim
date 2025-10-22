'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SimulationResult } from '@/app/components/simulation-result';

export default function SimulationResultPage() {
  const router = useRouter();

  const handlePlayAgain = () => {
    console.log('新しいゲームを開始します');
    // 最初の画面（ホームページ）に戻る
    router.push('/');
  };

  const handleShare = () => {
    console.log('結果をシェアします');
    // シェア機能はSimulationResultコンポーネント内で実装済み
    // ここでは追加の処理が必要な場合のみ実装
  };

  const handleContinue = () => {
    console.log('恋愛を続けます');
    // 恋愛を続ける処理
  };

  return (
    <SimulationResult
      onPlayAgain={handlePlayAgain}
      onShare={handleShare}
      onContinue={handleContinue}
    />
  );
}
