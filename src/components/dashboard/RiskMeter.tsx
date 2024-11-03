import { useMemo } from 'react';
import { Card, Typography, Progress, Badge } from '../common';
import { usePoolHealth } from '../../hooks/usePoolHealth';
import { AlertTriangle } from 'lucide-react';

const RiskMeter = () => {
  const { 
    poolHealth, 
    pendingClaims, 
    recentClaimVolume 
  } = usePoolHealth();

  const riskLevel = useMemo(() => {
    const poolRisk = (100 - poolHealth.currentHealth) * 0.4;
    const claimRisk = (pendingClaims / poolHealth.totalStakers) * 100 * 0.3;
    const volumeRisk = (recentClaimVolume / poolHealth.rewardPool) * 100 * 0.3;
    
    return Math.min(100, poolRisk + claimRisk + volumeRisk);
  }, [poolHealth, pendingClaims, recentClaimVolume]);

  const getRiskStatus = (risk: number) => {
    if (risk < 30) return { label: 'Low Risk', variant: 'success' };
    if (risk < 70) return { label: 'Medium Risk', variant: 'warning' };
    return { label: 'High Risk', variant: 'danger' };
  };

  const riskStatus = getRiskStatus(riskLevel);

  return (
    <Card variant="game" className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-primary" />
          <Typography.H3>Risk Meter</Typography.H3>
        </div>
        <Badge variant={riskStatus.variant as any}>
          {riskStatus.label}
        </Badge>
      </div>
      <div className="space-y-4">
        <Progress 
          value={riskLevel} 
          max={100}
          variant={riskStatus.variant as any}
          size="lg"
          showLabel
        />
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Typography.Label className="mb-1">Pending Claims</Typography.Label>
            <Typography.H4>{pendingClaims}</Typography.H4>
          </div>
          <div>
            <Typography.Label className="mb-1">Pool Health</Typography.Label>
            <Typography.H4>{poolHealth.currentHealth}%</Typography.H4>
          </div>
          <div>
            <Typography.Label className="mb-1">Recent Volume</Typography.Label>
            <Typography.H4>
              <AnimatedNumber 
                value={recentClaimVolume} 
                precision={2} 
                prefix="⟁ "
              />
            </Typography.H4>
          </div>
        </div>
      </div>
    </Card>
  );
};
