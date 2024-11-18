import React, { useEffect } from 'react';
import { Notification } from './Notification';
import { useNotifications } from '@/lib/hooks/useNotifications';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  useEffect(() => {
    const timers = notifications.map(notification => {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);

      return timer;
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, removeNotification]);

  return (
    <>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
};