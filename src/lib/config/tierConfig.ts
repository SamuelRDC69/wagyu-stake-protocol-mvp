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

export const createTierStyle = (index: number): TierStyle => {
  const colorSets = [
    // Purple progression (0-4)
    {
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      progressColor: 'bg-purple-500'
    },
    {
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10',
      borderColor: 'border-purple-600/20',
      progressColor: 'bg-purple-600'
    },
    {
      color: 'text-purple-700',
      bgColor: 'bg-purple-700/10',
      borderColor: 'border-purple-700/20',
      progressColor: 'bg-purple-700'
    },
    {
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      progressColor: 'bg-indigo-500'
    },
    {
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-600/10',
      borderColor: 'border-indigo-600/20',
      progressColor: 'bg-indigo-600'
    },
    // Blue progression (5-8)
    {
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      progressColor: 'bg-blue-500'
    },
    {
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
      borderColor: 'border-blue-600/20',
      progressColor: 'bg-blue-600'
    },
    {
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      progressColor: 'bg-cyan-500'
    },
    {
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-600/10',
      borderColor: 'border-cyan-600/20',
      progressColor: 'bg-cyan-600'
    },
    // Teal/Green progression (9-12)
    {
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20',
      progressColor: 'bg-teal-500'
    },
    {
      color: 'text-teal-600',
      bgColor: 'bg-teal-600/10',
      borderColor: 'border-teal-600/20',
      progressColor: 'bg-teal-600'
    },
    {
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      progressColor: 'bg-emerald-500'
    },
    {
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-600/10',
      borderColor: 'border-emerald-600/20',
      progressColor: 'bg-emerald-600'
    },
    // Warm progression (13-16)
    {
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      progressColor: 'bg-amber-500'
    },
    {
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      progressColor: 'bg-orange-500'
    },
    {
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      progressColor: 'bg-rose-500'
    },
    {
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20',
      progressColor: 'bg-pink-500'
    },
    // Elite progression (17-21)
    {
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/20',
      progressColor: 'bg-violet-500'
    },
    {
      color: 'text-violet-600',
      bgColor: 'bg-violet-600/10',
      borderColor: 'border-violet-600/20',
      progressColor: 'bg-violet-600'
    },
    {
      color: 'text-fuchsia-500',
      bgColor: 'bg-fuchsia-500/10',
      borderColor: 'border-fuchsia-500/20',
      progressColor: 'bg-fuchsia-500'
    },
    {
      color: 'text-fuchsia-600',
      bgColor: 'bg-fuchsia-600/10',
      borderColor: 'border-fuchsia-600/20',
      progressColor: 'bg-fuchsia-600'
    },
    // Final elite tier
    {
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      borderColor: 'border-purple-400/20',
      progressColor: 'bg-purple-400'
    }
  ];

  return colorSets[Math.min(index, colorSets.length - 1)];
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