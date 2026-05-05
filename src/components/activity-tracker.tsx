'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from '@/components/session-provider';

export function ActivityTracker() {
  const pathname = usePathname();
  const { user } = useSession();
  const pageEnterAtRef = useRef<number>(Date.now());

  useEffect(() => {
    pageEnterAtRef.current = Date.now();
  }, [pathname]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const submitActivity = () => {
      const durationMs = Date.now() - pageEnterAtRef.current;
      if (durationMs < 1000) {
        return;
      }

      fetch('/api/analytics/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagePath: pathname,
          durationMs,
        }),
        credentials: 'include',
        keepalive: true,
      }).catch(() => {
        // Activity should be fire-and-forget.
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        submitActivity();
      } else {
        pageEnterAtRef.current = Date.now();
      }
    };

    window.addEventListener('beforeunload', submitActivity);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      submitActivity();
      window.removeEventListener('beforeunload', submitActivity);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [pathname, user]);

  return null;
}
