'use client';

import { useEffect } from 'react';

// ─────────────────────────────────────────────────────────
// CRITICAL: Capture beforeinstallprompt as early as possible,
// at module load time — before React even hydrates.
// The event fires on first page load and won't repeat if missed.
// ─────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the browser's default mini-infobar
    e.preventDefault();
    // Store it globally so any component can access it later
    (window as any).__pwaInstallPrompt = e;
    // Notify any mounted React components
    window.dispatchEvent(new CustomEvent('pwaPromptReady'));
  });

  window.addEventListener('appinstalled', () => {
    (window as any).__pwaInstallPrompt = null;
    (window as any).__pwaInstalled = true;
    window.dispatchEvent(new CustomEvent('pwaInstalled'));
  });
}

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('SW registered:', reg.scope);
        })
        .catch((err) => {
          console.error('SW registration failed:', err);
        });
    }
  }, []);

  return null;
}
