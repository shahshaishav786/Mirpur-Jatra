import React, { useState } from 'react';
import { Download, Smartphone, X, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'compact',
  className = '' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as an installed PWA, hide the button completely
  if (isInstalled) {
    return null;
  }

  // Handle click for Android / Chrome / Desktop
  const handleInstallClick = async () => {
    try {
      setIsInstalling(true);
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // If installable via beforeinstallprompt
  if (isInstallable) {
    if (variant === 'compact') {
      return (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          title="એપ ઇન્સ્ટોલ કરો / Install App on Phone or PC"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm hover:from-amber-700 hover:to-orange-700 active:scale-95 transition-all ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>ઇન્સ્ટોલ એપ (PWA)</span>
        </button>
      );
    }

    if (variant === 'banner') {
      return (
        <div className={`bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2.5 rounded-2xl shadow-sm flex items-center justify-between gap-3 text-xs sm:text-sm ${className}`}>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold leading-tight">આ પોર્ટલને એપ તરીકે ઇન્સ્ટોલ કરો</p>
              <p className="text-amber-100 text-[11px]">હોમ સ્ક્રીન પરથી એક ક્લિકમાં ઝડપી રજીસ્ટ્રેશન અને ઑફલાઇન પાસ એક્સેસ</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="shrink-0 px-3.5 py-1.5 bg-white text-amber-800 font-bold rounded-xl text-xs shadow hover:bg-amber-50 transition active:scale-95"
          >
            {isInstalling ? 'ઇન્સ્ટોલ થઈ રહ્યું છે...' : 'ઇન્સ્ટોલ કરો'}
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 transition ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>{isInstalling ? 'ઇન્સ્ટોલિંગ...' : 'એપ ઇન્સ્ટોલ કરો (Install App)'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {variant === 'compact' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition ${className}`}
            title="iPhone / iPad પર એપ તરીકે સેવ કરો"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-700" />
            <span>Install on iOS</span>
          </button>
        ) : (
          <div className={`bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-2xl flex items-center justify-between gap-3 text-xs ${className}`}>
            <span className="font-medium">iPhone / iPad પર હોમ સ્ક્રીન એપ તરીકે ઉમેરો</span>
            <button
              onClick={() => setShowIOSGuide(true)}
              className="px-3 py-1 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
            >
              કેવી રીતે?
            </button>
          </div>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-neutral-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-neutral-900">iPhone / iPad પર ઇન્સ્ટોલ</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-neutral-700">
                <div className="flex items-start gap-3 p-2.5 bg-neutral-50 rounded-xl">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">1</span>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-neutral-900">Safari ટૂલબારમાં 'Share' બટન દબાવો</p>
                    <p className="text-xs text-neutral-500 flex items-center gap-1">
                      <Share2 className="w-3.5 h-3.5 text-blue-600 inline" /> ચિહ્ન સ્ક્રીનના નીચે અથવા ઉપર જોવા મળશે.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 bg-neutral-50 rounded-xl">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">2</span>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-neutral-900">નીચે સ્ક્રોલ કરી 'Add to Home Screen' પસંદ કરો</p>
                    <p className="text-xs text-neutral-500 flex items-center gap-1">
                      <PlusSquare className="w-3.5 h-3.5 text-neutral-700 inline" /> 'હોમ સ્ક્રીન પર ઉમેરો' પર ટેપ કરો.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">3</span>
                  <p className="font-semibold text-amber-950 text-xs self-center">
                    ઉપર જમણી બાજુ <strong>'Add'</strong> દબાવતાં જ એપ આપની હોમ સ્ક્રીન પર તૈયાર થઈ જશે!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-amber-600 py-2.5 text-sm font-bold text-white hover:bg-amber-700 transition active:scale-98 shadow-sm"
              >
                સમજાઈ ગયું (Close)
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  const [showGenericGuide, setShowGenericGuide] = useState(false);

  // Fallback for desktop / unsupported browsers when not standalone yet
  return (
    <>
      <button
        onClick={() => setShowGenericGuide(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition ${className}`}
        title="Install Web App"
      >
        <Download className="w-3.5 h-3.5 text-amber-600" />
        <span>Install PWA</span>
      </button>

      {showGenericGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-neutral-900">એપ ઇન્સ્ટોલેશન ગાઇડ</h3>
              </div>
              <button
                onClick={() => setShowGenericGuide(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-neutral-700">
              <p>આ વેબસાઇટને આપના મોબાઇલ કે કોમ્પ્યુટર પર એપ તરીકે ઇન્સ્ટોલ કરવા માટે:</p>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-xs space-y-1.5">
                <p><strong>Chrome / Edge / Android:</strong> બ્રાઉઝરના ઉપરના મેનૂ (ત્રણ ટપકાં <strong>⋮</strong>) પર ક્લિક કરી <strong>"Install App"</strong> અથવા <strong>"Add to Home Screen"</strong> પસંદ કરો.</p>
                <p><strong>iOS / Safari:</strong> શેર બટન <Share2 className="w-3 h-3 inline text-blue-600" /> દબાવી <strong>"Add to Home Screen"</strong> પસંદ કરો.</p>
              </div>
            </div>
            <button
              onClick={() => setShowGenericGuide(false)}
              className="w-full rounded-xl bg-amber-600 py-2.5 text-sm font-bold text-white hover:bg-amber-700 transition"
            >
              સમજાઈ ગયું (Close)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
