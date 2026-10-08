import React, { useState } from 'react';
import {
  Sprout,
  Mail,
  Lock,
  User as UserIcon,
  Building,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types/auth';

interface AuthPageProps {
  onBackToApp: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBackToApp, initialMode = 'login' }) => {
  const { login, register, isLoading } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerFarm, setRegisterFarm] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>('farmer');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await login({ email: loginEmail, password: loginPassword });
      onBackToApp();
    } catch (err: any) {
      setErrorMsg(t(err.message || 'Failed to sign in. Please check your credentials.'));
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await register({
        fullName: registerName,
        email: registerEmail,
        password: registerPassword,
        farmName: registerFarm.trim() || undefined,
        role: registerRole,
      });
      setSuccessMsg(t('Account created successfully! Welcome to FloraScan.'));
      setTimeout(() => {
        onBackToApp();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(t(err.message || 'Failed to create account.'));
    }
  };

  const fillDemoAccount = (role: 'farmer' | 'agronomist') => {
    if (role === 'farmer') {
      setLoginEmail('farmer@agri.com');
      setLoginPassword('password123');
    } else {
      setLoginEmail('dr.smith@botany.org');
      setLoginPassword('password123');
    }
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-zinc-950 animate-fade-in">
      {/* Top back navigation */}
      <div className="max-w-5xl mx-auto w-full mb-6">
        <button
          onClick={onBackToApp}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('Back to Crop Doctor & Scanner')}</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Side: Agronomy Branding & Features Hero (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shadow-emerald-950/60">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                  <Sprout className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  FloraScan <span className="text-emerald-400 text-xs px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 font-extrabold">AI</span>
                </h1>
                <p className="text-xs text-zinc-400">{t('Botanical Pathology & Crop Doctor')}</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
              {t('Precision Crop Health & Disease Intelligence')}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
              {t('Empowering farmers, agronomists, and researchers with real-time AI vision pathology, longitudinal health trend tracking, and dual organic & chemical spray prescriptions.')}
            </p>

            {/* Value Highlights */}
            <div className="space-y-3.5">
              {[
                {
                  title: 'Longitudinal Health Trends',
                  desc: 'Line-chart tracking of crop recovery vs disease progression over time',
                  icon: Activity,
                },
                {
                  title: '50+ Pathogen Profiles',
                  desc: 'Instant fungal, bacterial, viral, and nutritional lesion classification',
                  icon: ShieldCheck,
                },
                {
                  title: 'Dual Treatment Prescriptions',
                  desc: 'Organic remedies and exact chemical dosage tank calculations',
                  icon: Sparkles,
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-900/40 border border-emerald-800/80 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{t(item.title)}</h4>
                      <p className="text-[11px] text-zinc-400">{t(item.desc)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800/80">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('Multi-Device Sync • Secure Session Storage')}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Forms (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-zinc-900/60 flex flex-col justify-center">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 mb-6 bg-zinc-950 rounded-2xl border border-zinc-800 max-w-sm mx-auto w-full">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-zinc-800 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t('Sign In')}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-zinc-800 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t('Create Account')}
            </button>
          </div>

          {/* Form Header Title */}
          <div className="mb-6 text-center">
            <h3 className="text-xl font-bold text-white">
              {mode === 'login' ? t('Welcome Back, Grower') : t('Create Your FloraScan Account')}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {mode === 'login'
                ? t('Sign in to access your crop scan history, trends, and dosage records')
                : t('Join the global network of modern farmers and agricultural scientists')}
            </p>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-950/50 border border-rose-800 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-950/50 border border-emerald-800 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto w-full">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {t('Email Address')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="farmer@agri.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    {t('Password')}
                  </label>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('farmer')}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    {t('Use Demo Password')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t('Sign In to FloraScan')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Evaluation Demo Accounts */}
              <div className="pt-4 border-t border-zinc-800/80">
                <p className="text-[11px] text-zinc-400 font-medium mb-2 text-center">
                  {t('Instant One-Click Demo Credentials:')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('farmer')}
                    className="p-2 bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 rounded-xl hover:bg-emerald-900/50 transition-colors text-left cursor-pointer"
                  >
                    <span className="font-bold block text-xs">🌾 {t('Farmer Demo')}</span>
                    <span className="text-[10px] text-zinc-400">farmer@agri.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('agronomist')}
                    className="p-2 bg-teal-950/40 text-teal-300 border border-teal-800/60 rounded-xl hover:bg-teal-900/50 transition-colors text-left cursor-pointer"
                  >
                    <span className="font-bold block text-xs">🔬 {t('Agronomist Demo')}</span>
                    <span className="text-[10px] text-zinc-400">dr.smith@botany.org</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-w-md mx-auto w-full">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {t('Full Name')}
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {t('Email Address')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="name@farm.com"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {t('Password (min. 6 characters)')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {t('Farm / Enterprise / Institution Name')}
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={registerFarm}
                    onChange={(e) => setRegisterFarm(e.target.value)}
                    placeholder="e.g. Anurag Agricultural Orchards"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all"
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {t('Select Role')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'farmer', label: 'Farmer / Grower', icon: Sprout },
                    { id: 'agronomist', label: 'Agronomist / Expert', icon: ShieldCheck },
                    { id: 'researcher', label: 'Researcher', icon: Sparkles },
                    { id: 'student', label: 'Student / Scholar', icon: GraduationCap },
                  ].map((item) => {
                    const IconComp = item.icon;
                    const isSelected = registerRole === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRegisterRole(item.id as UserRole)}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                            : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800/60'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-xs font-medium">{t(item.label)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t('Create Free Account')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
