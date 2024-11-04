// src/services/analytics.tsx
import { useEffect, useState } from 'react';

interface AnalyticsData {
  stakingMetrics: {
    label: string;
    value: number;
    change: number;
    prefix?: string;
    suffix?: string;
  }[];
  poolMetrics: {
    label: string;
    value: number;
    change: number;
    suffix?: string;
  }[];
  rewardMetrics: {
    label: string;
    value: number;
    timeframe: string;
    optimizationTips: {
      title: string;
      description: string;
    }[];
  }[];
  userMetrics: {
    label: string;
    value: number;
    trend: number;
    precision: number;
    suffix?: string;
    segments: {
      name: string;
      percentage: number;
      count: number;
      icon: React.ReactNode;
    }[];
  }[];
}

export const useAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Fetch analytics data from your API
        // For now using mock data
        const mockData: AnalyticsData = {
          stakingMetrics: [
            {
              label: 'Total Staked',
              value: 1000000,
              change: 5.2,
              prefix: '⟁ '
            }
          ],
          poolMetrics: [
            {
              label: 'Pool Health',
              value: 85,
              change: -2.1,
              suffix: '%'
            }
          ],
          rewardMetrics: [
            {
              label: 'Total Rewards',
              value: 50000,
              timeframe: '24h',
              optimizationTips: [
                {
                  title: 'Optimal Claim Time',
                  description: 'Consider claiming during off-peak hours'
                }
              ]
            }
          ],
          userMetrics: [
            {
              label: 'Active Users',
              value: 1500,
              trend: 7.5,
              precision: 0,
              segments: [
                {
                  name: 'Daily',
                  percentage: 45,
                  count: 675,
                  icon: null
                }
              ]
            }
          ]
        };

        setData(mockData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return {
    data,
    loading,
    error,
    stakingMetrics: data?.stakingMetrics || [],
    poolMetrics: data?.poolMetrics || [],
    rewardMetrics: data?.rewardMetrics || [],
    userMetrics: data?.userMetrics || []
  };
};