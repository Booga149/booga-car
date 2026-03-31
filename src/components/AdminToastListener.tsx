"use client";
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { useToast } from '@/context/ToastContext';

export default function AdminToastListener() {
  const { newToast, setNewToast } = useAdminNotifications();
  const { addToast } = useToast();

  useEffect(() => {
    if (newToast) {
      // Direct call to addToast for ANY new admin notification
      // We assume the hook correctly filters for admin_notifications table
      const type = newToast.type === 'SECURITY_ALERT' ? 'error' : 'info';
      const icon = newToast.type === 'SECURITY_ALERT' ? '🚨 ' : '🔔 ';
      
      addToast(`${icon} ${newToast.title}: ${newToast.message}`, type);
      
      // Clear the local state so we don't trigger again for the same ID
      setNewToast(null);
    }
  }, [newToast, addToast, setNewToast]);

  return null; // This component doesn't render anything itself
}
