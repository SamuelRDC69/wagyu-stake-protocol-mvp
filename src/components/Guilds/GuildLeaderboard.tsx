// src/components/Guilds/GuildLeaderboard.tsx
import { 
  Card, 
  Typography, 
  Badge, 
  AnimatedNumber,
  Progress 
} from '../common';
import { useGuild } from '../../hooks/useGuild';
import { Trophy, Users, TrendingUp, Crown } from 'lucide-react';

const GuildLeaderboard = () => {
  const { 
    topGuilds,
    totalGuilds,
    userGuild,
    weeklyRewards
  } = useGuild();

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-primary" />
          <Typography.H3>Guild Leaderboard</Typography.H3>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <Typography.Small>{totalGuilds} Active Guilds</Typography.Small>
        </div>
      </div>

      <div className="space-y-6">
        {/* Weekly Rewards Banner */}
        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <Typography.Label>Weekly Guild Rewards</Typography.Label>
          </div>
          <Typography.H3>
            <AnimatedNumber 
              value={weeklyRewards.amount} 
              precision={2}
              prefix="⟁ "
            />
          </Typography.H3>
          <Typography.Small className="text-gray-500">
            Distributed in {weeklyRewards.timeRemaining} hours
          </Typography.Small>
        </div>

        {/* Guild Rankings */}
        <div className="space-y-4">
          {topGuilds.map((guild, index) => (
            <div 
              key={guild.id}
              className={`p-4 rounded-lg ${
                guild.id === userGuild?.id 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge variant={index < 3 ? 'success' : 'default'}>
                    #{index + 1}
                  </Badge>
                  <div>
                    <Typography.Body className="font-semibold">
                      {guild.name}
                    </Typography.Body>
                    <div className="flex items-center gap-2">
                      <Typography.Small className="text-gray-500">
                        {guild.memberCount} members
                      </Typography.Small>
                      {guild.recruiting && (
                        <Badge variant="default">Recruiting</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <AnimatedNumber 
                    value={guild.totalStaked} 
                    precision={2}
                    prefix="⟁ "
                  />
                  <div className="flex items-center gap-1 justify-end">
                    <TrendingUp className={`w-3 h-3 ${
                      guild.weeklyGrowth >= 0 ? 'text-green-500' : 'text-red-500'
                    }`} />
                    <Typography.Small className={
                      guild.weeklyGrowth >= 0 ? 'text-green-500' : 'text-red-500'
                    }>
                      {guild.weeklyGrowth > 0 ? '+' : ''}{guild.weeklyGrowth}%
                    </Typography.Small>
                  </div>
                </div>
              </div>

              {/* Progress to next rank */}
              {index > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Typography.Small className="text-gray-500">
                      To Next Rank
                    </Typography.Small>
                    <Typography.Small className="text-gray-500">
                      <AnimatedNumber 
                        value={guild.toNextRank} 
                        precision={2}
                        prefix="⟁ "
                      />
                    </Typography.Small>
                  </div>
                  <Progress 
                    value={guild.totalStaked}
                    max={guild.totalStaked + guild.toNextRank}
                    variant="primary"
                    size="sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Past Winners */}
        <div>
          <Typography.Label className="mb-3">Past Winners</Typography.Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weeklyRewards.pastWinners.map((winner, index) => (
              <div 
                key={index}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <Typography.Small className="text-gray-500">
                  Week {winner.week}
                </Typography.Small>
                <Typography.Body className="font-semibold">
                  {winner.name}
                </Typography.Body>
                <Typography.Small>
                  <AnimatedNumber 
                    value={winner.reward} 
                    precision={2}
                    prefix="⟁ "
                  />
                </Typography.Small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GuildLeaderboard;