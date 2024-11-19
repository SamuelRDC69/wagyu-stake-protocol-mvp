import React, { useEffect } from 'react';
import { useNotifications } from '../lib/hooks/useNotifications';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { ExternalLink } from 'lucide-react';

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
        <AlertDialog key={notification.id}>
          <AlertDialogContent 
            className={`fixed ${
              notification.position === 'top-right' 
                ? 'top-4 right-4' 
                : notification.position === 'bottom-right'
                ? 'bottom-20 right-4'
                : 'bottom-20 left-1/2 -translate-x-1/2'
            } ${
              notification.variant === 'success'
                ? 'bg-green-500/90'
                : notification.variant === 'error'
                ? 'bg-red-500/90'
                : 'bg-yellow-500/90'
            } text-white p-4 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-bottom-5`}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-semibold">
                {notification.message}
              </AlertDialogTitle>
              {notification.amount && (
                <AlertDialogDescription className="text-white/90">
                  {notification.amount}
                </AlertDialogDescription>
              )}
              {notification.txid && (
                <a
                  href={`https://wax.bloks.io/transaction/${notification.txid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm flex items-center gap-1 text-white/90 hover:text-white mt-2"
                >
                  View Transaction <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </AlertDialogHeader>
            <button
              onClick={() => removeNotification(notification.id)}
              className="absolute top-2 right-2 text-white/60 hover:text-white"
            >
              ✕
            </button>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </>
  );
};