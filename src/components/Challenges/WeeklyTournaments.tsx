// src/components/Challenges/WeeklyTournaments.tsx
import { useState } from 'react';
import { 
  Card, 
  Typography, 
  Badge, 
  Button,
  AnimatedNumber,
  Progress, 
  Tooltip 
} from '../common';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { useChallenges } from '../../hooks/useChallenges';
import { 
  Trophy,
  Users,
  Clock,
  TrendingUp,
  Award,
  Shield 
} from 'lucide-react';

const WeeklyTournaments = () => {
  const { 
    tournaments,
    activeTournament,
    leaderboard,
    playerStats,
    timeUntilEnd,
    registerForTournament
  } = useChallenges();

  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async (tournamentId: string) => {
    setIsRegistering(true);
    try {
      await registerForTournament(tournamentId);
    } catch (error) {
      console.error('Failed to register:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-primary" />
          <Typography.H3>Weekly Tournaments</Typography.H3>
        </div>
        {activeTournament && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <Typography.Small>
              Ends in {Math.floor(timeUntilEnd / 3600)}h {Math.floor((timeUntilEnd % 3600) / 60)}m
            </Typography.Small>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Active Tournament */}
        {activeTournament ? (
          <>
            <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Typography.H4>{activeTournament.name}</Typography.H4>
                  <Typography.Small className="text-gray-500">
                    {activeTournament.description}
                  </Typography.Small>
                </div>
                <Badge variant="warning">
                  {activeTournament.participants} Participants
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Typography.Label>Prize Pool</Typography.Label>
                  <Typography.H4>
                    <AnimatedNumber 
                      value={activeTournament.prizePool} 
                      precision={2}
                      prefix="⟁ "
                    />
                  </Typography.H4>
                </div>
                <div>
                  <Typography.Label>Your Position</Typography.Label>
                  <Typography.H4>#{playerStats.rank}</Typography.H4>
                </div>
                <div>
                  <Typography.Label>Score</Typography.Label>
                  <Typography.H4>{playerStats.score}</Typography.H4>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div>
              <Typography.Label className="mb-4">Your Performance</Typography.Label>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={playerStats.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#1cb095" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Leaderboard */}
            <div>
              <Typography.Label className="mb-4">Tournament Leaderboard</Typography.Label>
              <div className="space-y-3">
                {leaderboard.map((player, index) => (
                  <div 
                    key={player.id}
                    className={`p-4 rounded-lg ${
                      player.id === playerStats.id 
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Badge variant={index < 3 ? 'success' : 'default'}>
                          #{index + 1}
                        </Badge>
                        <div>
                          <Typography.Body>{player.name}</Typography.Body>
                          <div className="flex items-center gap-2">
                            <Shield className="w-3 h-3 text-primary" />
                            <Typography.Small className="text-gray-500">
                              {player.guild}
                            </Typography.Small>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Typography.Body>{player.score}</Typography.Body>
                        <Typography.Small className={
                          player.trend >= 0 ? 'text-green-500' : 'text-red-500'
                        }>
                          {player.trend > 0 ? '+' : ''}{player.trend}%
                        </Typography.Small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          // Upcoming Tournaments
          <div className="space-y-4">
            {tournaments.map(tournament => (
              <div 
                key={tournament.id}
                className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Typography.H4>{tournament.name}</Typography.H4>
                    <Typography.Small className="text-gray-500">
                      {tournament.description}
                    </Typography.Small>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isRegistering}
                    onClick={() => handleRegister(tournament.id)}
                  >
                    Register
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Typography.Label>Starts In</Typography.Label>
                    <Typography.Body>
                      {Math.floor(tournament.startsIn / 3600)}h
                    </Typography.Body>
                  </div>
                  <div>
                    <Typography.Label>Duration</Typography.Label>
                    <Typography.Body>{tournament.duration}h</Typography.Body>
                  </div>
                  <div>
                    <Typography.Label>Prize Pool</Typography.Label>
                    <Typography.Body>
                      <AnimatedNumber 
                        value={tournament.prizePool} 
                        precision={2}
                        prefix="⟁ "
                      />
                    </Typography.Body>
                  </div>
                  <div>
                    <Typography.Label>Registered</Typography.Label>
                    <Typography.Body>
                      {tournament.registered} players
                    </Typography.Body>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default WeeklyTournaments;