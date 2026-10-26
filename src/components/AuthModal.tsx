import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, User, Mail, Lock, GraduationCap } from 'lucide-react';
import { AuthAccount, UserProfile, YksField } from '../types';
import { signInWithGoogle } from '../services/firebase';

interface AuthModalProps {
  authAccount: AuthAccount;
  setAuthAccount: React.Dispatch<React.SetStateAction<AuthAccount>>;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onComplete: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  authAccount,
  setAuthAccount,
  setUserProfile,
  onComplete
}) => {
  const [authMode, setAuthMode] = useState<'register' | 'login' | 'onboarding'>(
    authAccount.isAuthenticated && !authAccount.onboardingCompleted ? 'onboarding' : 'register'
  );

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [targetDepartment, setTargetDepartment] = useState('Bilgisayar Mühendisliği');
  const [targetRank, setTargetRank] = useState('İlk 5.000');
  const [selectedField, setSelectedField] = useState<YksField>('Sayısal');
  const [isGuest, setIsGuest] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const rankOptions = [
    'İlk 1.000',
    'İlk 5.000',
    'İlk 10.000',
    'İlk 20.000',
    'İlk 50.000',
    'İlk 100.000'
  ];

  const fieldOptions: YksField[] = ['Sayısal', 'Eşit Ağırlık', 'Sözel', 'Dil'];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Lütfen kullanıcı adı girin.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Geçerli bir e-posta adresi girin.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Şifreniz en az 4 karakter olmalıdır.');
      return;
    }

    setErrorMsg('');
    setIsGuest(false);
    setFullName(username);
    setAuthMode('onboarding');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() && !email.trim()) {
      setErrorMsg('Lütfen kullanıcı adı veya e-posta girin.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Lütfen şifrenizi girin.');
      return;
    }

    setErrorMsg('');
    setIsGuest(false);
    setFullName(username || 'Focus Üyesi');
    setAuthMode('onboarding');
  };

  const handleGoogleAuth = async (mode: 'register' | 'login') => {
    setErrorMsg('');
    try {
      const user = await signInWithGoogle();
      if (user) {
        setIsGuest(false);
        const name = user.displayName || (mode === 'register' ? 'Google Üyesi' : 'Google Kullanıcısı');
        setUsername(name);
        setEmail(user.email || 'ogrenci@gmail.com');
        setFullName(name);
        setAuthMode('onboarding');
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('Google ile giriş yapılırken bir sorun oluştu.');
      }
    }
  };

  const handleGuestEntry = () => {
    setErrorMsg('');
    setIsGuest(true);
    setUsername('Misafir');
    setFullName('Misafir Öğrenci');
    setAuthMode('onboarding');
  };

  const handleFinishOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = fullName.trim() || (isGuest ? 'Misafir' : username || 'Öğrenci');
    const dept = targetDepartment.trim() || 'Hedef Bölüm';

    const updatedAccount: AuthAccount = {
      isAuthenticated: true,
      isGuest,
      username: username || 'misafir',
      email: email || '',
      name: finalName,
      targetExamRank: targetRank,
      targetDepartment: dept,
      yksField: selectedField,
      onboardingCompleted: true,
      createdAt: Date.now()
    };

    setAuthAccount(updatedAccount);
    setUserProfile(prev => ({
      ...prev,
      name: finalName,
      targetGoal: `${dept} (${selectedField} - ${targetRank})`,
      targetExamRank: targetRank,
      targetDepartment: dept,
      yksField: selectedField
    }));

    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-[#05060b] select-none animate-fadeIn">
      {/* 1. DYNAMIC DARK FLUID GRADIENT BACKDROP (Deep black base with harmoniously drifting, pulsing, morphing color mesh) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Subtle base vignette */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#05060b]/30 to-[#05060b]/90 z-0" />

        {/* 1. Deep Royal Purple & Indigo Fluid Orb */}
        <div 
          className="dark-fluid-blob-1 absolute rounded-full blur-[130px] pointer-events-none"
          style={{
            width: '54vmax',
            height: '54vmax',
            top: '-12%',
            left: '-10%',
            backgroundColor: 'rgba(124, 58, 237, 0.48)', // Vibrant Purple
          }}
        />

        {/* 2. Oceanic Azure Blue Fluid Orb */}
        <div 
          className="dark-fluid-blob-2 absolute rounded-full blur-[140px] pointer-events-none"
          style={{
            width: '52vmax',
            height: '52vmax',
            bottom: '-15%',
            left: '-5%',
            backgroundColor: 'rgba(37, 99, 235, 0.44)', // Electric Royal Blue
          }}
        />

        {/* 3. Warm Vivid Sunset Orange & Ember Fluid Orb */}
        <div 
          className="dark-fluid-blob-3 absolute rounded-full blur-[135px] pointer-events-none"
          style={{
            width: '46vmax',
            height: '46vmax',
            top: '18%',
            right: '-10%',
            backgroundColor: 'rgba(249, 115, 22, 0.42)', // Warm Vivid Orange
          }}
        />

        {/* 4. Radiant Pink & Magenta Fluid Orb */}
        <div 
          className="dark-fluid-blob-4 absolute rounded-full blur-[130px] pointer-events-none"
          style={{
            width: '45vmax',
            height: '45vmax',
            bottom: '5%',
            right: '8%',
            backgroundColor: 'rgba(236, 72, 153, 0.42)', // Hot Rose / Magenta
          }}
        />

        {/* 5. Deep Cyan / Sky Azure Depth Orb */}
        <div 
          className="dark-fluid-blob-5 absolute rounded-full blur-[125px] pointer-events-none"
          style={{
            width: '38vmax',
            height: '38vmax',
            top: '40%',
            left: '22%',
            backgroundColor: 'rgba(6, 182, 212, 0.32)', // Luminous Cyan
          }}
        />

        {/* 6. Ethereal Violet Plum Harmony Center Orb */}
        <div 
          className="dark-fluid-blob-1 absolute rounded-full blur-[120px] pointer-events-none"
          style={{
            width: '42vmax',
            height: '42vmax',
            top: '-6%',
            right: '25%',
            backgroundColor: 'rgba(147, 51, 234, 0.38)', // Deep Violet
          }}
        />
      </div>

      {/* 2. COMPACT LIQUID GLASS MODAL (Scaled down, ultra-translucent with authentic edge specular refractions) */}
      <div className="liquid-glass-modal relative z-10 w-full max-w-[365px] sm:max-w-[380px] p-5 sm:p-6 rounded-[28px]">
        {/* Specular Edge & Corner Refraction Accents */}
        <div className="liquid-glass-specular-corner" />
        <div className="liquid-glass-specular-edge" />

        {/* TOP BAR: Back Navigation + Brand Wordmark */}
        <div className="relative flex items-center justify-between pb-2.5 border-b border-white/10 mb-3.5">
          {authMode !== 'register' ? (
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                if (authMode === 'onboarding') {
                  setAuthMode('register');
                } else if (authMode === 'login') {
                  setAuthMode('register');
                }
              }}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-xs"
              title="Geri Dön"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">Geri</span>
            </button>
          ) : (
            <div className="w-5" />
          )}

          <div className="flex items-center gap-2">
            <img 
              src="/assets/aistudio/f576c254fbf3892432392f40d43590062487875e061c358c4f10314d74ecd00e_40e06333.png" 
              alt="FocusLab Halo" 
              className="w-4.5 h-4.5 rounded-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] shrink-0"
            />
            <span className="text-xs sm:text-[13px] font-extrabold tracking-tight text-white drop-shadow-sm">
              FocusLab
            </span>
          </div>

          <div className="w-5" />
        </div>

        {/* ---------------- MODE 1: REGISTER (Kayıt Ol) ---------------- */}
        {authMode === 'register' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="text-center space-y-0.5">
              <h2 className="text-lg font-extrabold text-white tracking-tight drop-shadow-sm">Kayıt Ol</h2>
              <p className="text-[11px] text-slate-300 font-light leading-snug">
                Çalışma alanınızı oluşturun ve hedefinize odaklanın.
              </p>
            </div>

            {errorMsg && (
              <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] text-center font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-2">
              <div>
                <label className="text-[10px] font-medium text-slate-300 block mb-0.5">Kullanıcı Adı</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="kullaniciadi"
                    className="w-full bg-white/[0.06] border border-white/12 focus:border-indigo-400/60 focus:bg-white/[0.1] text-white rounded-full pl-9 pr-3 py-1.5 text-xs outline-none transition-all placeholder-slate-400/70"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium text-slate-300 block mb-0.5">E-posta</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@posta.com"
                    className="w-full bg-white/[0.06] border border-white/12 focus:border-indigo-400/60 focus:bg-white/[0.1] text-white rounded-full pl-9 pr-3 py-1.5 text-xs outline-none transition-all placeholder-slate-400/70"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium text-slate-300 block mb-0.5">Şifre</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.06] border border-white/12 focus:border-indigo-400/60 focus:bg-white/[0.1] text-white rounded-full pl-9 pr-3 py-1.5 text-xs outline-none transition-all placeholder-slate-400/70"
                  />
                </div>
              </div>

              {/* Primary Register Button */}
              <button
                type="submit"
                className="w-full btn-accent py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md mt-1 cursor-pointer"
              >
                <span>Kaydol</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleGoogleAuth('register')}
                className="w-full py-2 px-3 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google ile Kayıt Ol</span>
              </button>
            </form>

            {/* Guest & Existing Account Nav */}
            <div className="pt-2 border-t border-white/10 text-center space-y-1.5">
              <button
                type="button"
                onClick={handleGuestEntry}
                className="w-full py-1.5 rounded-full text-[11px] text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
              >
                Misafir olarak devam et
              </button>

              <button
                type="button"
                onClick={() => { setErrorMsg(''); setAuthMode('login'); }}
                className="text-[11px] text-slate-300 hover:text-white transition-colors block mx-auto cursor-pointer"
              >
                Hesabınız var mı? <span className="font-bold text-white underline underline-offset-2">Giriş Yapın</span>
              </button>
            </div>
          </div>
        )}

        {/* ---------------- MODE 2: LOGIN (Giriş Yap) ---------------- */}
        {authMode === 'login' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="text-center space-y-0.5">
              <h2 className="text-lg font-extrabold text-white tracking-tight drop-shadow-sm">Giriş Yap</h2>
              <p className="text-[11px] text-slate-300 font-light leading-snug">
                Hesabınıza bağlanarak çalışma seansınıza devam edin.
              </p>
            </div>

            {errorMsg && (
              <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] text-center font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-2">
              <div>
                <label className="text-[10px] font-medium text-slate-300 block mb-0.5">Kullanıcı Adı veya E-posta</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="kullaniciadi veya e-posta"
                    className="w-full bg-white/[0.06] border border-white/12 focus:border-indigo-400/60 focus:bg-white/[0.1] text-white rounded-full pl-9 pr-3 py-1.5 text-xs outline-none transition-all placeholder-slate-400/70"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium text-slate-300 block mb-0.5">Şifre</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.06] border border-white/12 focus:border-indigo-400/60 focus:bg-white/[0.1] text-white rounded-full pl-9 pr-3 py-1.5 text-xs outline-none transition-all placeholder-slate-400/70"
                  />
                </div>
              </div>

              {/* Primary Login Button */}
              <button
                type="submit"
                className="w-full btn-accent py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md mt-1 cursor-pointer"
              >
                <span>Giriş Yap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={() => handleGoogleAuth('login')}
                className="w-full py-2 px-3 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google ile Giriş Yap</span>
              </button>
            </form>

            {/* Guest & Register Nav */}
            <div className="pt-2 border-t border-white/10 text-center space-y-1.5">
              <button
                type="button"
                onClick={handleGuestEntry}
                className="w-full py-1.5 rounded-full text-[11px] text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
              >
                Misafir olarak devam et
              </button>

              <button
                type="button"
                onClick={() => { setErrorMsg(''); setAuthMode('register'); }}
                className="text-[11px] text-slate-300 hover:text-white transition-colors block mx-auto cursor-pointer"
              >
                Hesabınız yok mu? <span className="font-bold text-white underline underline-offset-2">Kaydolun</span>
              </button>
            </div>
          </div>
        )}

        {/* ---------------- MODE 3: ONBOARDING (Hedef & Profil Belirleme) ---------------- */}
        {authMode === 'onboarding' && (
          <form onSubmit={handleFinishOnboarding} className="space-y-3 animate-fadeIn">
            <div className="text-center space-y-0.5">
              <h2 className="text-lg font-extrabold text-white tracking-tight drop-shadow-sm">Hedefinizi Belirleyin</h2>
              <p className="text-[11px] text-slate-300 font-light leading-snug">
                Hedef ve alan bilgilerinizi kişiselleştirin.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Name */}
              <div>
                <label className="text-[10px] font-medium text-slate-300 block mb-0.5">
                  Adınız
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Adınız..."
                    className="w-full bg-white/[0.06] border border-white/12 focus:border-indigo-400/60 focus:bg-white/[0.1] text-white rounded-full pl-9 pr-3 py-1.5 text-xs outline-none transition-all placeholder-slate-400/70"
                    required
                  />
                </div>
              </div>

              {/* Field (Alan: Sayısal, Eşit Ağırlık, Sözel, Dil) */}
              <div>
                <label className="text-[10px] font-medium text-slate-300 block mb-0.5">
                  Alanınız
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {fieldOptions.map((fld) => (
                    <button
                      key={fld}
                      type="button"
                      onClick={() => setSelectedField(fld)}
                      className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold text-center border transition-all cursor-pointer ${
                        selectedField === fld
                          ? 'border-indigo-400 bg-indigo-500/25 text-white shadow-sm ring-1 ring-indigo-400/50'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {fld}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Department */}
              <div>
                <label className="text-[10px] font-medium text-slate-300 block mb-0.5">
                  Hedeflediğiniz Bölüm
                </label>
                <div className="relative">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={targetDepartment}
                    onChange={(e) => setTargetDepartment(e.target.value)}
                    placeholder="Örn: Bilgisayar Mühendisliği, Tıp..."
                    className="w-full bg-white/[0.06] border border-white/12 focus:border-indigo-400/60 focus:bg-white/[0.1] text-white rounded-full pl-9 pr-3 py-1.5 text-xs outline-none transition-all placeholder-slate-400/70"
                    required
                  />
                </div>
              </div>

              {/* Target Rank */}
              <div>
                <label className="text-[10px] font-medium text-slate-300 block mb-0.5">
                  Hedeflediğiniz Sıralama
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {rankOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTargetRank(opt)}
                      className={`py-1 px-1.5 rounded-xl text-[10px] font-medium text-center border transition-all cursor-pointer ${
                        targetRank === opt
                          ? 'border-indigo-400 bg-indigo-500/25 text-white shadow-sm ring-1 ring-indigo-400/50 font-bold'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Complete & Enter Dashboard */}
            <div className="pt-1.5">
              <button
                type="submit"
                className="w-full btn-accent py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>İlerle & Başla</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
