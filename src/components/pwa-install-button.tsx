'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  X,
  Share,
  Plus,
  CheckCircle2,
  Loader2,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ── Types ── */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

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

/* ── iOS Guide Modal ── */
function IosGuideModal({ onClose }: { onClose: () => void }) {
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
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-zinc-200 p-1.5">
                <img src="/image.png" alt="App Icon" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Install App</h3>
                <p className="text-xs text-zinc-400">Rachna Rivo • iPhone / iPad</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-400 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="text-sm text-zinc-200">Tap the <strong className="text-white">Share</strong> button</p>
                <div className="flex items-center gap-1 mt-1">
                  <Share className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-zinc-500">in Safari's bottom toolbar</span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
              <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-pink-400 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="text-sm text-zinc-200">Tap <strong className="text-white">"Add to Home Screen"</strong></p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-4 h-4 rounded border border-zinc-400 flex items-center justify-center">
                    <Plus className="h-2.5 w-2.5 text-zinc-400" />
                  </div>
                  <span className="text-xs text-zinc-500">then tap Add</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-500 text-center">The app icon will appear on your Home Screen ✨</p>
          <Button onClick={onClose} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0">
            Got it!
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Native Install Modal (Chrome/Edge/Android) ── */
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
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
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
                <h3 className="font-bold text-white text-lg">Rachna Rivo</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  {platform === 'android'
                    ? <Smartphone className="h-3 w-3 text-green-400" />
                    : <Monitor className="h-3 w-3 text-blue-400" />
                  }
                  <span className="text-xs text-zinc-500">
                    {platform === 'android' ? 'Android App' : 'Desktop App'}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2">
            {[
              { icon: '⚡', text: 'Launch instantly — no browser needed' },
              { icon: '📱', text: 'Pinned to home screen / taskbar' },
              { icon: '🌐', text: 'Works even with slow connectivity' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                <span>{f.icon}</span>
                <span className="text-sm text-zinc-300">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Button
              onClick={onInstall}
              disabled={isInstalling}
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 font-semibold"
            >
              {isInstalling
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Installing…</>
                : <><Download className="h-4 w-4 mr-2" /> Install Now</>
              }
            </Button>
            <button onClick={onClose} className="w-full text-xs text-zinc-500 hover:text-zinc-300 py-1">
              Not now
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main exported component ── */
export function InstallPwaButton({ variant = 'header' }: { variant?: 'header' | 'mobile' }) {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [showModal, setShowModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setPlatform(detectPlatform());

    // Already running as installed PWA
    if (isStandalone() || (window as any).__pwaInstalled) {
      setIsInstalled(true);
      return;
    }

    // Pick up prompt that was captured before this component mounted
    if ((window as any).__pwaInstallPrompt) {
      setPrompt((window as any).__pwaInstallPrompt);
    }

    // Listen for prompt captured after mount (rare, but handle it)
    const onPromptReady = () => {
      if ((window as any).__pwaInstallPrompt) {
        setPrompt((window as any).__pwaInstallPrompt);
      }
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setPrompt(null);
      setShowModal(false);
    };

    window.addEventListener('pwaPromptReady', onPromptReady);
    window.addEventListener('pwaInstalled', onInstalled);

    return () => {
      window.removeEventListener('pwaPromptReady', onPromptReady);
      window.removeEventListener('pwaInstalled', onInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!prompt) return;
    setIsInstalling(true);
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowModal(false);
      }
    } catch (err) {
      console.error('Install failed:', err);
    } finally {
      setIsInstalling(false);
      // prompt can only be used once
      (window as any).__pwaInstallPrompt = null;
      setPrompt(null);
    }
  }, [prompt]);

  // ── Decide whether to render at all ──
  if (!isMounted) return null;
  if (isStandalone()) return null;

  // Only show if:
  // - iOS: always (they use the Share sheet guide)
  // - Other: only if the native install prompt is available
  const canShowNative = platform !== 'ios' && prompt !== null;
  const canShowIos = platform === 'ios';
  if (!canShowNative && !canShowIos && !isInstalled) return null;

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const modal = showModal ? (
    platform === 'ios' ? (
      <IosGuideModal onClose={closeModal} />
    ) : (
      <NativeInstallModal
        platform={platform}
        onInstall={handleInstall}
        onClose={closeModal}
        isInstalling={isInstalling}
      />
    )
  ) : null;

  /* ── Mobile variant ── */
  if (variant === 'mobile') {
    return (
      <>
        <button
          onClick={isInstalled ? undefined : openModal}
          disabled={isInstalled}
          className="transition-colors text-foreground/60 hover:text-foreground flex items-center gap-2 disabled:opacity-50"
        >
          {isInstalled
            ? <><CheckCircle2 className="h-5 w-5 text-green-500" /> App Installed</>
            : <><Download className="h-5 w-5" /> Install App</>
          }
        </button>
        <AnimatePresence>{modal}</AnimatePresence>
      </>
    );
  }

  /* ── Header variant ── */
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Button
          onClick={isInstalled ? undefined : openModal}
          disabled={isInstalled}
          size="sm"
          variant="outline"
          className="gap-2 border-purple-500/40 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 hover:border-purple-400/60 transition-all disabled:opacity-60"
        >
          {isInstalled
            ? <><CheckCircle2 className="h-4 w-4 text-green-400" /><span className="hidden sm:inline">Installed</span></>
            : <><Download className="h-4 w-4" /><span className="hidden sm:inline">Install App</span></>
          }
        </Button>
      </motion.div>
      <AnimatePresence>{modal}</AnimatePresence>
    </>
  );
}
