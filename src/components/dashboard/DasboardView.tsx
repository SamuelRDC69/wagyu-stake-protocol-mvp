// src/components/Dashboard/DashboardView.ts
import { FC } from 'react';
import ClaimProjectionGauge from './ClaimProjectionGauge';
import CooldownTimer from './CooldownTimer';
import RiskMeter from './RiskMeter';
import TierBadge from './TierBadge';
import StakingStats from './StakingStats';

const DashboardView: FC = () => {
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

export default DashboardView;