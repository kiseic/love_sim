export interface PresetData {
  id: string;
  emoji: string;
  title: string;
  description: string;
  color: 'blue' | 'pink' | 'purple' | 'green' | 'red' | 'yellow' | 'indigo' | 'teal' | 'orange' | 'cyan';
}

export const PRESET_DATA: PresetData[] = [
  {
    id: 'university',
    emoji: '🎓',
    title: '大学生カップル',
    description: '👤 20歳 大学生\n💝 19歳 大学生\n💕 友達 → 恋人',
    color: 'blue'
  },
  {
    id: 'workplace',
    emoji: '💼',
    title: '社会人出会い',
    description: '👤 27歳 会社員\n💝 25歳 デザイナー\n💕 初対面 → デート',
    color: 'pink'
  },
  {
    id: 'childhood',
    emoji: '🌸',
    title: '幼馴染み',
    description: '👤 22歳 大学生\n💝 22歳 看護師\n💕 親友 → 恋人',
    color: 'purple'
  },
  {
    id: 'office',
    emoji: '🏢',
    title: '職場恋愛',
    description: '👤 28歳 営業\n💝 26歳 事務\n💕 同僚 → 恋人',
    color: 'green'
  },
  {
    id: 'older',
    emoji: '👩‍💼',
    title: '年上女性',
    description: '👤 24歳 新卒\n💝 30歳 先輩\n💕 憧れ → 恋愛',
    color: 'red'
  },
  {
    id: 'hobby',
    emoji: '🎨',
    title: '趣味友達',
    description: '👤 25歳 会社員\n💝 23歳 学生\n💕 趣味仲間 → 恋人',
    color: 'yellow'
  },
  {
    id: 'longdistance',
    emoji: '✈️',
    title: '遠距離恋愛',
    description: '👤 26歳 エンジニア\n💝 24歳 教師\n💕 遠距離 → 結婚',
    color: 'indigo'
  },
  {
    id: 'reunion',
    emoji: '🔄',
    title: '再会恋愛',
    description: '👤 29歳 会社員\n💝 28歳 元同級生\n💕 再会 → 恋愛',
    color: 'teal'
  },
  {
    id: 'younger',
    emoji: '👨‍🎓',
    title: '年下男性',
    description: '👤 32歳 女性管理職\n💝 26歳 部下\n💕 上司部下 → 恋人',
    color: 'orange'
  },
  {
    id: 'international',
    emoji: '🌍',
    title: '国際恋愛',
    description: '👤 27歳 日本人\n💝 25歳 外国人\n💕 文化交流 → 恋愛',
    color: 'cyan'
  }
];

export interface PresetValue {
  my: {
    age: string;
    gender: string;
    occupation: string;
    traits: string;
    preference: string;
    background: string;
  };
  partner: {
    age: string;
    gender: string;
    occupation: string;
    traits: string;
    preference: string;
    background: string;
  };
  relationship: string;
  stage: string;
  goal: string;
  numberOfQuestions: string;
}

