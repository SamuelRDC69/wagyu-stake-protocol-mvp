// src/components/Strategy/TopPlayerAnalysis.tsx
import { 
  Card, 
  Typography, 
  Badge, 
  Progress,
  AnimatedNumber 
} from '../common';
import { useClaimStrategy } from '../../hooks/useClaimStrategy';
import { Users, Award, TrendingUp, Clock } from 'lucide-react';

const TopPlayerAnalysis = () => {
  const { 
    topPlayers,
    averageClaimInterval,
    successfulStrategies,
    competitorActivity 
  } = useClaimStrategy();

  return (
    <Card variant="game">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-primary" />
        <Typography.H3>Top Player Analysis</Typography.H3>
      </div>

      <div className="space-y-6">
        {/* Top Players List */}
        <div>
          <Typography.Label className="mb-4">Top Performers</Typography.Label>
          <div className="space-y-3">
            {topPlayers.slice(0, 5).map((player, index) => (
              <div 
                key={index}
                className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={`tier${player.tier.level}` as any}>
                    {index + 1}
                  </Badge>
                  <div>
                    <Typography.Body>{player.name}</Typography.Body>
                    <Typography.Small className="text-gray-500">
                      {player.tier.name} Tier
                    </Typography.Small>
                  </div>
                </div>
                <div className="text-right">
                  <AnimatedNumber 
                    value={player.earnings} 
                    precision={2}
                    prefix="⟁ "
                  />
                  <Typography.Small className="text-green-500">
                    +{player.rewardRate}%/hr
                  </Typography.Small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Successful Strategies */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-primary" />
            <Typography.Label>Winning Strategies</Typography.Label>
          </div>
          <div className="space-y-3">
            {successfulStrategies.map((strategy, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Typography.Body>{strategy.name}</Typography.Body>
                  <Typography.Small className="text-green-500">
                    +{strategy.successRate}% success
                  </Typography.Small>
                </div>
                <Progress 
                  value={strategy.adoption}
                  max={100}
                  variant="success"
                  size="sm"
                />
                <Typography.Small className="text-gray-500">
                  {strategy.description}
                </Typography.Small>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor Activity */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <Typography.Label>Activity Patterns</Typography.Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-primary" />
                <Typography.Label>Average Claim Interval</Typography.Label>
              </div>
              <Typography.H4>{averageClaimInterval} hours</Typography.H4>
              <Typography.Small className="text-gray-500">
                Among top 100 players
              </Typography.Small>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Typography.Label className="mb-2">Peak Activity</Typography.Label>
              <Typography.H4>{competitorActivity.peakHours}</Typography.H4>
              <Typography.Small className="text-gray-500">
                {competitorActivity.peakDescription}
              </Typography.Small>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TopPlayerAnalysis;