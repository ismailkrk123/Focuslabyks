import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2 
} from 'lucide-react';

interface LibraryGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartLibrary: () => void;
  userName: string;
}

export const LibraryGateModal: React.FC<LibraryGateModalProps> = ({
  isOpen,
  onClose,
  onStartLibrary,
  userName
}) => {
  const [step, setStep] = useState<'intro' | 'warning'>('intro');
  const [tapCount, setTapCount] = useState<number>(0);
  const [isContracting, setIsContracting] = useState<boolean>(false);
  const [isTriggered, setIsTriggered] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);

  // Reset states when modal is opened or closed
  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setTapCount(0);
      setIsContracting(false);
      setIsTriggered(false);
      setShowToast(false);
    }
  }, [isOpen]);

  // Handle successive taps (5 taps to enter)
  const handleHaloTap = () => {
    if (isTriggered) return;

    const nextCount = tapCount + 1;
    setTapCount(nextCount);

    // Harmonic spring contraction animation
    setIsContracting(true);
    window.setTimeout(() => {
      setIsContracting(false);
    }, 180);

    // When 5th tap is reached: massive expansion, bottom toast, and entrance to library
    if (nextCount >= 5) {
      setIsTriggered(true);
      setShowToast(true);

      window.setTimeout(() => {
        onClose();
        onStartLibrary();
      }, 750);
    }
  };

  // Dynamic scale calculation based on tap count (1/5 to 4/5 grow progressively)
  const getHaloScale = () => {
    if (isTriggered) return 'scale-[50]';
    if (isContracting) {
      // Contracts inward momentarily upon impact
      return tapCount === 1 ? 'scale-90' : tapCount === 2 ? 'scale-95' : tapCount === 3 ? 'scale-105' : 'scale-115';
    }
    switch (tapCount) {
      case 1:
        return 'scale-105';
      case 2:
        return 'scale-115';
      case 3:
        return 'scale-125';
      case 4:
        return 'scale-135';
      default:
        return 'scale-100 hover:scale-105';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-fadeIn select-none overflow-hidden">
      {/* Massive Expanding Pure White Halo Screen Transition on 5th tap */}
      {isTriggered && (
        <div 
          className="fixed z-50 pointer-events-none rounded-full bg-white transition-all duration-700 ease-out"
          style={{
            width: '120px',
            height: '120px',
            transform: 'scale(50)',
            opacity: 0.98,
            boxShadow: '0 0 120px rgba(255, 255, 255, 1)'
          }}
        />
      )}

      {/* Floating Bottom Toast Notification */}
      {showToast && (
        <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full bg-slate-950/90 border border-white/30 backdrop-blur-2xl text-white text-xs font-bold flex items-center gap-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.85)] animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Kütüphane modu başlatıldı</span>
        </div>
      )}

      {/* Main Glass Panel */}
      <div className="liquid-glass-modal w-full max-w-[400px] p-6 sm:p-7 relative overflow-hidden shadow-2xl flex flex-col text-left rounded-[32px]">
        {/* Specular corner & edge details */}
        <div className="liquid-glass-specular-corner" />
        <div className="liquid-glass-specular-edge" />

        {/* ---------------- STEP 1: SADELEŞTİRİLMİŞ GİRİŞ EKRANI ---------------- */}
        {step === 'intro' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full border border-white/80 shadow-[0_0_8px_rgba(255,255,255,0.85)] flex items-center justify-center bg-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <h3 className="text-base font-extrabold text-white tracking-tight">Sanal Kütüphane</h3>
              </div>
              <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simplified & Clean Body */}
            <div className="py-2 space-y-2.5 text-xs text-slate-300 font-light leading-relaxed">
              <p>
                Sevgili <span className="text-indigo-400 font-semibold">{userName}</span>, derin odaklanma ve kesintisiz etüt ortamına geçiş yapmak üzeresiniz.
              </p>
              <p className="text-[11px] text-slate-400">
                Dikkatinizi dağıtacak tüm dış etkenlerden arınmış, sakin ve disiplinli bir çalışma alanı sizi bekliyor.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-full border border-white/15 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => setStep('warning')}
                className="btn-accent py-2.5 px-6 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer group"
              >
                <span>Devam Et</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ---------------- STEP 2: TAM TEŞEKKÜLLÜ ÇALIŞMA UYARISI & 5-TAP HALE ALANI ---------------- */}
        {step === 'warning' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <button
                type="button"
                onClick={() => setStep('intro')}
                className="p-1 rounded-full text-slate-400 hover:text-white flex items-center gap-1 text-xs transition-colors cursor-pointer"
                title="Geri"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium hidden sm:inline">Geri</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Odaklanma Kuralları</span>
              </div>

              <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Message */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-200 space-y-1">
              <p className="font-semibold text-amber-200">Tam Teşekküllü Çalışma Uyarısı</p>
              <p className="text-[11px] text-slate-300 leading-snug font-light">
                Kütüphane modunda dikkatinizi dağıtacak her şeyi geride bırakmanız ve tam teşekküllü odaklanmanız gerekmektedir. Seans süresince dikkatsizlik durumunda ceza süresi devreye girecektir.
              </p>
            </div>

            {/* INTERACTIVE 5-TAP LUMINOUS WHITE HALO (Contracts on tap, progressively grows, expands screen on 5th tap) */}
            <div className="py-5 flex flex-col items-center justify-center select-none">
              <button
                type="button"
                onClick={handleHaloTap}
                className={`relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center cursor-pointer transition-all duration-300 ease-out touch-none outline-none ${getHaloScale()}`}
                title="Kütüphaneyi başlatmak için haleye 5 kez dokunun"
              >
                {/* Pure White Glowing Halo Ring (Luminous circle with ethereal outer glow, NO image logo) */}
                <div 
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3.5px] border-white transition-all duration-300 flex items-center justify-center ${
                    tapCount > 0
                      ? 'shadow-[0_0_35px_rgba(255,255,255,1),inset_0_0_20px_rgba(255,255,255,0.7)]'
                      : 'shadow-[0_0_20px_rgba(255,255,255,0.85),inset_0_0_12px_rgba(255,255,255,0.35)]'
                  }`}
                  style={{
                    backgroundColor: tapCount > 0 ? `rgba(255, 255, 255, ${0.05 + tapCount * 0.05})` : 'rgba(255, 255, 255, 0.04)'
                  }}
                >
                  {/* Soft white inner ambient shadow / diffuse glow */}
                  <div 
                    className="rounded-full bg-white/20 blur-[8px] transition-all duration-300"
                    style={{
                      width: `${28 + tapCount * 8}px`,
                      height: `${28 + tapCount * 8}px`,
                    }}
                  />

                  {/* Central sparkle */}
                  <Sparkles 
                    className={`absolute text-white transition-all duration-300 pointer-events-none ${
                      tapCount > 0 
                        ? 'w-6 h-6 rotate-12 drop-shadow-[0_0_12px_rgba(255,255,255,1)]' 
                        : 'w-5 h-5 opacity-80 animate-pulse drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]'
                    }`} 
                  />
                </div>

                {/* Progress indicator border around halo */}
                <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] -rotate-90 pointer-events-none">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="47%"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="47%"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeDasharray="100 100"
                    pathLength="100"
                    strokeDashoffset={100 - (tapCount / 5) * 100}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                    style={{
                      filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 1))'
                    }}
                  />
                </svg>
              </button>

              {/* Sözleşme Label & 5-Tap Indicator */}
              <div className="mt-4 text-center space-y-1.5 flex flex-col items-center">
                <span className="text-sm font-extrabold tracking-widest text-white uppercase drop-shadow-sm">
                  Sözleşme
                </span>

                {/* 5 Indicator Dots */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i <= tapCount 
                          ? 'w-4 bg-white shadow-[0_0_8px_rgba(255,255,255,1)]' 
                          : 'w-1.5 bg-white/20'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-[11px] text-slate-300 font-light">
                  {tapCount === 0 
                    ? 'Kütüphaneye girmek için haleye 5 kez dokunun' 
                    : `${tapCount}/5 dokunuldu — ${5 - tapCount} dokunuş kaldı`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
