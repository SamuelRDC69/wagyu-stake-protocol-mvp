// src/components/PoolHealth/index.tsx
import HealthBar from './HealthBar';
import ClaimImpactAlerts from './ClaimImpactAlerts';
import EmissionVisualizer from './EmissionVisualizer';
import PoolStatistics from './PoolStatistics';

const PoolHealth = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HealthBar />
        <ClaimImpactAlerts />
      </div>
      <EmissionVisualizer />
      <PoolStatistics />
    </div>
  );
};

export default PoolHealth;
export { HealthBar, ClaimImpactAlerts, EmissionVisualizer, PoolStatistics };