export const PRESET_VALUES: Record<string, PresetValue> = {
  university: {
    my: {
      age: '20',
      gender: '男性',
      occupation: '大学生',
      traits: '真面目、優しい',
      preference: '明るい人、一緒にいて楽しい人',
      background: 'サークル活動、読書'
    },
    partner: {
      age: '19',
      gender: '女性',
      occupation: '大学生',
      traits: '明るい、社交的',
      preference: '誠実な人、面白い人',
      background: 'アート、音楽鑑賞'
    },
    relationship: '友達',
    stage: '好意を持つ',
    goal: '告白する',
    numberOfQuestions: '10'
  },
  workplace: {
    my: {
      age: '27',
      gender: '男性',
      occupation: '会社員',
      traits: '責任感が強い、穏やか',
      preference: 'クリエイティブな人、話しやすい人',
      background: '映画鑑賞、料理'
    },
    partner: {
      age: '25',
      gender: '女性',
      occupation: 'デザイナー',
      traits: 'クリエイティブ、独立心がある',
      preference: '理解のある人、サポートしてくれる人',
      background: 'アート、カフェ巡り'
    },
    relationship: '初対面',
    stage: '親しくなる',
    goal: 'デートする',
    numberOfQuestions: '15'
  },
  childhood: {
    my: {
      age: '22',
      gender: '男性',
      occupation: '大学生',
      traits: '思いやりがある、内向的',
      preference: '一緒に成長できる人、理解し合える人',
      background: 'ゲーム、スポーツ観戦'
    },
    partner: {
      age: '22',
      gender: '女性',
      occupation: '看護師',
      traits: '優しい、しっかり者',
      preference: '信頼できる人、長く付き合える人',
      background: '読書、散歩'
    },
    relationship: '親友',
    stage: '関係深化',
    goal: '関係を深める',
    numberOfQuestions: '20'
  },
  office: {
    my: {
      age: '28',
      gender: '男性',
      occupation: '営業',
      traits: 'コミュニケーション能力が高い、積極的',
      preference: '仕事に理解がある人、支え合える人',
      background: 'ゴルフ、飲み会'
    },
    partner: {
      age: '26',
      gender: '女性',
      occupation: '事務',
      traits: '丁寧、気配りができる',
      preference: '頼りがいのある人、優しい人',
      background: 'ヨガ、料理'
    },
    relationship: '知り合い',
    stage: '親しくなる',
    goal: 'デートする',
    numberOfQuestions: '10'
  },
  older: {
    my: {
      age: '24',
      gender: '男性',
      occupation: '新卒社員',
      traits: '素直、向上心がある',
      preference: '包容力のある人、教えてくれる人',
      background: 'スポーツ、勉強'
    },
    partner: {
      age: '30',
      gender: '女性',
      occupation: '主任',
      traits: '落ち着いている、面倒見が良い',
      preference: '一生懸命な人、成長する人',
      background: 'ワイン、旅行'
    },
    relationship: '気になる人',
    stage: '好意を持つ',
    goal: '告白する',
    numberOfQuestions: '15'
  },
  hobby: {
    my: {
      age: '25',
      gender: '男性',
      occupation: '会社員',
      traits: 'クリエイティブ、情熱的',
      preference: '同じ趣味を持つ人、感性が合う人',
      background: '写真、アート鑑賞'
    },
    partner: {
      age: '23',
      gender: '女性',
      occupation: '美大生',
      traits: '感受性豊か、自由奔放',
      preference: '理解してくれる人、刺激的な人',
      background: '絵画、展示会巡り'
    },
    relationship: '友達',
    stage: '親しくなる',
    goal: '恋人になる',
    numberOfQuestions: '10'
  },
  longdistance: {
    my: {
      age: '26',
      gender: '男性',
      occupation: 'エンジニア',
      traits: '論理的、忍耐強い',
      preference: '信頼できる人、将来を考えられる人',
      background: 'プログラミング、読書'
    },
    partner: {
      age: '24',
      gender: '女性',
      occupation: '教師',
      traits: '優しい、責任感が強い',
      preference: '誠実な人、家族を大切にする人',
      background: '教育、子供との時間'
    },
    relationship: '恋人候補',
    stage: '交際開始',
    goal: '結婚を考える',
    numberOfQuestions: '20'
  },
  reunion: {
    my: {
      age: '29',
      gender: '男性',
      occupation: '会社員',
      traits: '懐かしがり、安定志向',
      preference: '昔を知っている人、安心できる人',
      background: '同窓会、地元の友達'
    },
    partner: {
      age: '28',
      gender: '女性',
      occupation: '公務員',
      traits: '変わらない魅力、成熟した',
      preference: '昔から知っている人、信頼できる人',
      background: '地元愛、安定した生活'
    },
    relationship: '知り合い',
    stage: '出会い',
    goal: 'デートする',
    numberOfQuestions: '15'
  },
  younger: {
    my: {
      age: '32',
      gender: '女性',
      occupation: '管理職',
      traits: 'リーダーシップがある、自立している',
      preference: '素直な人、成長意欲のある人',
      background: 'キャリア、自己投資'
    },
    partner: {
      age: '26',
      gender: '男性',
      occupation: '部下',
      traits: '素直、エネルギッシュ',
      preference: '頼りがいのある人、導いてくれる人',
      background: 'スポーツ、新しいことへの挑戦'
    },
    relationship: '知り合い',
    stage: '親しくなる',
    goal: '関係を深める',
    numberOfQuestions: '15'
  },
  international: {
    my: {
      age: '27',
      gender: '男性',
      occupation: '商社マン',
      traits: '国際的、適応力がある',
      preference: '文化の違いを楽しめる人、オープンな人',
      background: '海外経験、語学学習'
    },
    partner: {
      age: '25',
      gender: '女性',
      occupation: '英語教師',
      traits: '明るい、文化に興味がある',
      preference: '国際的な人、新しい体験を共有できる人',
      background: '異文化交流、旅行'
    },
    relationship: '初対面',
    stage: '出会い',
    goal: '友達になる',
    numberOfQuestions: '10'
  }
};
