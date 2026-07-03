'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  X,
  Smartphone,
  Monitor,
  Share,
  MoreVertical,
  Plus,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'ios' | 'android' | 'desktop' | 'unknown';
type InstallState = 'idle' | 'prompt-ready' | 'installing' | 'installed' | 'ios-guide' | 'android-guide';

/* ─────────────────────────────────────────────
   Detect platform
───────────────────────────────────────────── */
function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/* ─────────────────────────────────────────────
   iOS Install Guide Modal
───────────────────────────────────────────── */
function IosGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Purple glow accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-zinc-200 p-1.5">
                <img src="/image.png" alt="App Icon" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg leading-tight">Install App</h3>
                <p className="text-xs text-zinc-400">Rachna Rivo</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-zinc-300">
            Install <strong className="text-white">Rachna Rivo</strong> on your iPhone/iPad in 2 easy steps:
          </p>

          {/* Steps */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <span className="text-purple-400 font-bold text-sm">1</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-200">
                  Tap the <strong className="text-white">Share</strong> button
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Share className="h-5 w-5 text-blue-400" />
                  <span className="text-xs text-zinc-500">in Safari's bottom toolbar</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                <span className="text-pink-400 font-bold text-sm">2</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-200">
                  Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-4 h-4 rounded border border-zinc-400 flex items-center justify-center">
                    <Plus className="h-2.5 w-2.5 text-zinc-400" />
                  </div>
                  <span className="text-xs text-zinc-500">then tap Add</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-500 text-center">
            The app icon will appear on your Home Screen ✨
          </p>

          <Button onClick={onClose} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0">
            Got it!
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Android / Desktop native install modal
───────────────────────────────────────────── */
function NativeInstallModal({
  platform,
  onInstall,
  onClose,
  isInstalling,
}: {
  platform: Platform;
  onInstall: () => void;
  onClose: () => void;
  isInstalling: boolean;
}) {
  const features = [
    { icon: '⚡', text: 'Instant launch — no browser needed' },
    { icon: '📱', text: 'Lives on your home screen / desktop' },
    { icon: '🔔', text: 'Feels like a native app' },
    { icon: '📶', text: 'Works even in low connectivity' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-zinc-200 p-2">
                <img src="/image.png" alt="App Icon" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg leading-tight">Rachna Rivo</h3>
                <p className="text-xs text-zinc-400">Install as an app</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {platform === 'android' ? (
                    <Smartphone className="h-3 w-3 text-green-400" />
                  ) : (
                    <Monitor className="h-3 w-3 text-blue-400" />
                  )}
                  <span className="text-xs text-zinc-500">
                    {platform === 'android' ? 'Android' : 'Windows / Mac / Linux'}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                <span className="text-base">{f.icon}</span>
                <span className="text-sm text-zinc-300">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Button
              onClick={onInstall}
              disabled={isInstalling}
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 font-semibold text-sm"
            >
              {isInstalling ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Installing…</>
              ) : (
                <><Download className="h-4 w-4 mr-2" /> Install App</>
              )}
            </Button>
            <button
              onClick={onClose}
              className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1"
            >
              Not now
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Main Install Button (exported)
───────────────────────────────────────────── */
export function InstallPwaButton({ variant = 'header' }: { variant?: 'header' | 'mobile' }) {
  const [installState, setInstallState] = useState<InstallState>('idle');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setPlatform(detectPlatform());

    // Already installed as PWA
    if (isStandalone()) {
      setInstallState('installed');
      return;
    }

    // Listen for native install prompt (Chrome / Edge / Samsung / Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallState('prompt-ready');
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detect successful install
    window.addEventListener('appinstalled', () => {
      setInstallState('installed');
      setDeferredPrompt(null);
      setShowModal(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleButtonClick = useCallback(() => {
    const p = detectPlatform();
    if (p === 'ios') {
      setShowModal(true);
      setInstallState('ios-guide');
    } else if (deferredPrompt) {
      setShowModal(true);
    } else {
      // Fallback: show Android/desktop manual guide
      setShowModal(true);
      setInstallState('android-guide');
    }
  }, [deferredPrompt]);

  const handleNativeInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setInstallState('installing');
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallState('installed');
      } else {
        setInstallState('prompt-ready');
      }
    } catch {
      setInstallState('prompt-ready');
    } finally {
      setShowModal(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    if (installState !== 'installed') {
      // Restore previous state
      setInstallState(deferredPrompt ? 'prompt-ready' : 'idle');
    }
  }, [installState, deferredPrompt]);

  // Don't render server-side or when already installed as standalone
  if (!isMounted) return null;
  if (isStandalone()) return null;

  // Only show if: iOS (always show), native prompt available, or on desktop/android (show guide)
  const shouldShow = platform === 'ios' || deferredPrompt !== null || platform !== 'unknown';

  if (!shouldShow) return null;

  const isInstalling = installState === 'installing';
  const isInstalled = installState === 'installed';

  /* ── Button styles by variant ── */
  if (variant === 'mobile') {
    return (
      <>
        <button
          onClick={handleButtonClick}
          disabled={isInstalled}
          className="transition-colors text-foreground/60 hover:text-foreground flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInstalled ? (
            <><CheckCircle2 className="h-5 w-5 text-green-500" /> App Installed</>
          ) : (
            <><Download className="h-5 w-5" /> Install App</>
          )}
        </button>

        <AnimatePresence>
          {showModal && (
            platform === 'ios' ? (
              <IosGuideModal onClose={closeModal} />
            ) : (
              <NativeInstallModal
                platform={platform}
                onInstall={handleNativeInstall}
                onClose={closeModal}
                isInstalling={isInstalling}
              />
            )
          )}
        </AnimatePresence>
      </>
    );
  }

  // Header variant
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <Button
          onClick={handleButtonClick}
          disabled={isInstalled}
          size="sm"
          variant="outline"
          className="gap-2 border-purple-500/40 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 hover:border-purple-400/60 transition-all disabled:opacity-60"
        >
          {isInstalled ? (
            <><CheckCircle2 className="h-4 w-4 text-green-400" /><span className="hidden sm:inline">Installed</span></>
          ) : (
            <><Download className="h-4 w-4" /><span className="hidden sm:inline">Install App</span></>
          )}
        </Button>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          platform === 'ios' ? (
            <IosGuideModal onClose={closeModal} />
          ) : (
            <NativeInstallModal
              platform={platform}
              onInstall={handleNativeInstall}
              onClose={closeModal}
              isInstalling={isInstalling}
            />
          )
        )}
      </AnimatePresence>
    </>
  );
}
