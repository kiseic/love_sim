// sessionStorage用のユーティリティ関数

export interface ResultData {
  scores: {
    思いやり: number;
    観察力: number;
    コミュニケーション: number;
    面白さ: number;
    積極性: number;
  };
  loveType: {
    title: string;
    description: string;
  };
  growthTips: {
    strengthAdvice: string;
    improvementAdvice: string;
  };
  compatibility: {
    type: string;
    description: string;
  };
}

const RESULT_DATA_KEY = 'love_simulation_result_data';

export const storageUtils = {
  // resultDataをsessionStorageに保存
  saveResultData: (resultData: ResultData): void => {
    try {
      sessionStorage.setItem(RESULT_DATA_KEY, JSON.stringify(resultData));
      console.log('[storage] Result data saved to sessionStorage');
    } catch (error) {
      console.error('[storage] Failed to save result data:', error);
    }
  },

  // sessionStorageからresultDataを取得
  getResultData: (): ResultData | null => {
    try {
      const data = sessionStorage.getItem(RESULT_DATA_KEY);
      if (data) {
        const parsedData = JSON.parse(data) as ResultData;
        console.log('[storage] Result data loaded from sessionStorage');
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error('[storage] Failed to load result data:', error);
      return null;
    }
  },

  // sessionStorageからresultDataを削除
  clearResultData: (): void => {
    try {
      sessionStorage.removeItem(RESULT_DATA_KEY);
      console.log('[storage] Result data cleared from sessionStorage');
    } catch (error) {
      console.error('[storage] Failed to clear result data:', error);
    }
  },

  // resultDataが存在するかチェック
  hasResultData: (): boolean => {
    try {
      return sessionStorage.getItem(RESULT_DATA_KEY) !== null;
    } catch (error) {
      console.error('[storage] Failed to check result data:', error);
      return false;
    }
  }
};
