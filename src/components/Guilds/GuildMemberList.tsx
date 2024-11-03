// src/components/Guilds/GuildMemberList.tsx
import { useState } from 'react';
import { 
  Card, 
  Typography, 
  Badge, 
  Button,
  AnimatedNumber,
  Progress 
} from '../common';
import { useGuild } from '../../hooks/useGuild';
import { 
  Users, 
  Star, 
  Shield,
  TrendingUp,
  Settings,
  UserPlus,
  UserMinus 
} from 'lucide-react';

const GuildMemberList = () => {
  const { 
    members, 
    guildStats,
    userRole,
    kickMember,
    promoteMember,
    inviteMember
  } = useGuild();

  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [isManaging, setIsManaging] = useState(false);

  const isAdmin = userRole === 'admin' || userRole === 'leader';

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'leader':
        return <Badge variant="success">Leader</Badge>;
      case 'admin':
        return <Badge variant="warning">Admin</Badge>;
      default:
        return <Badge variant="default">Member</Badge>;
    }
  };

  const handleMemberAction = async (action: 'kick' | 'promote', memberId: string) => {
    setIsManaging(true);
    try {
      if (action === 'kick') {
        await kickMember(memberId);
      } else {
        await promoteMember(memberId);
      }
    } catch (error) {
      console.error(`Failed to ${action} member:`, error);
    } finally {
      setIsManaging(false);
      setSelectedMember(null);
    }
  };

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <Typography.H3>Guild Members</Typography.H3>
        </div>
        {isAdmin && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => inviteMember()}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Invite Member
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Guild Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Typography.Label>Total Staked</Typography.Label>
            <Typography.H4>
              <AnimatedNumber 
                value={guildStats.totalStaked} 
                precision={2}
                prefix="⟁ "
              />
            </Typography.H4>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Typography.Label>Average Contribution</Typography.Label>
            <Typography.H4>
              <AnimatedNumber 
                value={guildStats.avgContribution} 
                precision={2}
                prefix="⟁ "
              />
            </Typography.H4>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Typography.Label>Member Capacity</Typography.Label>
            <Typography.H4>
              {members.length} / {guildStats.maxMembers}
            </Typography.H4>
          </div>
        </div>

        {/* Member List */}
        <div className="space-y-4">
          {members.map(member => (
            <div 
              key={member.id}
              className={`p-4 rounded-lg ${
                selectedMember === member.id
                  ? 'bg-primary/10 border border-primary/20'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <Typography.Body className="font-semibold">
                      {member.name}
                    </Typography.Body>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(member.role)}
                      <Typography.Small className="text-gray-500">
                        Joined {member.joinDate}
                      </Typography.Small>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <AnimatedNumber 
                      value={member.contribution} 
                      precision={2}
                      prefix="⟁ "
                    />
                    <div className="flex items-center gap-1 justify-end">
                      <TrendingUp className={`w-3 h-3 ${
                        member.weeklyChange >= 0 ? 'text-green-500' : 'text-red-500'
                      }`} />
                      <Typography.Small className={
                        member.weeklyChange >= 0 ? 'text-green-500' : 'text-red-500'
                      }>
                        {member.weeklyChange}%
                      </Typography.Small>
                    </div>
                  </div>

                  {isAdmin && member.role !== 'leader' && (
                    <div className="flex gap-2">
                      {member.role !== 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          isLoading={isManaging && selectedMember === member.id}
                          onClick={() => handleMemberAction('promote', member.id)}
                          leftIcon={<Shield className="w-4 h-4" />}
                        >
                          Promote
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={isManaging && selectedMember === member.id}
                        onClick={() => handleMemberAction('kick', member.id)}
                        leftIcon={<UserMinus className="w-4 h-4" />}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Member Stats */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Typography.Small className="text-gray-500">Battles Won</Typography.Small>
                  <Typography.Body>{member.stats.battlesWon}</Typography.Body>
                </div>
                <div>
                  <Typography.Small className="text-gray-500">Claims</Typography.Small>
                  <Typography.Body>{member.stats.totalClaims}</Typography.Body>
                </div>
                <div>
                  <Typography.Small className="text-gray-500">Win Rate</Typography.Small>
                  <Typography.Body>{member.stats.winRate}%</Typography.Body>
                </div>
                <div>
                  <Typography.Small className="text-gray-500">Activity Score</Typography.Small>
                  <Progress 
                    value={member.stats.activityScore}
                    max={100}
                    variant="primary"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default GuildMemberList;