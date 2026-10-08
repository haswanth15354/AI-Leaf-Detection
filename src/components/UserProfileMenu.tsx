import React, { useState, useRef, useEffect } from 'react';
import {
  User as UserIcon,
  LogOut,
  Sparkles,
  ShieldCheck,
  Sprout,
  GraduationCap,
  ChevronDown,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface UserProfileMenuProps {
  onOpenHistory?: () => void;
  onNavigateToAuth?: (mode: 'login' | 'register') => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ onOpenHistory, onNavigateToAuth }) => {
  const { user, isAuthenticated, openLoginModal, openRegisterModal, logout } = useAuth();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (onNavigateToAuth) onNavigateToAuth('login');
            else openLoginModal();
          }}
          className="px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-emerald-400 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
        >
          {t('Sign In')}
        </button>
        <button
          onClick={() => {
            if (onNavigateToAuth) onNavigateToAuth('register');
            else openRegisterModal();
          }}
          className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm shadow-emerald-950/60 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>{t('Register')}</span>
        </button>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'agronomist':
        return <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />;
      case 'researcher':
        return <Sparkles className="w-3.5 h-3.5 text-blue-600" />;
      case 'student':
        return <GraduationCap className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Sprout className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'agronomist':
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300';
      case 'researcher':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300';
      case 'student':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60 transition-all cursor-pointer"
      >
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
          {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 leading-tight">
            {user.fullName}
          </p>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 capitalize">
            {t(user.role)}
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl z-50 p-2 animate-fade-in">
          {/* User info card */}
          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl mb-2">
            <p className="text-sm font-bold text-stone-900 dark:text-white truncate">
              {user.fullName}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate mb-2">
              {user.email}
            </p>

            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getRoleBadge(
                  user.role
                )}`}
              >
                {getRoleIcon(user.role)}
                <span className="capitalize">{t(user.role)}</span>
              </span>
              {user.farmName && (
                <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate flex items-center gap-1">
                  <Building className="w-3 h-3 text-stone-400" />
                  <span className="truncate">{user.farmName}</span>
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            {onOpenHistory && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenHistory();
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('My Saved Leaf Scans')}</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('Log Out')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
