"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type AdminNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [newToast, setNewToast] = useState<AdminNotification | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check session first
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;
      if (email && (email.startsWith('mrmrx2824') || email.startsWith('admin'))) {
        setIsAdmin(true);
        fetchUnread();
        subscribeRealtime();
      }
    };

    // Fetch initial
    const fetchUnread = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_notifications')
          .select('*')
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(10);
        if (data) setNotifications(data);
      } catch (e) {
        console.warn("Notifications table not ready.");
      }
    };

    // Subscribe to realtime inserts
    let channel: any;
    const subscribeRealtime = () => {
      channel = supabase
        .channel('admin_notifications_channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
          (payload) => {
            const newNotif = payload.new as AdminNotification;
            setNotifications(prev => [newNotif, ...prev]);
            setNewToast(newNotif);
            setTimeout(() => setNewToast(null), 7000);
          }
        )
        .subscribe();
    };

    checkSession();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await supabase.from('admin_notifications').update({ is_read: true }).eq('id', id);
  };

  return { notifications, newToast, markAsRead, setNewToast };
}
