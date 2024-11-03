// src/components/PoolHealth/ClaimImpactAlerts.tsx
import { 
  Card, 
  Typography, 
  Badge, 
  AnimatedNumber 
} from '../common';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { usePoolHealth } from '../../hooks/usePoolHealth';
import { BarChart3 } from 'lucide-react';

const ClaimImpactAlerts = () => {
  const { recentClaims, projectedImpact } = usePoolHealth();
  
  return (
    <Card variant="game">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-primary" />
        <Typography.H3>Claim Impact</Typography.H3>
      </div>

      <div className="space-y-6">
        <div>
          <Typography.Label className="mb-4">Recent Major Claims</Typography.Label>
          <div className="space-y-3">
            {recentClaims.map((claim, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={`tier${claim.tierLevel}` as any}>
                    {claim.tierName}
                  </Badge>
                  <Typography.Small>
                    {claim.timeAgo} ago
                  </Typography.Small>
                </div>
                <div className="text-right">
                  <AnimatedNumber 
                    value={claim.amount} 
                    precision={2} 
                    prefix="⟁ "
                  />
                  <Typography.Small className="text-red-500">
                    -{claim.healthImpact}%
                  </Typography.Small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Typography.Label className="mb-4">Projected Impact</Typography.Label>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={projectedImpact}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <RechartsTooltip />
              <Area 
                type="monotone" 
                dataKey="health" 
                stroke="#1cb095" 
                fill="#1cb09520" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default ClaimImpactAlerts;