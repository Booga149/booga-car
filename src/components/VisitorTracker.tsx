"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const TRACK_INTERVAL = 5 * 60 * 1000; // 5 minutes between tracks per session

export default function VisitorTracker() {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/admin')) return;

    const lastTrack = sessionStorage.getItem('_vt_last');
    const now = Date.now();

    // Skip if tracked recently (within 5 min)
    if (lastTrack && now - parseInt(lastTrack) < TRACK_INTERVAL) return;

    // Send tracking data
    const trackVisit = async () => {
      try {
        await fetch('/api/track-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: pathname,
            referrer: document.referrer || null,
            userId: user?.id || null,
            userEmail: user?.email || null,
          }),
        });
        sessionStorage.setItem('_vt_last', now.toString());
      } catch {
        // Non-critical - fail silently
      }
    };

    trackVisit();
  }, [pathname, user]);

  return null; // Invisible component
}
