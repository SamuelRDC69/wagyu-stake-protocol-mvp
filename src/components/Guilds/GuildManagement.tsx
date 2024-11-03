// src/components/Guilds/GuildManagement.tsx
import { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Badge,
  AnimatedNumber,
  Progress, 
  Tooltip 
} from '../common';
import { useGuild } from '../../hooks/useGuild';
import { 
  Settings, 
  Users,
  Edit,
  Lock,
  Globe,
  AlertTriangle,
  Sword,
  Bookmark,
  MessageSquare 
} from 'lucide-react';

interface GuildSettings {
  name: string;
  description: string;
  privacy: 'public' | 'private' | 'invite';
  minStake: number;
  maxMembers: number;
  recruitingStatus: boolean;
  autoAcceptApplications: boolean;
  battleParticipationRequired: boolean;
  minimumActivityScore: number;
}

const GuildManagement = () => {
  const { 
    settings,
    updateSettings,
    userRole,
    guildStats,
    applications,
    announcements,
    createAnnouncement,
    handleApplication
  } = useGuild();

  const [isEditing, setIsEditing] = useState(false);
  const [newSettings, setNewSettings] = useState<GuildSettings>(settings);
  const [isProcessing, setIsProcessing] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const canManage = userRole === 'leader' || userRole === 'admin';

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      await updateSettings(newSettings);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnnouncement = async () => {
    if (!announcement.trim()) return;
    setIsProcessing(true);
    try {
      await createAnnouncement(announcement);
      setAnnouncement('');
    } catch (error) {
      console.error('Failed to create announcement:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" />
          <Typography.H3>Guild Management</Typography.H3>
        </div>
        {canManage && !isEditing && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditing(true)}
            leftIcon={<Edit className="w-4 h-4" />}
          >
            Edit Settings
          </Button>
        )}
      </div>

      <div className="space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Typography.Label>Members</Typography.Label>
            <div className="flex items-baseline gap-2">
              <Typography.H4>{guildStats.currentMembers}</Typography.H4>
              <Typography.Small className="text-gray-500">
                / {settings.maxMembers}
              </Typography.Small>
            </div>
          </div>
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
            <Typography.Label>Battle Win Rate</Typography.Label>
            <Typography.H4>{guildStats.winRate}%</Typography.H4>
          </div>
        </div>

        {/* Basic Settings */}
        <div className="space-y-4">
          <Typography.H4>Basic Settings</Typography.H4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Typography.Label>Guild Name</Typography.Label>
              <input
                type="text"
                value={isEditing ? newSettings.name : settings.name}
                onChange={(e) => setNewSettings({ ...newSettings, name: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 mt-1 rounded-lg bg-gray-100 dark:bg-gray-800"
              />
            </div>
            <div>
              <Typography.Label>Privacy</Typography.Label>
              <select
                value={isEditing ? newSettings.privacy : settings.privacy}
                onChange={(e) => setNewSettings({ 
                  ...newSettings, 
                  privacy: e.target.value as GuildSettings['privacy']
                })}
                disabled={!isEditing}
                className="w-full px-3 py-2 mt-1 rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="invite">Invite Only</option>
              </select>
            </div>
            <div>
              <Typography.Label>Minimum Stake</Typography.Label>
              <input
                type="number"
                value={isEditing ? newSettings.minStake : settings.minStake}
                onChange={(e) => setNewSettings({ 
                  ...newSettings, 
                  minStake: Number(e.target.value)
                })}
                disabled={!isEditing}
                className="w-full px-3 py-2 mt-1 rounded-lg bg-gray-100 dark:bg-gray-800"
              />
            </div>
            <div>
              <Typography.Label>Max Members</Typography.Label>
              <input
                type="number"
                value={isEditing ? newSettings.maxMembers : settings.maxMembers}
                onChange={(e) => setNewSettings({ 
                  ...newSettings, 
                  maxMembers: Number(e.target.value)
                })}
                disabled={!isEditing}
                className="w-full px-3 py-2 mt-1 rounded-lg bg-gray-100 dark:bg-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-4">
          <Typography.H4>Requirements</Typography.H4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sword className="w-4 h-4 text-primary" />
                <Typography.Body>Battle Participation Required</Typography.Body>
              </div>
              <input
                type="checkbox"
                checked={isEditing ? newSettings.battleParticipationRequired : settings.battleParticipationRequired}
                onChange={(e) => setNewSettings({ 
                  ...newSettings, 
                  battleParticipationRequired: e.target.checked 
                })}
                disabled={!isEditing}
                className="w-5 h-5"
              />
            </div>
            <div>
              <Typography.Label>Minimum Activity Score</Typography.Label>
              <Progress 
                value={isEditing ? newSettings.minimumActivityScore : settings.minimumActivityScore}
                max={100}
                variant="primary"
                size="md"
                showLabel
              />
              {isEditing && (
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newSettings.minimumActivityScore}
                  onChange={(e) => setNewSettings({ 
                    ...newSettings, 
                    minimumActivityScore: Number(e.target.value) 
                  })}
                  className="w-full mt-2"
                />
              )}
            </div>
          </div>
        </div>

        {/* Announcements */}
        {canManage && (
          <div className="space-y-4">
            <Typography.H4>Guild Announcement</Typography.H4>
            <div className="space-y-3">
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Write an announcement..."
                className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isProcessing}
                  onClick={handleAnnouncement}
                  leftIcon={<MessageSquare className="w-4 h-4" />}
                >
                  Post Announcement
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Save Changes */}
        {isEditing && (
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setNewSettings(settings);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={isProcessing}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GuildManagement;