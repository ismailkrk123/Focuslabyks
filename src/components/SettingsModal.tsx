import React, { useState } from 'react';
import { 
  X, 
  User, 
  Target, 
  TreePine, 
  Clock, 
  Trash2, 
  AlertTriangle,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { UserProfile, ThemeMode, YksField, AuthAccount } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  authAccount: AuthAccount;
  setAuthAccount: React.Dispatch<React.SetStateAction<AuthAccount>>;
  onClearAllData: () => void;
  onOpenAuthModal: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  setUserProfile,
  authAccount,
  setAuthAccount,
  onClearAllData,
  onOpenAuthModal
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(userProfile.name);
  const [tempGoal, setTempGoal] = useState<string>(userProfile.targetGoal);
  const [tempRank, setTempRank] = useState<string>(userProfile.targetExamRank);
  const [tempField, setTempField] = useState<YksField>(userProfile.yksField || 'Sayısal');

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    setUserProfile(p => ({
      ...p,
      name: tempName.trim() || p.name,
      targetGoal: tempGoal.trim() || p.targetGoal,
      targetExamRank: tempRank.trim() || p.targetExamRank,
      yksField: tempField
    }));
    onClose();
  };

  const handleToggleTheme = () => {
    const nextMode: ThemeMode = userProfile.themeMode === 'dark' ? 'light' : 'dark';
    setUserProfile(p => ({ ...p, themeMode: nextMode }));
  };

  const totalHours = Math.floor(userProfile.totalFocusMinutes / 60);
  const remMinutes = userProfile.totalFocusMinutes % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn select-none">
      <div className="panel w-full max-w-lg p-6 relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <img 
              src="/assets/aistudio/f576c254fbf3892432392f40d43590062487875e061c358c4f10314d74ecd00e_40e06333.png" 
              alt="FocusLab Halo" 
              className="w-5 h-5 rounded-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] shrink-0"
            />
            <div>
              <h3 className="text-base font-extrabold text-[var(--txt)]">Ayarlar & Profil</h3>
              <p className="text-xs text-[var(--muted)] font-light">YKS hedefleri, tema tercihi ve veri yönetimi</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--txt)] p-1 rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
          {/* Account Overview Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="metric-box p-3.5 text-center">
              <Clock className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <p className="text-[10px] text-[var(--muted)] font-medium">Toplam Odak</p>
              <p className="text-sm font-extrabold text-[var(--txt)] font-mono mt-0.5">{totalHours}s {remMinutes}d</p>
            </div>
            <div className="metric-box p-3.5 text-center">
              <TreePine className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] text-[var(--muted)] font-medium">Ağaç Puanı</p>
              <p className="text-sm font-extrabold text-[var(--txt)] font-mono mt-0.5">+{userProfile.treePoints} Puan</p>
            </div>
            <div className="metric-box p-3.5 text-center">
              <Target className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <p className="text-[10px] text-[var(--muted)] font-medium">Hedef Derece</p>
              <p className="text-sm font-extrabold text-[var(--txt)] font-mono mt-0.5">{userProfile.targetExamRank}</p>
            </div>
          </div>

          {/* Theme Mode Toggle (Koyu / Açık Tema) */}
          <div className="metric-box p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {userProfile.themeMode === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
              <div>
                <p className="text-xs font-bold text-[var(--txt)]">
                  Görünüm Teması: {userProfile.themeMode === 'dark' ? 'Koyu Gri (Deep Charcoal)' : 'Açık Platin (Smoky Glass)'}
                </p>
                <p className="text-[10px] text-[var(--muted)] font-light">
                  {userProfile.themeMode === 'dark' ? 'Göz yormayan yumuşak antrasit ve hafif kar yağışı' : 'Temiz platin zemin ve koyu füme cam tuşlar'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleTheme}
              className="px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-hover)] text-xs font-medium text-[var(--txt)] transition-colors"
            >
              Değiştir
            </button>
          </div>

          {/* Profile Inputs */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Kullanıcı Bilgileri & YKS Hedefi</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--muted)] block mb-1">Görünecek Adınız</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full clean-input px-3.5 py-2 text-xs text-[var(--txt)]"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] block mb-1">Hedef Derece</label>
                <input
                  type="text"
                  value={tempRank}
                  onChange={(e) => setTempRank(e.target.value)}
                  placeholder="Örn: İlk 1.000"
                  className="w-full clean-input px-3.5 py-2 text-xs text-[var(--txt)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--muted)] block mb-1">Alanınız</label>
                <select
                  value={tempField}
                  onChange={(e) => setTempField(e.target.value as YksField)}
                  className="w-full clean-input px-3.5 py-2 text-xs text-[var(--txt)] outline-none"
                >
                  <option value="Sayısal" className="bg-slate-900 text-white">Sayısal</option>
                  <option value="Eşit Ağırlık" className="bg-slate-900 text-white">Eşit Ağırlık</option>
                  <option value="Sözel" className="bg-slate-900 text-white">Sözel</option>
                  <option value="Dil" className="bg-slate-900 text-white">Dil</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] block mb-1">Hedef Bölüm / Üniversite</label>
                <input
                  type="text"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(e.target.value)}
                  placeholder="Örn: Boğaziçi Bilgisayar"
                  className="w-full clean-input px-3.5 py-2 text-xs text-[var(--txt)]"
                />
              </div>
            </div>
          </div>

          {/* Account Actions: Logout / Switch User */}
          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
              className="py-2 px-4 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] text-xs text-[var(--muted)] hover:text-[var(--txt)] flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Giriş / Hesap Değiştir</span>
            </button>

            <span className="text-[11px] font-mono text-[var(--muted)]">
              {authAccount.isGuest ? 'Misafir Girişi' : authAccount.username || 'Kayıtlı Hesap'}
            </span>
          </div>

          {/* Reset / Clear Data */}
          <div className="pt-2 border-t border-[var(--border)]">
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full py-2 px-4 rounded-full border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Tüm Verileri Sıfırla</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center space-y-2.5">
                <p className="text-xs font-bold text-rose-300 flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Tüm görevler, denemeler ve puanlar sıfırlansın mı?</span>
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="py-1 px-4 border border-[var(--border)] rounded-full text-xs text-[var(--muted)] hover:text-white"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={() => {
                      onClearAllData();
                      setShowClearConfirm(false);
                      onClose();
                    }}
                    className="py-1 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full text-xs shadow-md"
                  >
                    Evet, Sıfırla
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[var(--border)] flex justify-end gap-2">
          <button onClick={onClose} className="py-1.5 px-4 rounded-full text-xs text-[var(--muted)] hover:text-[var(--txt)]">
            İptal
          </button>
          <button
            onClick={handleSaveProfile}
            className="btn-accent py-2 px-6 text-xs font-extrabold"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};
