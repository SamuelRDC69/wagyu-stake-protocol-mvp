// src/components/Challenges/SpecialEvents.tsx
import { useState } from 'react';
import { 
  Card, 
  Typography, 
  Badge, 
  Button,
  Progress,
  AnimatedNumber 
} from '../common';
import { useChallenges } from '../../hooks/useChallenges';
import { 
  Gift, 
  Star,
  Trophy,
  Crown,
  Timer,
  Users 
} from 'lucide-react';

const SpecialEvents = () => {
  const { 
    specialEvents,
    activeEvent,
    eventProgress,
    eventRewards,
    participateInEvent
  } = useChallenges();

  const [isParticipating, setIsParticipating] = useState(false);

  const handleParticipate = async (eventId: string) => {
    setIsParticipating(true);
    try {
      await participateInEvent(eventId);
    } catch (error) {
      console.error('Failed to participate:', error);
    } finally {
      setIsParticipating(false);
    }
  };

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-primary" />
          <Typography.H3>Special Events</Typography.H3>
        </div>
        <Badge variant="warning">Limited Time</Badge>
      </div>

      <div className="space-y-6">
        {/* Active Event */}
        {activeEvent && (
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <Typography.H4>{activeEvent.name}</Typography.H4>
                </div>
                <Typography.Small className="text-gray-500">
                  {activeEvent.description}
                </Typography.Small>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-gray-500" />
                <Typography.Small>
                  Ends in {Math.ceil(activeEvent.timeRemaining / 3600)}h
                </Typography.Small>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Typography.Label className="mb-2">Event Progress</Typography.Label>
                <Progress 
                  value={eventProgress.current}
                  max={eventProgress.target}
                  variant="primary"
                  size="lg"
                  showLabel
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Typography.Label>Participants</Typography.Label>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <Typography.H4>{activeEvent.participants}</Typography.H4>
                  </div>
                </div>
                <div>
                  <Typography.Label>Your Rank</Typography.Label>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    <Typography.H4>#{eventProgress.rank}</Typography.H4>
                  </div>
                </div>
                <div>
                  <Typography.Label>Prize Pool</Typography.Label>
                  <Typography.H4>
                    <AnimatedNumber 
                      value={activeEvent.prizePool} 
                      precision={2}
                      prefix="⟁ "
                    />
                  </Typography.H4>
                </div>
              </div>

              {/* Reward Tiers */}
              <div>
                <Typography.Label className="mb-3">Reward Tiers</Typography.Label>
                <div className="space-y-3">
                  {eventRewards.map((tier, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg ${
                        tier.unlocked 
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Crown className={`w-4 h-4 ${
                            tier.unlocked ? 'text-yellow-500' : 'text-gray-500'
                          }`} />
                          <Typography.Body>Tier {index + 1}</Typography.Body>
                        </div>
                        <Typography.Body>
                          <AnimatedNumber 
                            value={tier.reward} 
                            precision={2}
                            prefix="⟁ "
                          />
                        </Typography.Body>
                      </div>
                      <Progress 
                        value={eventProgress.current}
                        max={tier.requirement}
                        variant={tier.unlocked ? 'success' : 'primary'}
                        size="sm"
                        className="mt-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        <div className="space-y-4">
          {specialEvents.map(event => (
            <div 
              key={event.id}
              className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Typography.Body className="font-semibold">
                    {event.name}
                  </Typography.Body>
                  <Typography.Small className="text-gray-500">
                    {event.description}
                  </Typography.Small>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isParticipating}
                  onClick={() => handleParticipate(event.id)}
                >
                  Participate
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography.Label>Starts In</Typography.Label>
                  <Typography.Body>
                    {Math.ceil(event.startsIn / 3600)}h
                  </Typography.Body>
                </div>
                <div>
                  <Typography.Label>Prize Pool</Typography.Label>
                  <Typography.Body>
                    <AnimatedNumber 
                      value={event.prizePool} 
                      precision={2}
                      prefix="⟁ "
                    />
                  </Typography.Body>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default SpecialEvents;