// src/components/Settings/NotificationSettings.tsx
import { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Badge,
  Tooltip 
} from '../common';
import { useSettings } from '../../hooks/useSettings';
import { 
  Bell,
  Mail,
  Smartphone,
  Globe,
  Clock,
  Zap,
  AlertTriangle
} from 'lucide-react';

const NotificationSettings = () => {
  const { 
    notificationPreferences,
    updateNotificationSettings,
    channels,
    deviceInfo
  } = useSettings();

  const [isUpdating, setIsUpdating] = useState(false);
  const [localSettings, setLocalSettings] = useState(notificationPreferences);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updateNotificationSettings(localSettings);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-primary" />
          <Typography.H3>Notification Settings</Typography.H3>
        </div>
        {JSON.stringify(localSettings) !== JSON.stringify(notificationPreferences) && (
          <Button
            variant="primary"
            size="sm"
            isLoading={isUpdating}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Notification Channels */}
        <div>
          <Typography.Label className="mb-4">Notification Channels</Typography.Label>
          <div className="space-y-3">
            {channels.map(channel => (
              <div 
                key={channel.id}
                className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    {channel.type === 'email' ? (
                      <Mail className="w-4 h-4 text-primary" />
                    ) : channel.type === 'push' ? (
                      <Smartphone className="w-4 h-4 text-primary" />
                    ) : (
                      <Globe className="w-4 h-4 text-primary" />
                    )}
                    <div>
                      <Typography.Body>{channel.name}</Typography.Body>
                      <Typography.Small className="text-gray-500">
                        {channel.description}
                      </Typography.Small>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.channels[channel.id]}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      channels: {
                        ...prev.channels,
                        [channel.id]: e.target.checked
                      }
                    }))}
                  />
                </div>
                {channel.type === 'push' && deviceInfo && (
                  <div className="mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded">
                    <Typography.Small>
                      Current Device: {deviceInfo.name}
                    </Typography.Small>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Event Types */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <Typography.Label>Event Notifications</Typography.Label>
          </div>
          <div className="space-y-3">
            {[
              { key: 'rewards', label: 'Rewards & Claims', description: 'Updates about earned rewards and claim opportunities' },
              { key: 'guild', label: 'Guild Activity', description: 'Guild battles, events, and member updates' },
              { key: 'challenges', label: 'Challenges', description: 'New challenges and completion status' },
              { key: 'system', label: 'System Updates', description: 'Important system announcements and maintenance' }
            ].map(({ key, label, description }) => (
              <div 
                key={key}
                className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <Typography.Body>{label}</Typography.Body>
                  <Typography.Small className="text-gray-500">
                    {description}
                  </Typography.Small>
                </div>
                <select
                  value={localSettings.eventTypes[key]}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    eventTypes: {
                      ...prev.eventTypes,
                      [key]: e.target.value
                    }
                  }))}
                  className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
                >
                  <option value="all">All</option>
                  <option value="important">Important Only</option>
                  <option value="none">None</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-primary" />
            <Typography.Label>Quiet Hours</Typography.Label>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={localSettings.quietHours.enabled}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  quietHours: {
                    ...prev.quietHours,
                    enabled: e.target.checked
                  }
                }))}
              />
              <Typography.Body>Enable Quiet Hours</Typography.Body>
            </div>
            {localSettings.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography.Label>Start Time</Typography.Label>
                  <input
                    type="time"
                    value={localSettings.quietHours.start}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      quietHours: {
                        ...prev.quietHours,
                        start: e.target.value
                      }
                    }))}
                    className="w-full mt-1 p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <Typography.Label>End Time</Typography.Label>
                  <input
                    type="time"
                    value={localSettings.quietHours.end}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      quietHours: {
                        ...prev.quietHours,
                        end: e.target.value
                      }
                    }))}
                    className="w-full mt-1 p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Critical Notifications */}
        <div className="p-4 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <Typography.Label>Critical Notifications</Typography.Label>
          </div>
          <Typography.Small className="text-gray-500 mb-4 block">
            These notifications will always be sent, regardless of other settings
          </Typography.Small>
          <div className="space-y-2">
            {[
              'Security alerts',
              'Account status changes',
              'Emergency system updates'
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <Typography.Small>{item}</Typography.Small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NotificationSettings;