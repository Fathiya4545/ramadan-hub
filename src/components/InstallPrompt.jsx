import { useEffect, useState } from 'react';

const DISMISS_KEY = 'installPromptDismissed';

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari doesn't support display-mode, it sets this instead.
    window.navigator.standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    if (isStandalone()) return; // already installed — nothing to offer
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // storage blocked; still fine to show the prompt
    }

    // Chrome/Edge/Android fire this and let us open the real install dialog.
    function onBeforeInstall(e) {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // Safari on iOS never fires it, so offer the manual steps instead.
    if (isIos()) setShow(true);

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  function dismiss() {
    setShow(false);
    setShowIosSteps(false);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Private browsing refuses writes; it will just ask again next visit.
    }
  }

  async function install() {
    if (!deferred) {
      setShowIosSteps(true);
      return;
    }
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === 'accepted') dismiss();
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-3 sm:p-4 pointer-events-none">
      <div className="pointer-events-auto max-w-md mx-auto rounded-2xl shadow-2xl border border-emerald-500/30 bg-emerald-700 text-white p-4">
        {showIosSteps ? (
          <div>
            <div className="flex items-start justify-between gap-3">
              <p className="font-bold">Install on your iPhone</p>
              <button onClick={dismiss} aria-label="Close" className="text-white/70 hover:text-white text-lg leading-none">
                ✕
              </button>
            </div>
            <ol className="text-sm text-emerald-50 mt-2 space-y-1 list-decimal list-inside">
              <li>Tap the Share button in Safari</li>
              <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
              <li>Tap <strong>Add</strong></li>
            </ol>
            <p className="text-[11px] text-emerald-100/70 mt-2">Safari only — this option doesn&apos;t appear in Chrome on iPhone.</p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-3xl shrink-0" aria-hidden="true">☽</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold leading-tight">Install Medina App</p>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Add it to your home screen — opens like an app, works offline.
              </p>
            </div>
            <button
              onClick={install}
              className="shrink-0 bg-white text-emerald-800 font-bold text-sm px-4 py-2 rounded-full hover:bg-emerald-50"
            >
              Install
            </button>
            <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 text-white/70 hover:text-white text-lg leading-none">
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
