import React, { useEffect } from 'react';
import { Notification } from './ui/Notification';
import { useNotifications } from '@/lib/hooks/useNotifications';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  useEffect(() => {
    // Auto-remove notifications after 5 seconds
    const timers = notifications.map(notification => {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);

      return timer;
    });

    // Cleanup timers on unmount
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, removeNotification]);

  return (
    <>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          variant={notification.variant}
          message={notification.message}
          txid={notification.txid}
          amount={notification.amount}
          position={notification.position}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
};