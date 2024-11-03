// src/components/Strategy/index.tsx
import OptimalClaimTimer from './OptimalClaimTimer';
import PoolForecast from './PoolForecast';
import ClaimHeatmap from './ClaimHeatmap';
import TopPlayerAnalysis from './TopPlayerAnalysis';

const Strategy = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OptimalClaimTimer />
        <PoolForecast />
      </div>
      <ClaimHeatmap />
      <TopPlayerAnalysis />
    </div>
  );
};

export default Strategy;
export {
  OptimalClaimTimer,
  PoolForecast,
  ClaimHeatmap,
  TopPlayerAnalysis
};