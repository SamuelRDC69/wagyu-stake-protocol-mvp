// src/components/Settings/index.tsx
import AccountSettings from './AccountSettings';
import GamePreferences from './GamePreferences';
import NotificationSettings from './NotificationSettings';
import NetworkSettings from './NetworkSettings';

const Settings = () => {
  return (
    <div className="space-y-6">
      <AccountSettings />
      <GamePreferences />
      <NotificationSettings />
      <NetworkSettings />
    </div>
  );
};

export default Settings;
export {
  AccountSettings,
  GamePreferences,
  NotificationSettings,
  NetworkSettings
};