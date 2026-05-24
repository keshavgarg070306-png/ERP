import { create } from 'zustand';
import { apiFetch } from '../utils/api';

export interface NotificationItem {
  id: number;
  type: 'stock_alert' | 'new_order' | 'invoice_overdue' | 'payroll_due';
  title: string;
  message: string;
  status: 'UNREAD' | 'READ';
  createdAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addLocalNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt'>) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const data = await apiFetch('/notifications');
      const unread = data.filter((n: NotificationItem) => n.status === 'UNREAD').length;
      set({ notifications: data, unreadCount: unread, isLoading: false });
    } catch (err) {
      console.error('Fetch notifications error:', err);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
      const updated = get().notifications.map((n) =>
        n.id === id ? { ...n, status: 'READ' as const } : n
      );
      const unread = updated.filter((n) => n.status === 'UNREAD').length;
      set({ notifications: updated, unreadCount: unread });
    } catch (err) {
      console.error('Mark read error:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'PUT' });
      const updated = get().notifications.map((n) => ({ ...n, status: 'READ' as const }));
      set({ notifications: updated, unreadCount: 0 });
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  },

  addLocalNotification: (notification) => {
    const newNotif: NotificationItem = {
      ...notification,
      id: Math.random(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newNotif, ...get().notifications];
    const unread = updated.filter((n) => n.status === 'UNREAD').length;
    set({ notifications: updated, unreadCount: unread });
  },
}));
