'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { storageUtils, ResultData } from '@/app/lib/utils/storage';

// 古い形式のスコアデータとの互換性のための型定義
interface LegacySkillScores {
  思いやり: number;
  観察力: number;
  コミュニケーション: number;
  面白さ: number;
  積極性: number;
  // 古い形式のフィールド
  感情理解?: number;
  判断力?: number;
}

interface SimulationResultProps {
  resultData?: ResultData;
  loveType?: string;
  loveTypeDescription?: string;
  loveScore?: number;
  skillScores?: {
    思いやり: number;
    観察力: number;
    コミュニケーション: number;
    面白さ: number;
    積極性: number;
  };
  strengths?: string[];
  improvements?: string[];
  compatibility?: {
    type: string;
    description: string;
  };
  onContinue?: () => void;
  onPlayAgain?: () => void;
  onShare?: () => void;
}

interface RadarData {
  思いやり: number;
  観察力: number;
  コミュニケーション: number;
  積極性: number;
  面白さ: number;
}

export const SimulationResult: React.FC<SimulationResultProps> = ({
  resultData: propResultData,
  loveType = '情熱的なロマンチストタイプ',
  loveTypeDescription = 'あなたは恋愛に対して情熱的で、相手を大切にする優しい心を持っています。新しい体験を求める冒険心と、深く考える知性のバランスが取れた魅力的な人です。',
  loveScore = 82.2,
  skillScores = {
    思いやり: 85,
    観察力: 92,
    コミュニケーション: 68,
    面白さ: 78,
    積極性: 88
  },
  strengths = ['情熱的な性格を活かして、積極的にコミュニケーションを取りましょう。あなたの優しさは彼にとって大きな魅力です。'],
  improvements = ['安定性を少し高めることで、彼により安心感を与えられます。約束を守り、一貫した行動を心がけて。'],
  compatibility = {
    type: '知的な安定型タイプ',
    description: '知的で落ち着いた男性や、あなたの情熱を理解してくれる優しい人。お互いを高め合える関係を築ける相手が理想的です。'
  },
  onContinue,
  onPlayAgain,
  onShare
}) => {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<'result' | 'fullBackground' | 'choice'>('result');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [showNewRomanceModal, setShowNewRomanceModal] = useState(false);
  const [showRomanceSettings, setShowRomanceSettings] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [showContinueRomancePrep, setShowContinueRomancePrep] = useState(false);
  const [loadedResultData, setLoadedResultData] = useState<ResultData | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // sessionStorageからresultDataを読み込む
  useEffect(() => {
    const storedResultData = storageUtils.getResultData();
    if (storedResultData) {
      // 古い形式のデータを新しい形式に変換
      const legacyScores = storedResultData.scores as LegacySkillScores;
      const convertedData = {
        ...storedResultData,
        scores: {
          思いやり: legacyScores.思いやり,
          観察力: legacyScores.観察力,
          コミュニケーション: legacyScores.コミュニケーション,
          積極性: legacyScores.感情理解 || legacyScores.積極性,
          面白さ: legacyScores.判断力 || legacyScores.面白さ,
        }
      };
      setLoadedResultData(convertedData);
      console.log('[SimulationResult] Loaded and converted result data from sessionStorage');
    }
  }, []);

  // resultDataの優先順位: propResultData > loadedResultData > デフォルト値
  const resultData = propResultData || loadedResultData;
  
  // resultDataから値を取得、なければデフォルト値を使用
  const finalSkillScores = resultData?.scores || skillScores;
  const finalLoveType = resultData?.loveType?.title || loveType;
  const finalLoveTypeDescription = resultData?.loveType?.description || loveTypeDescription;
  const finalStrengths = resultData?.growthTips?.strengthAdvice ? [resultData.growthTips.strengthAdvice] : strengths;
  const finalImprovements = resultData?.growthTips?.improvementAdvice ? [resultData.growthTips.improvementAdvice] : improvements;
  const finalCompatibility = resultData?.compatibility || compatibility;
  
  // 恋愛偏差値を計算（5つのスコアの平均）
  const finalLoveScore = resultData ? 
    Math.round((finalSkillScores.思いやり + finalSkillScores.観察力 + finalSkillScores.コミュニケーション + finalSkillScores.面白さ + finalSkillScores.積極性) / 5) : 
    loveScore;

  // レーダーチャートのデータ
  const radarData: RadarData = {
    思いやり: finalSkillScores.思いやり,
    観察力: finalSkillScores.観察力,
    コミュニケーション: finalSkillScores.コミュニケーション,
    積極性: finalSkillScores.積極性,
    面白さ: finalSkillScores.面白さ
  };

  // レーダーチャートを描画
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const labels = ["思いやり", "観察力", "コミュニケーション", "積極性", "面白さ"];
    const center = { x: 450, y: 450 };
    const outerR = 320;
    const startDeg = -90;
    const stepDeg = 72;
    const gridRings = 5;

    const deg2rad = (deg: number) => deg * Math.PI / 180;

    const getAxisPoint = (axisIndex: number, value: number) => {
      const deg = startDeg + axisIndex * stepDeg;
      const rad = deg2rad(deg);
      const r = (value / 100) * outerR;
      return {
        x: center.x + r * Math.cos(rad),
        y: center.y + r * Math.sin(rad)
      };
    };

    // SVGをクリア
    svg.innerHTML = `
      <defs>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="dataGradient" cx="50%" cy="50%" r="60%">
          <stop offset="0%" style="stop-color:#ff6b9d;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#ff6b9d;stop-opacity:0.2" />
        </radialGradient>
      </defs>
    `;

    // グリッド円を描画
    for (let i = 1; i <= gridRings; i++) {
      const r = (i / gridRings) * outerR;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', center.x.toString());
      circle.setAttribute('cy', center.y.toString());
      circle.setAttribute('r', r.toString());
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', 'rgba(255,255,255,0.3)');
      circle.setAttribute('stroke-width', '2');
      svg.appendChild(circle);
    }

    // 軸線を描画
    labels.forEach((label, i) => {
      const deg = startDeg + i * stepDeg;
      const rad = deg2rad(deg);
      const endX = center.x + outerR * Math.cos(rad);
      const endY = center.y + outerR * Math.sin(rad);
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', center.x.toString());
      line.setAttribute('y1', center.y.toString());
      line.setAttribute('x2', endX.toString());
      line.setAttribute('y2', endY.toString());
      line.setAttribute('stroke', 'rgba(255,255,255,0.4)');
      line.setAttribute('stroke-width', '2');
      svg.appendChild(line);
    });

    // データポリゴンを描画
    const points = labels.map((label, i) => {
      const point = getAxisPoint(i, radarData[label as keyof RadarData]);
      return `${point.x},${point.y}`;
    }).join(' ');

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points);
    polygon.setAttribute('fill', 'url(#dataGradient)');
    polygon.setAttribute('stroke', '#ff6b9d');
    polygon.setAttribute('stroke-width', '3');
    polygon.setAttribute('filter', 'url(#softGlow)');
    polygon.classList.add('pentagon-path');
    svg.appendChild(polygon);

    // データポイントを描画
    labels.forEach((label, i) => {
      const point = getAxisPoint(i, radarData[label as keyof RadarData]);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', point.x.toString());
      circle.setAttribute('cy', point.y.toString());
      circle.setAttribute('r', '8');
      circle.setAttribute('fill', '#ff6b9d');
      circle.setAttribute('stroke', 'white');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('filter', 'url(#softGlow)');
      svg.appendChild(circle);
    });

    // 軸ラベルを描画
    labels.forEach((label, i) => {
      const deg = startDeg + i * stepDeg;
      const rad = deg2rad(deg);
      const labelR = outerR + 50;
      const labelX = center.x + labelR * Math.cos(rad);
      const labelY = center.y + labelR * Math.sin(rad);
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', labelX.toString());
      text.setAttribute('y', (labelY + 8).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'white');
      text.setAttribute('font-size', '28');
      text.setAttribute('font-weight', '600');
      text.style.textShadow = '2px 2px 4px rgba(0,0,0,0.7)';
      text.textContent = label;
      svg.appendChild(text);
    });

    // 数値バッジを描画
    labels.forEach((label, i) => {
      const deg = startDeg + i * stepDeg;
      const rad = deg2rad(deg);
      const badgeR = outerR + 100;
      const badgeX = center.x + badgeR * Math.cos(rad);
      const badgeY = center.y + badgeR * Math.sin(rad);
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', badgeX.toString());
      circle.setAttribute('cy', badgeY.toString());
      circle.setAttribute('r', '24');
      circle.setAttribute('fill', 'rgba(255,107,157,0.9)');
      circle.setAttribute('stroke', 'white');
      circle.setAttribute('stroke-width', '2');
      svg.appendChild(circle);
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', badgeX.toString());
      text.setAttribute('y', (badgeY + 8).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'white');
      text.setAttribute('font-size', '24');
      text.setAttribute('font-weight', 'bold');
      text.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)';
      text.textContent = radarData[label as keyof RadarData].toString();
      svg.appendChild(text);
    });

    // 中心点
    const centerPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerPoint.setAttribute('cx', center.x.toString());
    centerPoint.setAttribute('cy', center.y.toString());
    centerPoint.setAttribute('r', '6');
    centerPoint.setAttribute('fill', '#ff6b9d');
    centerPoint.setAttribute('stroke', 'white');
    centerPoint.setAttribute('stroke-width', '2');
    svg.appendChild(centerPoint);
  }, [radarData]);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleContinue = () => {
    setShowContinueModal(true);
  };

  const handlePlayAgain = () => {
    setShowNewRomanceModal(true);
  };

  const shareToTwitter = () => {
    const text = `私の恋愛タイプは「${finalLoveType}」でした！✨`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    setShowShareModal(false);
  };

  const shareToLine = () => {
    const text = `私の恋愛タイプは「${finalLoveType}」でした！✨`;
    const url = window.location.href;
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    setShowShareModal(false);
  };

  const copyToClipboard = async () => {
    const text = `私の恋愛タイプは「${finalLoveType}」でした！✨ ${window.location.href}`;
    try {
      await navigator.clipboard.writeText(text);
      alert('リンクがクリップボードにコピーされました！');
      setShowShareModal(false);
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
    }
  };

  const continueCurrentRomance = () => {
    setShowContinueModal(false);
    setShowRomanceSettings(true);
  };

  const startNewRomance = () => {
    setShowNewRomanceModal(false);
    // 新しい恋愛を始める場合はsessionStorageをクリア
    storageUtils.clearResultData();
    // ルートページに遷移
    router.push('/');
  };

  const startSimulation = () => {
    setShowRomanceSettings(false);
    setShowContinueRomancePrep(true);
    setTimeout(() => {
      setShowContinueRomancePrep(false);
      alert('恋愛の発展準備が完了しました！\n学んだTIPsを活かして素敵な関係を築いてください。');
    }, 3000);
  };

  return (
    <div className="min-h-screen relative">
      {/* 背景 - goal_ui.htmlと同じスタイル */}
      <div 
        className="fixed top-0 left-0 w-full h-full" 
        style={{ 
          zIndex: -10,
          background: 'linear-gradient(to bottom right, #f472b6, #a855f7, #4f46e5)',
          minHeight: '100vh',
          minWidth: '100vw'
        }}
      >
        {/* 動画の代わりにアニメーション背景を使用 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-pink-300 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-300 rounded-full animate-ping"></div>
          <div className="absolute bottom-40 right-1/3 w-24 h-24 bg-indigo-300 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* 結果画面（第1部） */}
      {currentScreen === 'result' && (
        <div
          className="min-h-screen flex items-center justify-center p-4 relative overflow-y-auto z-10" 
          style={{
            background: 'rgba(0, 0, 0, 0.7)', 
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
          {/* 次に進むボタン（右下に配置） */}
          <button 
            onClick={() => setCurrentScreen('fullBackground')}
            className="fixed bottom-6 right-6 bg-white bg-opacity-20 hover:bg-opacity-30 text-black text-sm py-2 px-4 rounded-full transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30"
          >
            次に進む →
          </button>
          
          <div className="text-center max-w-2xl mx-auto py-8">
            {/* タイトル */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 animate-fade-in">
              あなたの恋愛タイプ
            </h1>
            
            {/* 精密な5軸レーダーチャート */}
            <div className="flex justify-center mb-8">
              <div className="w-96 h-96">
                <svg 
                  ref={svgRef}
                  viewBox="0 0 900 900" 
                  width="100%" 
                  height="100%" 
                  role="img" 
                  aria-label="Radar chart"
                />
                  </div>
                </div>
                
            {/* 恋愛偏差値 */}
            <div className="relative rounded-3xl p-8 mb-8 overflow-hidden">
              {/* 背景の装飾 */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 opacity-20"></div>
              
              {/* コンテンツ */}
              <div className="relative z-10 text-center">
                <h3 className="text-white text-xl font-bold mb-3">恋愛偏差値</h3>
                <div className="relative">
                  <div className="text-white text-5xl font-bold mb-2 drop-shadow-lg">{finalLoveScore}</div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
                <p className="text-white text-sm font-medium">
                  平均より高い恋愛力を持っています！
                </p>
              </div>
            </div>
            
            {/* 結果テキスト */}
            <div className="bg-purple-800 bg-opacity-50 rounded-2xl p-6 mb-8 backdrop-blur-sm">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {finalLoveType}
              </h2>
              <p className="text-white text-lg leading-relaxed mb-6">
                {finalLoveTypeDescription}
              </p>
              
              {/* 関係発展のアドバイス */}
              <div className="border-t border-white border-opacity-30 pt-6">
                <h3 className="text-xl font-bold text-white mb-4">恋愛偏差値を上げるために</h3>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div className="bg-purple-900 bg-opacity-30 rounded-lg p-4">
                    <h4 className="font-bold text-pink-400 mb-2">🌟 あなたの強みを活かそう</h4>
                    <p className="text-white text-sm">
                      {finalStrengths[0]}
                    </p>
                  </div>
                  <div className="bg-purple-900 bg-opacity-30 rounded-lg p-4">
                    <h4 className="font-bold text-purple-400 mb-2">🎯 改善ポイント</h4>
                    <p className="text-white text-sm">
                      {finalImprovements[0]}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 bg-opacity-20 rounded-lg p-4 border border-blue-300 border-opacity-40 shadow-lg">
                    <h4 className="font-bold text-white mb-2">💖 あなたと相性のいいタイプ</h4>
                    <p className="text-white text-sm mb-4">
                      {finalCompatibility.description}
                    </p>
                    <div className="bg-blue-500 bg-opacity-30 rounded-lg p-3 border border-blue-300 border-opacity-50">
                                              <p className="text-white text-lg font-bold text-center">
                          {finalCompatibility.type}
                        </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* シェアボタン */}
            <div className="flex justify-center">
              <button 
                onClick={handleShare}
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                📱 結果をシェア
              </button>
                </div>
              </div>
              </div>
      )}

      {/* 全画面背景表示（第2部） */}
      {currentScreen === 'fullBackground' && (
        <div className="min-h-screen relative z-10">
          {/* 画面下部のボタン */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-between px-6">
            <button 
              onClick={() => setCurrentScreen('result')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-black text-sm py-2 px-4 rounded-full transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30"
            >
              ← 結果に戻る
            </button>
            <button 
              onClick={() => setCurrentScreen('choice')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-black text-sm py-2 px-4 rounded-full transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30"
            >
              次に進む →
            </button>
              </div>
            </div>
      )}

      {/* 選択画面（第3部） */}
      {currentScreen === 'choice' && (
        <div 
          className="min-h-screen flex items-center justify-center p-4 relative overflow-y-auto z-10" 
          style={{ 
            background: 'rgba(0, 0, 0, 0.7)', 
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
          <div className="text-center max-w-4xl mx-auto py-8">
            {/* タイトル */}
            <h1 className="text-xl md:text-3xl font-bold text-white mb-12 animate-fade-in">
              あなたの恋愛の続きを選んでください
            </h1>
            
            {/* 選択肢 */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* 同じ恋愛を続ける */}
              <div 
                //TODO: 一旦無効化
                //onClick={handleContinue}
                className="bg-white bg-opacity-20 rounded-3xl p-8 backdrop-blur-sm border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300 cursor-pointer transform hover:scale-105"
              >
                <div className="text-6xl mb-6">💕</div>
                <h3 className="text-2xl font-bold text-black mb-4">この恋愛を発展させる</h3>
                <p className="text-black opacity-90 text-lg leading-relaxed">
                  新しい目標を再設定して、相手との関係をさらに深めていきましょう。
                </p>
              </div>
              
              {/* 新しい恋愛を始める */}
              <div 
                onClick={handlePlayAgain}
                className="bg-white bg-opacity-20 rounded-3xl p-8 backdrop-blur-sm border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300 cursor-pointer transform hover:scale-105"
              >
                <div className="text-6xl mb-6">✨</div>
                <h3 className="text-2xl font-bold text-black mb-4">新しい恋愛を始める</h3>
                <p className="text-black opacity-90 text-lg leading-relaxed">
                  プロフィールを再設定して、新しい恋愛を体験しましょう。
                </p>
              </div>
            </div>
            
            {/* 戻るボタン */}
            <button 
              onClick={() => setCurrentScreen('fullBackground')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-black text-sm py-2 px-4 rounded-full transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30"
            >
              ← 前に戻る
            </button>
          </div>
      </div>
      )}

      {/* シェアモーダル */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border border-white border-opacity-30">
            <div className="text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-2xl font-bold text-black mb-4">診断結果をシェア</h3>
              <p className="text-black opacity-90 mb-6 leading-relaxed">
                あなたの恋愛タイプ「{finalLoveType}」を<br />
                友達にもシェアしてみませんか？
              </p>
              
              <div className="space-y-3 mb-6">
                <button 
                  onClick={shareToTwitter}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 bg-opacity-80 hover:bg-opacity-100 text-white py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    🐦 <span>Twitterでシェア</span>
                  </span>
                </button>
                <button 
                  onClick={shareToLine}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 bg-opacity-80 hover:bg-opacity-100 text-white py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    💬 <span>LINEでシェア</span>
                  </span>
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 bg-opacity-80 hover:bg-opacity-100 text-white py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    📋 <span>リンクをコピー</span>
                  </span>
                </button>
              </div>
              
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-black opacity-70 hover:opacity-100 transition-opacity text-sm"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 関係継続モーダル */}
      {showContinueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full border border-white border-opacity-30">
            <div className="text-center">
              <div className="text-4xl mb-4">💕</div>
              <h3 className="text-2xl font-bold text-black mb-4">関係を発展させる</h3>
              <p className="text-black opacity-90 mb-6 leading-relaxed">
                素晴らしい選択です！<br />
                学んだ恋愛TIPsを生かして、<br />
                ストーリーを進めていきましょう。
              </p>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={continueCurrentRomance}
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  続ける
                </button>
                <button 
                  onClick={() => setShowContinueModal(false)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-black py-3 px-6 rounded-full transition-all duration-300"
                >
                  戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新しい恋愛モーダル */}
      {showNewRomanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full border border-white border-opacity-30">
            <div className="text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-2xl font-bold text-black mb-4">新しい出会いを探す</h3>
              <p className="text-black opacity-90 mb-6 leading-relaxed">
                新しい冒険の始まりですね！<br />
                違うタイプの相手との恋愛を体験して、<br />
                新たな恋愛TIPsを学ぼう！
              </p>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={startNewRomance}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  新しく始める
                </button>
                <button 
                  onClick={() => setShowNewRomanceModal(false)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-black py-3 px-6 rounded-full transition-all duration-300"
                >
                  戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 恋愛発展準備画面 */}
      {showContinueRomancePrep && (
        <div className="fixed inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center z-50">
          <div className="text-center px-4">
            <h1 className="text-2xl md:text-4xl font-bold text-black animate-pulse">
              恋愛を発展させる準備をしています...
            </h1>
          </div>
        </div>
      )}

      {/* 恋愛速度設定画面 */}
      {showRomanceSettings && (
        <div className="fixed inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-purple-600 flex items-center justify-center z-50 p-4">
          <div className="text-center max-w-lg w-full">
            {/* タイトル */}
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-12">
              シミュレーション追加設定
            </h1>
            
            {/* 設定フォーム */}
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-30 mb-8">
              {/* 目標設定 */}
              <div className="mb-8">
                <label className="block text-black text-xl font-bold mb-4">目標</label>
                <select className="w-full bg-white bg-opacity-90 text-gray-800 text-lg py-4 px-6 rounded-2xl border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-pink-300 font-medium transition-all duration-300">
                  <option value="" disabled selected>選択してください</option>
                  <option value="友達になる">友達になる</option>
                  <option value="デートする">デートする</option>
                  <option value="告白する">告白する</option>
                  <option value="恋人になる">恋人になる</option>
                  <option value="関係を深める">関係を深める</option>
                  <option value="結婚を考える">結婚を考える</option>
                </select>
              </div>
              
              {/* 質問数設定 */}
              <div className="mb-6">
                <label className="block text-black text-xl font-bold mb-4">質問数</label>
                <select className="w-full bg-white bg-opacity-90 text-gray-800 text-lg py-4 px-6 rounded-2xl border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-pink-300 font-medium transition-all duration-300">
                  <option value="" disabled selected>選択してください</option>
                  <option value="5問（短時間）">5問（短時間）</option>
                  <option value="10問（標準）">10問（標準）</option>
                  <option value="15問（詳細）">15問（詳細）</option>
                  <option value="20問（完全版）">20問（完全版）</option>
                </select>
              </div>
            </div>
            
            {/* ボタン */}
            <div className="flex gap-6 justify-center">
              <button 
                onClick={() => setShowRomanceSettings(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
              >
                リセット
              </button>
              <button 
                onClick={startSimulation}
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                シミュレーション開始 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
