export const calculateTimeLeft = (endTime: string): number => {
  const end = new Date(endTime).getTime();
  const now = new Date().getTime();
  return Math.max(0, Math.floor((end - now) / 1000));
};

export const formatTimeLeft = (seconds: number): string => {
  if (seconds <= 0) return 'Ready';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    remainingSeconds.toString().padStart(2, '0')
  ].join(':');
};

export const calculateCooldownProgress = (
  cooldownEndAt: string,
  cooldownSeconds: number
): number => {
  const timeLeft = calculateTimeLeft(cooldownEndAt);
  return ((cooldownSeconds - timeLeft) / cooldownSeconds) * 100;
};

export const isActionReady = (cooldownEndAt: string): boolean => {
  return calculateTimeLeft(cooldownEndAt) <= 0;
};

export const formatLastAction = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};