'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Button, 
  Card, 
  Input, 
  Select, 
  Textarea, 
  AvatarUpload, 
  PresetCard, 
  Modal 
} from '../ui';
import { PRESET_DATA, PRESET_VALUES, type PresetData } from '../../lib/constants/presets';
import { useProfileStore } from '../../lib/store/profileStore';
import { useProblemStore } from '../../lib/store/problemStore';
import { ProfileData } from '../../lib/types/store';
import { Problem } from '../../lib/types/problem';





// ProfileData interface is now imported from profileStore

export const LoveSimulationForm: React.FC = () => {
  const router = useRouter();
  const { setProfileData: setStoreProfileData, setIsGenerating, isGenerating } = useProfileStore();
  const { initializeProgress, setProblems } = useProblemStore();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    my: {
      age: '',
      gender: '',
      occupation: '',
      traits: '',
      preference: '',
      background: '',
      detailedDescription: ''
    },
    partner: {
      age: '',
      gender: '',
      occupation: '',
      traits: '',
      preference: '',
      background: '',
      detailedDescription: ''
    },
    relationship: '',
    stage: '',
    goal: '',
    numberOfQuestions: ''
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showPremiumInfo, setShowPremiumInfo] = useState(false);


  const handleInputChange = (section: 'my' | 'partner', field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = PRESET_VALUES[presetId];
    if (preset) {
      setProfileData(prev => ({
        ...prev,
        my: { ...prev.my, ...preset.my },
        partner: { ...prev.partner, ...preset.partner },
        relationship: preset.relationship,
        stage: preset.stage,
        goal: preset.goal,
        numberOfQuestions: preset.numberOfQuestions
      }));
    }
  };

  const resetForm = () => {
    setProfileData({
      my: {
        age: '',
        gender: '',
        occupation: '',
        traits: '',
        preference: '',
        background: '',
        detailedDescription: ''
      },
      partner: {
        age: '',
        gender: '',
        occupation: '',
        traits: '',
        preference: '',
        background: '',
        detailedDescription: ''
      },
      relationship: '',
      stage: '',
      goal: '',
      numberOfQuestions: ''
    });
  };

  const startSimulation = async () => {
    try {
      // プロフィールデータをstoreに保存
      setStoreProfileData(profileData);
      
      // 問題数を問題ストアに設定
      const questionCount = parseInt(profileData.numberOfQuestions);
      if (questionCount > 0) {
        initializeProgress(questionCount);
      }
      
      // 問題生成開始の状態に設定
      setIsGenerating(true);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      console.log('[debug][LoveSimulationForm] API Response:', response);
      
      if (!response.ok) {
        throw new Error("問題生成に失敗しました");
      }
      
      // レスポンスをJSONとして解析
      const responseData = await response.json();
      // 生成APIのレスポンス全体を評価API向けのコンテキストとして保存
      try {
        sessionStorage.setItem('generateResponse', JSON.stringify(responseData));
      } catch (e) {
        console.warn('[debug][LoveSimulationForm] Failed to store generateResponse in sessionStorage:', e);
      }
      console.log('[debug][LoveSimulationForm] API Response:', responseData);
      
      // 生成された問題を確認
      if (responseData.problems && Array.isArray(responseData.problems)) {
        console.log('[debug][LoveSimulationForm] Generated problems:', responseData.problems.length);
        responseData.problems.forEach((problem: Problem, index: number) => {
          console.log(`[debug][LoveSimulationForm] Problem ${index + 1}:`);
          console.log(`  Question: ${problem.question}`);
          console.log(`  Choices:`, problem.choices);
          if (problem.choices) {
            console.log(`  Choice A: ${problem.choices.a}`);
            console.log(`  Choice B: ${problem.choices.b}`);
            console.log(`  Choice C: ${problem.choices.c}`);
            console.log(`  Choice D: ${problem.choices.d}`);
          }
        });
        
        // 生成された問題をストアに保存
        setProblems(responseData.problems);
        console.log('[debug][LoveSimulationForm] Problems stored in store:', responseData.problems);
        console.log('[debug][LoveSimulationForm] First problem question:', responseData.problems[0]?.question);
        console.log('[debug][LoveSimulationForm] First problem choices:', responseData.problems[0]?.choices);
      } else {
        console.warn('[debug][LoveSimulationForm] No problems found in response');
      }
      
      // 生成直後に先頭問題を評価APIへ送って準備（非同期、画面遷移をブロックしない）
      try {
        const first = Array.isArray(responseData.problems) ? responseData.problems[0] : undefined;
        if (first && first.choices) {
          // デフォルトでは A を仮選択として評価にかけ、レスポンスを保存（画面側で参照）
          fetch('/api/evaluate-choice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: first.question,
              choices: first.choices,
              selectedChoice: 'a',
              questionType: 'multiple_choice',
              subject: first.subject || 'love',
              context: responseData,
            }),
          })
            .then(async (res) => {
              try {
                const evalJson = await res.json();
                sessionStorage.setItem('evaluateResponse', JSON.stringify(evalJson));
              } catch (e) {
                console.warn('[debug][LoveSimulationForm] Failed to store evaluateResponse:', e);
              }
            })
            .catch(() => {});
        }
      } catch {}

      // 問題生成が完了したら状態をfalseに戻す
      setIsGenerating(false);
      
      // シミュレーション画面に遷移
      router.push('/simulation');
    } catch (error) {
      console.error('問題生成エラー:', error);
      // エラーが発生した場合も状態をfalseに戻す
      setIsGenerating(false);
      // エラーハンドリング（ユーザーに通知するなど）
      alert('問題生成中にエラーが発生しました。もう一度お試しください。');
    }
  };

  return (
    <div className="gradient-bg min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">💖 プロフィール設定</h1>
            <p className="text-white/80 text-lg">あなたと相手の情報を入力してください</p>
        </div>

        {/* プリセット選択 */}
        <Card className="bg-white rounded-3xl card-shadow p-4 sm:p-6 mb-6 border-none">
          <div className="p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4 text-center">⚡ クイックスタート</h2>
            <p className="text-gray-600 text-center mb-4 sm:mb-6 text-sm sm:text-base">プリセットを選んで簡単に始めることもできます</p>
            
            {/* モバイル用: 横スクロール */}
            <div className="block sm:hidden">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {PRESET_DATA.map((preset: PresetData) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    onClick={handlePresetSelect}
                    variant="mobile"
                    disabled={isGenerating}
                  />
                ))}
              </div>
              <div className="text-center mt-2">
                <p className="text-xs text-gray-500">← 横にスワイプして選択 →</p>
              </div>
            </div>

            {/* デスクトップ用: グリッド表示 */}
            <div className="hidden sm:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {PRESET_DATA.map((preset: PresetData) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  onClick={handlePresetSelect}
                  variant="desktop"
                  disabled={isGenerating}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* メインコンテンツ */}
        <Card className="bg-white rounded-3xl card-shadow p-4 sm:p-6 mb-6 border-none">
          <div className="p-8">
            <form onSubmit={(e) => { e.preventDefault(); startSimulation(); }}>
              {/* 自分のプロフィール */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">1</span>
                  あなたのプロフィール
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* 画像アップロード */}
                  <div className="md:col-span-2 flex justify-center mb-6">
                    <AvatarUpload
                      defaultEmoji="👤"
                      showPremium={true}
                      onImageChange={(file: File | null) => console.log('My image:', file)}
                      disabled={isGenerating}
                    />
                  </div>

                  <Input
                    label="年齢"
                    type="number"
                    min={18}
                    max={99}
                    placeholder="25"
                    value={profileData.my.age}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('my', 'age', e.target.value)}
                    disabled={isGenerating}
                  />

                  <Select
                     label="性別"
                     value={profileData.my.gender}
                     options={[
                       { value: "", label: "選択してください" },
                       { value: "男性", label: "男性" },
                       { value: "女性", label: "女性" },
                       { value: "その他", label: "その他" }
                     ]}
                     onValueChange={(value: string) => handleInputChange('my', 'gender', value)}
                     showEmptyOption={false}
                     disabled={isGenerating}
                  />

                  <Input
                    label="職業"
                    placeholder="会社員"
                    value={profileData.my.occupation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('my', 'occupation', e.target.value)}
                    disabled={isGenerating}
                  />

                  <Input
                    label="性格・特徴"
                    placeholder="優しい、真面目"
                    value={profileData.my.traits}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('my', 'traits', e.target.value)}
                    disabled={isGenerating}
                  />

                  <Input
                    label="好みのタイプ"
                    placeholder="明るい人、話しやすい人"
                    value={profileData.my.preference}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('my', 'preference', e.target.value)}
                    disabled={isGenerating}
                  />

                  <Input
                    label="背景・趣味"
                    placeholder="読書、映画鑑賞"
                    value={profileData.my.background}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('my', 'background', e.target.value)}
                    disabled={isGenerating}
                  />

                  {/* 詳細記述欄 */}
                  <div className="md:col-span-2 mt-4">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">📝 詳細記述（より詳しい情報）</label>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">💎 プレミアム機能</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPremiumInfo(true)}
                            className="text-blue-600 hover:text-blue-800 underline p-0 h-auto"
                          >
                            詳細
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        rows={3}
                        placeholder="例：大学では心理学を専攻しており、人の心理に興味があります..."
                        maxLength={500}
                        showCharacterCount={true}
                        value={profileData.my.detailedDescription}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('my', 'detailedDescription', e.target.value)}
                        disabled={isGenerating}
                      />
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">より詳細な情報でシミュレーションの精度が向上します</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 相手のプロフィール */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">2</span>
                  相手のプロフィール
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* 画像アップロード */}
                  <div className="md:col-span-2 flex justify-center mb-6">
                    <AvatarUpload
                      defaultEmoji="💝"
                      showPremium={true}
                      onImageChange={(file: File | null) => console.log('Partner image:', file)}
                      disabled={isGenerating}
                    />
                  </div>

                  <Input
                    label="年齢"
                    type="number"
                    min={18}
                    max={99}
                    placeholder="23"
                    value={profileData.partner.age}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('partner', 'age', e.target.value)}
                    disabled={isGenerating}
                  />

                                     <Select
                     label="性別"
                     value={profileData.partner.gender}
                     options={[
                       { value: "", label: "選択してください" },
                       { value: "男性", label: "男性" },
                       { value: "女性", label: "女性" },
                       { value: "その他", label: "その他" }
                     ]}
                     onValueChange={(value: string) => handleInputChange('partner', 'gender', value)}
                     showEmptyOption={false}
                     disabled={isGenerating}
                   />

                  <Input
                    label="職業"
                    placeholder="デザイナー"
                    value={profileData.partner.occupation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('partner', 'occupation', e.target.value)}
                    disabled={isGenerating}
                  />

                  <Input
                    label="性格・特徴"
                    placeholder="明るい、社交的"
                    value={profileData.partner.traits}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('partner', 'traits', e.target.value)}
                    disabled={isGenerating}
                  />

                  <Input
                    label="好みのタイプ"
                    placeholder="誠実な人、面白い人"
                    value={profileData.partner.preference}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('partner', 'preference', e.target.value)}
                    disabled={isGenerating}
                  />

                  <Input
                    label="背景・趣味"
                    placeholder="アート、カフェ巡り"
                    value={profileData.partner.background}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('partner', 'background', e.target.value)}
                    disabled={isGenerating}
                  />

                  {/* 詳細記述欄 */}
                  <div className="md:col-span-2 mt-4">
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">📝 詳細記述（より詳しい情報）</label>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">💎 プレミアム機能</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPremiumInfo(true)}
                            className="text-pink-600 hover:text-pink-800 underline p-0 h-auto"
                          >
                            詳細
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        rows={3}
                        placeholder="例：美術大学でグラフィックデザインを学んでいます..."
                        maxLength={500}
                        showCharacterCount={true}
                        value={profileData.partner.detailedDescription}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('partner', 'detailedDescription', e.target.value)}
                        disabled={isGenerating}
                      />
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">より詳細な情報でシミュレーションの精度が向上します</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 関係性設定 */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">3</span>
                  関係性設定
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                                     <Select
                     label="現在の関係"
                     value={profileData.relationship}
                     options={[
                       { value: "", label: "選択してください" },
                       { value: "初対面", label: "初対面" },
                       { value: "知り合い", label: "知り合い" },
                       { value: "友達", label: "友達" },
                       { value: "親友", label: "親友" },
                       { value: "気になる人", label: "気になる人" },
                       { value: "恋人候補", label: "恋人候補" }
                     ]}
                     onValueChange={(value: string) => setProfileData(prev => ({ ...prev, relationship: value }))}
                     showEmptyOption={false}
                     disabled={isGenerating}
                   />

                                     <Select
                     label="関係の進展度"
                     value={profileData.stage}
                     options={[
                       { value: "", label: "選択してください" },
                       { value: "出会ったばかり", label: "🌱 出会ったばかり（まだお互いをよく知らない）" },
                       { value: "会話を楽しむ", label: "💬 会話を楽しむ（話すのが楽しくなってきた）" },
                       { value: "お互いに興味", label: "👀 お互いに興味（相手のことをもっと知りたい）" },
                       { value: "特別な感情", label: "💕 特別な感情（友達以上の気持ちが芽生えた）" },
                       { value: "恋愛感情確信", label: "💖 恋愛感情確信（この人が好きだと確信している）" },
                       { value: "両思いの可能性", label: "✨ 両思いの可能性（相手も自分を好きかもしれない）" }
                     ]}
                     onValueChange={(value: string) => setProfileData(prev => ({ ...prev, stage: value }))}
                     showEmptyOption={false}
                     disabled={isGenerating}
                   />
                </div>
              </div>

              {/* シミュレーション設定 */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">4</span>
                  シミュレーション設定
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                                     <Select
                     label="目標"
                     value={profileData.goal}
                     options={[
                       { value: "", label: "選択してください" },
                       { value: "友達になる", label: "友達になる" },
                       { value: "デートする", label: "デートする" },
                       { value: "告白する", label: "告白する" },
                       { value: "恋人になる", label: "恋人になる" },
                       { value: "関係を深める", label: "関係を深める" },
                       { value: "結婚を考える", label: "結婚を考える" }
                     ]}
                     onValueChange={(value: string) => setProfileData(prev => ({ ...prev, goal: value }))}
                     showEmptyOption={false}
                     disabled={isGenerating}
                   />

                                     <Select
                     label="質問数"
                     value={profileData.numberOfQuestions}
                     options={[
                       { value: "", label: "選択してください" },
                       { value: "1", label: "1問（デバッグ用）" },
                       { value: "2", label: "2問（デモ用）" },
                       { value: "5", label: "5問（短時間）" },
                       { value: "10", label: "10問（標準）" },
                       { value: "15", label: "15問（詳細）" },
                       { value: "20", label: "20問（完全版）" }
                     ]}
                     onValueChange={(value: string) => setProfileData(prev => ({ ...prev, numberOfQuestions: value }))}
                     showEmptyOption={false}
                     disabled={isGenerating}
                   />
                </div>
              </div>

              {/* ボタン */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isGenerating}
                  className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  リセット
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  プレビュー
                </Button>
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      シミュレーション生成中...
                    </>
                  ) : (
                    'シミュレーション開始 🚀'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>

      {/* プレビューモーダル */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="プロフィール確認"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold text-blue-800 mb-2">👤 あなた</h4>
            <p><strong>年齢:</strong> {profileData.my.age || '未設定'}歳</p>
            <p><strong>性別:</strong> {profileData.my.gender || '未設定'}</p>
            <p><strong>職業:</strong> {profileData.my.occupation || '未設定'}</p>
            <p><strong>性格:</strong> {profileData.my.traits || '未設定'}</p>
            <p><strong>好み:</strong> {profileData.my.preference || '未設定'}</p>
            <p><strong>背景:</strong> {profileData.my.background || '未設定'}</p>
          </div>
          <div className="bg-pink-50 p-4 rounded-lg">
            <h4 className="font-bold text-pink-800 mb-2">💝 相手</h4>
            <p><strong>年齢:</strong> {profileData.partner.age || '未設定'}歳</p>
            <p><strong>性別:</strong> {profileData.partner.gender || '未設定'}</p>
            <p><strong>職業:</strong> {profileData.partner.occupation || '未設定'}</p>
            <p><strong>性格:</strong> {profileData.partner.traits || '未設定'}</p>
            <p><strong>好み:</strong> {profileData.partner.preference || '未設定'}</p>
            <p><strong>背景:</strong> {profileData.partner.background || '未設定'}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-bold text-purple-800 mb-2">💕 関係性</h4>
            <p><strong>現在の関係:</strong> {profileData.relationship || '未設定'}</p>
            <p><strong>段階:</strong> {profileData.stage || '未設定'}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-bold text-green-800 mb-2">🎯 設定</h4>
            <p><strong>目標:</strong> {profileData.goal || '未設定'}</p>
            <p><strong>質問数:</strong> {profileData.numberOfQuestions || '未設定'}問</p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Button className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium" onClick={() => setShowPreview(false)}>
            閉じる
          </Button>
        </div>
      </Modal>

      {/* プレミアム機能説明モーダル */}
      <Modal
        isOpen={showPremiumInfo}
        onClose={() => setShowPremiumInfo(false)}
        title="プレミアム機能"
        size="md"
      >
        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="text-green-500 mt-1">✅</div>
            <div>
              <h4 className="font-semibold text-gray-800">写真アップロード機能</h4>
              <p className="text-sm text-gray-600">あなたと相手の写真を設定してよりリアルに</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="text-green-500 mt-1">✅</div>
            <div>
              <h4 className="font-semibold text-gray-800">詳細記述機能</h4>
              <p className="text-sm text-gray-600">500文字まで詳細な情報を入力可能</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="text-green-500 mt-1">✅</div>
            <div>
              <h4 className="font-semibold text-gray-800">高精度シミュレーション</h4>
              <p className="text-sm text-gray-600">より詳細で現実的な会話が可能</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">月額 ¥980</div>
            <div className="text-sm text-gray-600">初回7日間無料</div>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowPremiumInfo(false)}
            className="flex-1"
          >
            後で
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            アップグレード
          </Button>
        </div>
      </Modal>
    </div>
  );
};
