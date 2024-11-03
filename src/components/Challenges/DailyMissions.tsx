// src/components/Challenges/DailyMissions.tsx
import { useState } from 'react';
import { 
  Card, 
  Typography, 
  Badge, 
  Button,
  Progress,
  AnimatedNumber,
  Tooltip 
} from '../common';
import { useChallenges } from '../../hooks/useChallenges';
import { 
  Target, 
  Clock, 
  Star,
  Gift,
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';

const DailyMissions = () => {
  const { 
    missions,
    claimReward,
    timeUntilReset,
    dailyProgress,
    bonusMultiplier
  } = useChallenges();

  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleClaim = async (missionId: string) => {
    setClaimingId(missionId);
    try {
      await claimReward(missionId);
    } catch (error) {
      console.error('Failed to claim reward:', error);
    } finally {
      setClaimingId(null);
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-primary" />
          <Typography.H3>Daily Missions</Typography.H3>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <Typography.Small>
            Resets in {formatTimeRemaining(timeUntilReset)}
          </Typography.Small>
        </div>
      </div>

      <div className="space-y-6">
        {/* Daily Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Typography.Label>Daily Progress</Typography.Label>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <Typography.Body>{bonusMultiplier}x Multiplier</Typography.Body>
            </div>
          </div>
          <Progress 
            value={dailyProgress.completed}
            max={dailyProgress.total}
            variant="primary"
            size="lg"
            showLabel
          />
          <Typography.Small className="text-gray-500 mt-2">
            Complete {dailyProgress.remaining} more missions for bonus rewards
          </Typography.Small>
        </div>

        {/* Missions List */}
        <div className="space-y-4">
          {missions.map(mission => (
            <div 
              key={mission.id}
              className={`p-4 rounded-lg ${
                mission.completed 
                  ? 'bg-primary/10' 
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Typography.Body className="font-semibold">
                    {mission.title}
                  </Typography.Body>
                  <Typography.Small className="text-gray-500">
                    {mission.description}
                  </Typography.Small>
                </div>
                <Badge variant={mission.completed ? 'success' : 'default'}>
                  {mission.completed ? 'Completed' : 'In Progress'}
                </Badge>
              </div>

              <div className="space-y-3">
                <Progress 
                  value={mission.progress}
                  max={mission.target}
                  variant={mission.completed ? 'success' : 'primary'}
                  size="md"
                  showLabel
                />

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-primary" />
                    <Typography.Body>
                      <AnimatedNumber 
                        value={mission.reward} 
                        precision={2}
                        prefix="⟁ "
                      />
                    </Typography.Body>
                  </div>

                  {mission.completed && !mission.claimed && (
                    <Button
                      variant="success"
                      size="sm"
                      isLoading={claimingId === mission.id}
                      onClick={() => handleClaim(mission.id)}
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                    >
                      Claim Reward
                    </Button>
                  )}
                </div>

                {mission.bonus && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <Typography.Small>
                      {mission.bonus.description}
                    </Typography.Small>
                  </div>
                )}

                {mission.expiresIn && mission.expiresIn < 3600 && !mission.completed && (
                  <div className="flex items-center gap-2 p-2 bg-red-100 dark:bg-red-900 rounded">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <Typography.Small>
                      Expires in {Math.ceil(mission.expiresIn / 60)} minutes
                    </Typography.Small>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Completion Rewards */}
        <div className="grid grid-cols-3 gap-4">
          {dailyProgress.rewards.map((reward, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg text-center ${
                reward.unlocked 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <Typography.Small className="text-gray-500">
                {reward.requirement} Missions
              </Typography.Small>
              <Typography.Body>
                <AnimatedNumber 
                  value={reward.amount} 
                  precision={2}
                  prefix="⟁ "
                />
              </Typography.Body>
              {reward.claimed && (
                <Badge variant="success">Claimed</Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default DailyMissions;