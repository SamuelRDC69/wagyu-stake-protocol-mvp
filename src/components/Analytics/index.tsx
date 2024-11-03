// src/components/Analytics/index.tsx
import StakeAnalytics from './StakeAnalytics';
import PoolAnalytics from './PoolAnalytics';
import RewardAnalytics from './RewardAnalytics';
import UserAnalytics from './UserAnalytics';
import PerformanceMetrics from './PerformanceMetrics';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StakeAnalytics />
        <PoolAnalytics />
      </div>
      <RewardAnalytics />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserAnalytics />
        <PerformanceMetrics />
      </div>
    </div>
  );
};

export default Analytics;
export {
  StakeAnalytics,
  PoolAnalytics,
  RewardAnalytics,
  UserAnalytics,
  PerformanceMetrics
};