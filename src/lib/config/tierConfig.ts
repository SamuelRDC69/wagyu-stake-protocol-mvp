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
  // Define color progression
  const colors = [
    { r: 147, g: 51, b: 234 },  // Purple
    { r: 79, g: 70, b: 229 },   // Indigo
    { r: 59, g: 130, b: 246 },  // Blue
    { r: 14, g: 165, b: 233 },  // Light Blue
    { r: 6, g: 182, b: 212 },   // Cyan
    { r: 20, g: 184, b: 166 },  // Teal
    { r: 16, g: 185, b: 129 },  // Emerald
    { r: 34, g: 197, b: 94 },   // Green
    { r: 132, g: 204, b: 22 },  // Lime
    { r: 234, g: 179, b: 8 },   // Yellow
    { r: 245, g: 158, b: 11 },  // Orange
    { r: 249, g: 115, b: 22 },  // Dark Orange
    { r: 239, g: 68, b: 68 },   // Red
    { r: 236, g: 72, b: 153 },  // Pink
    { r: 217, g: 70, b: 239 },  // Fuchsia
    { r: 168, g: 85, b: 247 },  // Purple
    { r: 147, g: 51, b: 234 },  // Purple
    { r: 126, g: 34, b: 206 },  // Deep Purple
    { r: 107, g: 33, b: 168 },  // Darker Purple
    { r: 88, g: 28, b: 135 },   // Very Dark Purple
    { r: 67, g: 20, b: 104 },   // Extremely Dark Purple
    { r: 126, g: 34, b: 206 },  // Final Level Deep Purple
  ];

  const color = colors[Math.min(index, colors.length - 1)];
  
  // The key change is here - use rgba for ALL colors, with different opacities
  return {
    color: `text-[rgba(${color.r},${color.g},${color.b},1)]`,  // Full opacity for text
    bgColor: `bg-[rgba(${color.r},${color.g},${color.b},0.1)]`,  // 10% opacity for background
    borderColor: `border-[rgba(${color.r},${color.g},${color.b},0.2)]`,  // 20% opacity for border
    progressColor: `bg-[rgba(${color.r},${color.g},${color.b},1)]`  // Full opacity for progress
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
