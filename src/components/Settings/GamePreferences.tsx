// src/components/Settings/GamePreferences.tsx
import { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Progress,
  Tooltip 
} from '../common';
import { useSettings } from '../../hooks/useSettings';
import { 
  Settings,
  Monitor,
  Volume2,
  Bell,
  Sun,
  Moon,
  Laptop,
  Languages,
  Gauge
} from 'lucide-react';

const GamePreferences = () => {
  const { 
    preferences,
    updatePreferences,
    availableLanguages,
    performancePresets
  } = useSettings();

  const [isUpdating, setIsUpdating] = useState(false);
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updatePreferences(localPrefs);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setLocalPrefs(prev => ({ ...prev, theme }));
  };

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" />
          <Typography.H3>Game Preferences</Typography.H3>
        </div>
        {JSON.stringify(localPrefs) !== JSON.stringify(preferences) && (
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
        {/* Theme Settings */}
        <div>
          <Typography.Label className="mb-4">Theme</Typography.Label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'dark', icon: Moon, label: 'Dark' },
              { value: 'system', icon: Laptop, label: 'System' }
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => handleThemeChange(value as any)}
                className={`p-4 rounded-lg flex flex-col items-center gap-2 ${
                  localPrefs.theme === value 
                    ? 'bg-primary/20 border border-primary/20' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <Icon className="w-6 h-6 text-primary" />
                <Typography.Small>
                  {label}
                </Typography.Small>
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Languages className="w-4 h-4 text-primary" />
            <Typography.Label>Language</Typography.Label>
          </div>
          <select
            value={localPrefs.language}
            onChange={(e) => setLocalPrefs(prev => ({ 
              ...prev, 
              language: e.target.value 
            }))}
            className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
          >
            {availableLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>
        </div>

        {/* Audio Settings */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Volume2 className="w-4 h-4 text-primary" />
            <Typography.Label>Audio</Typography.Label>
          </div>
          <div className="space-y-4">
            {['master', 'music', 'effects', 'ambient'].map(type => (
              <div key={type}>
                <div className="flex justify-between items-center mb-2">
                  <Typography.Small className="capitalize">
                    {type} Volume
                  </Typography.Small>
                  <Typography.Small>
                    {localPrefs.audio[type]}%
                  </Typography.Small>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localPrefs.audio[type]}
                  onChange={(e) => setLocalPrefs(prev => ({
                    ...prev,
                    audio: {
                      ...prev.audio,
                      [type]: Number(e.target.value)
                    }
                  }))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Visual Settings */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-4 h-4 text-primary" />
            <Typography.Label>Visual Settings</Typography.Label>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Typography.Body>Animation Quality</Typography.Body>
              <select
                value={localPrefs.visual.animationQuality}
                onChange={(e) => setLocalPrefs(prev => ({
                  ...prev,
                  visual: {
                    ...prev.visual,
                    animationQuality: e.target.value
                  }
                }))}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <Typography.Body>Particle Effects</Typography.Body>
                <Typography.Small className="text-gray-500">
                  Show visual effects during actions
                </Typography.Small>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.visual.particleEffects}
                onChange={(e) => setLocalPrefs(prev => ({
                  ...prev,
                  visual: {
                    ...prev.visual,
                    particleEffects: e.target.checked
                  }
                }))}
              />
            </div>
          </div>
        </div>

        {/* Performance */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="w-4 h-4 text-primary" />
            <Typography.Label>Performance</Typography.Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {performancePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setLocalPrefs(prev => ({
                  ...prev,
                  performancePreset: preset.id
                }))}
                className={`p-4 rounded-lg text-left ${
                  localPrefs.performancePreset === preset.id
                    ? 'bg-primary/20 border border-primary/20'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <Typography.Body className="font-medium">
                  {preset.name}
                </Typography.Body>
                <Typography.Small className="text-gray-500">
                  {preset.description}
                </Typography.Small>
                <div className="mt-2">
                  <Progress 
                    value={preset.performance}
                    max={100}
                    variant={
                      preset.performance > 80 ? 'success' :
                      preset.performance > 50 ? 'warning' :
                      'danger'
                    }
                    size="sm"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-primary" />
            <Typography.Label>In-Game Notifications</Typography.Label>
          </div>
          <div className="space-y-3">
            {[
              { key: 'rewards', label: 'Reward Notifications' },
              { key: 'claims', label: 'Claim Reminders' },
              { key: 'guild', label: 'Guild Activities' },
              { key: 'challenges', label: 'Challenge Updates' }
            ].map(({ key, label }) => (
              <div 
                key={key}
                className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <Typography.Body>{label}</Typography.Body>
                <input
                  type="checkbox"
                  checked={localPrefs.notifications[key]}
                  onChange={(e) => setLocalPrefs(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      [key]: e.target.checked
                    }
                  }))}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GamePreferences;