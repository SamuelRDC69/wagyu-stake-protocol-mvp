// src/components/Dashboard/index.tsx
import { FC } from 'react';
import {
  ClaimProjectionGauge,
  CooldownTimer,
  RiskMeter,
  TierBadge,
  StakingStats
} from './components';

const Dashboard: FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ClaimProjectionGauge />
        <CooldownTimer />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RiskMeter />
        <TierBadge />
      </div>
      <StakingStats />
    </div>
  );
};

export default Dashboard;
export {
  ClaimProjectionGauge,
  CooldownTimer,
  RiskMeter,
  TierBadge,
  StakingStats
};