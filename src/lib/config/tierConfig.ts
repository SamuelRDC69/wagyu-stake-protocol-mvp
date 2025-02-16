import { Store, TrendingUp, Activity, Gauge, Star, Zap, Award } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface TierStyle {
  color: string;
  bgColor: string;
  borderColor: string;
  progressColor: string;
}

export interface TierConfig {
  displayName: string;
  weight: string;
  staked_up_to_percent: string;
  icon: LucideIcon;
  style: TierStyle;
}

// Create a color palette for each tier level
export const createTierStyle = (index: number): TierStyle => {
  // Define color progression in hex
  const colors = [
    '#9333EA',  // Purple (Level 0)
    '#8B5CF6',  // Lighter Purple (Level 1)
    '#7C3AED',  // Medium Purple (Level 2)
    '#6D28D9',  // Darker Purple (Level 3)
    '#5B21B6',  // Deep Purple (Level 4)
    '#4C1D95',  // Very Deep Purple (Level 5)
    '#2563EB',  // Blue (Level 6)
    '#1D4ED8',  // Darker Blue (Level 7)
    '#047857',  // Green (Level 8)
    '#059669',  // Emerald (Level 9)
    '#0D9488',  // Teal (Level 10)
    '#0891B2',  // Cyan (Level 11)
    '#0369A1',  // Light Blue (Level 12)
    '#1D4ED8',  // Blue (Level 13)
    '#4338CA',  // Indigo (Level 14)
    '#5B21B6',  // Purple (Level 15)
    '#6D28D9',  // Darker Purple (Level 16)
    '#7C3AED',  // Even Darker Purple (Level 17)
    '#8B5CF6',  // Rich Purple (Level 18)
    '#9333EA',  // Bright Purple (Level 19)
    '#A855F7',  // Vibrant Purple (Level 20)
    '#C084FC',  // Royal Purple (Level 21)
  ];

  const color = colors[Math.min(index, colors.length - 1)];
  
  return {
    color: `text-[color:${color}]`,
    bgColor: `bg-[color:${color}]/10`,
    borderColor: `border-[color:${color}]/20`,
    progressColor: `bg-[color:${color}]`
  };
};

export const TIER_CONFIG: Record<string, TierConfig> = {
  a: {
    displayName: 'Level 0',
    weight: '1.000000000000000000',
    staked_up_to_percent: '0.489999999999999991',
    icon: Store,
    style: createTierStyle(0)
  },
  b: {
    displayName: 'Level 1',
    weight: '1.006999999999999895',
    staked_up_to_percent: '0.599999999999999978',
    icon: Store,
    style: createTierStyle(1)
  },
  c: {
    displayName: 'Level 2',
    weight: '1.014048999999999756',
    staked_up_to_percent: '0.689999999999999947',
    icon: Activity,
    style: createTierStyle(2)
  },
  d: {
    displayName: 'Level 3',
    weight: '1.021147342999999541',
    staked_up_to_percent: '0.799999999999999933',
    icon: Activity,
    style: createTierStyle(3)
  },
  e: {
    displayName: 'Level 4',
    weight: '1.028295374400999496',
    staked_up_to_percent: '0.949999999999999845',
    icon: TrendingUp,
    style: createTierStyle(4)
  },
  f: {
    displayName: 'Level 5',
    weight: '1.035493442021806487',
    staked_up_to_percent: '1.399999999999000044',
    icon: TrendingUp,
    style: createTierStyle(5)
  },
  g: {
    displayName: 'Level 6',
    weight: '1.042741896115959133',
    staked_up_to_percent: '1.549999999999998934',
    icon: Gauge,
    style: createTierStyle(6)
  },
  h: {
    displayName: 'Level 7',
    weight: '1.050041089388770832',
    staked_up_to_percent: '1.699999999999900036',
    icon: Gauge,
    style: createTierStyle(7)
  },
  i: {
    displayName: 'Level 8',
    weight: '1.057391377014492040',
    staked_up_to_percent: '1.899999999999989919',
    icon: Star,
    style: createTierStyle(8)
  },
  j: {
    displayName: 'Level 9',
    weight: '1.064793116653593330',
    staked_up_to_percent: '2.149999999999990141',
    icon: Star,
    style: createTierStyle(9)
  },
  k: {
    displayName: 'Level 10',
    weight: '1.072246668470168363',
    staked_up_to_percent: '2.849999999999999201',
    icon: Zap,
    style: createTierStyle(10)
  },
  l: {
    displayName: 'Level 11',
    weight: '1.079752395149459421',
    staked_up_to_percent: '3.099999999999989875',
    icon: Zap,
    style: createTierStyle(11)
  },
  m: {
    displayName: 'Level 12',
    weight: '1.087310661915505516',
    staked_up_to_percent: '3.399999999999999023',
    icon: Award,
    style: createTierStyle(12)
  },
  n: {
    displayName: 'Level 13',
    weight: '1.094921836548913952',
    staked_up_to_percent: '3.699999999999989964',
    icon: Award,
    style: createTierStyle(13)
  },
  o: {
    displayName: 'Level 14',
    weight: '1.102586289404756226',
    staked_up_to_percent: '4.049999999999990052',
    icon: Award,
    style: createTierStyle(14)
  },
  p: {
    displayName: 'Level 15',
    weight: '1.110304393430589398',
    staked_up_to_percent: '5.199999999999990408',
    icon: Award,
    style: createTierStyle(15)
  },
  q: {
    displayName: 'Level 16',
    weight: '1.118076524184603349',
    staked_up_to_percent: '5.599999999999998757',
    icon: Award,
    style: createTierStyle(16)
  },
  r: {
    displayName: 'Level 17',
    weight: '1.125903059853895494',
    staked_up_to_percent: '6.049999999999998934',
    icon: Award,
    style: createTierStyle(17)
  },
  s: {
    displayName: 'Level 18',
    weight: '1.133784381272872732',
    staked_up_to_percent: '6.549999999999998934',
    icon: Award,
    style: createTierStyle(18)
  },
  t: {
    displayName: 'Level 19',
    weight: '1.141720871941782622',
    staked_up_to_percent: '7.099999999999998757',
    icon: Award,
    style: createTierStyle(19)
  },
  u: {
    displayName: 'Level 20',
    weight: '1.149712918045374899',
    staked_up_to_percent: '8.949999999999899813',
    icon: Award,
    style: createTierStyle(20)
  },
  v: {
    displayName: 'Level 21',
    weight: '1.165866235841998222',
    staked_up_to_percent: '100.000000000000000000',
    icon: Award,
    style: createTierStyle(21)
  }
};

export const TIER_KEYS = Object.keys(TIER_CONFIG);