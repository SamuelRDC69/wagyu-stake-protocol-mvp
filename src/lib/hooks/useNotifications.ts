import { create } from 'zustand';

export interface Notification {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'pending';
  txid?: string;
  amount?: string;
  position?: 'top-right' | 'bottom-right' | 'bottom-center';
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotifications = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => 
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: Date.now().toString() }
      ]
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    })),
  clearNotifications: () => set({ notifications: [] })
}));