import React, { useState } from 'react';
import { Ticket, Link2, FolderGit2 } from 'lucide-react';
import { User } from 'firebase/auth';
import { EventConfig } from '../types';
import { GoogleSignInButton } from './GoogleSignInButton';
import { PWAInstallButton } from './PWAInstallButton';
import { googleSignIn, logoutGoogle } from '../services/googleAuth';
import { TARGET_DRIVE_FOLDER_URL } from '../services/googleSheets';

interface HeaderProps {
  activeTab: 'register' | 'lookup' | 'organizer' | 'details';
  onSelectTab: (tab: 'register' | 'lookup' | 'organizer' | 'details') => void;
  confirmedCount: number;
  config: EventConfig;
  onOpenShareLinks: () => void;
  isAdminMode: boolean;
  currentUser?: User | null;
  onUserChange?: (user: User | null) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  confirmedCount,
  config,
  onOpenShareLinks,
  isAdminMode,
  currentUser = null,
  onUserChange,
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res && onUserChange) {
        onUserChange(res.user);
      }
    } catch (err) {
      console.error('Google sign in error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    if (onUserChange) onUserChange(null);
  };
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          onClick={() => onSelectTab('register')}
          className="text-left group cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded-sm flex items-center gap-2.5"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-700 text-amber-100 flex items-center justify-center font-bold text-lg shadow-sm">
            🙏
          </div>
          <div>
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-neutral-900 group-hover:text-amber-800 transition-colors block">
              "{config.familyGroupName}"
            </span>
            <span className="text-[11px] text-amber-800 font-medium block">
              સ્નેહમિલન & શ્રી જહાજ મંદિર જાત્રા
            </span>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-neutral-600">
          <button
            onClick={() => onSelectTab('register')}
            className={`transition-colors cursor-pointer py-1 ${
              activeTab === 'register'
                ? 'text-amber-800 font-bold border-b-2 border-amber-700'
                : 'hover:text-neutral-900'
            }`}
          >
            પરિવાર રજીસ્ટ્રેશન & સુધારો (Register & Update)
          </button>

          {/* Only show itinerary if pushed by admin! */}
          {config.showItineraryToUsers && (
            <button
              onClick={() => onSelectTab('details')}
              className={`transition-colors cursor-pointer py-1 ${
                activeTab === 'details'
                  ? 'text-amber-800 font-bold border-b-2 border-amber-700'
                  : 'hover:text-neutral-900'
              }`}
            >
              તીર્થ માહિતી (Itinerary)
            </button>
          )}

          <button
            onClick={() => onSelectTab('lookup')}
            className={`transition-colors cursor-pointer py-1 ${
              activeTab === 'lookup'
                ? 'text-amber-800 font-bold border-b-2 border-amber-700'
                : 'hover:text-neutral-900'
            }`}
          >
            મારો પાસ શોધો (Find Pass)
          </button>

          {/* Admin link ONLY shown in admin mode! Never leaked on family registration link */}
          {isAdminMode && (
            <button
              onClick={() => onSelectTab('organizer')}
              className={`transition-colors cursor-pointer py-1 ${
                activeTab === 'organizer'
                  ? 'text-amber-800 font-bold border-b-2 border-amber-700'
                  : 'hover:text-neutral-900'
              }`}
            >
              એડમિન પોર્ટલ / Admin ({confirmedCount})
            </button>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA In-App Install Button */}
          <PWAInstallButton variant="compact" />

          {/* Google Drive Excel Folder Quick Link */}
          <a
            href={TARGET_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="ગૂગલ ડ્રાઇવ એક્સેલ ફોલ્ડર ખોલો (Open Drive Folder)"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors shadow-2xs"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Drive Folder</span>
          </a>

          {/* Google Auth Status / Sign In */}
          {currentUser ? (
            <div className="hidden lg:flex items-center gap-1.5 bg-neutral-100 px-2.5 py-1 rounded-xl text-xs border border-neutral-200">
              <img
                src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'G')}`}
                alt="Google"
                className="w-5 h-5 rounded-full"
              />
              <span className="font-semibold text-neutral-800 max-w-[80px] truncate text-[11px]">
                {currentUser.displayName?.split(' ')[0] || 'Google'}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              disabled={isLoggingIn}
              title="Google Drive સિંક માટે સાઇન-ઇન કરો"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isLoggingIn ? '...' : 'Sign in'}</span>
            </button>
          )}

          {/* Dedicated 2 Direct Links Button ONLY in admin mode */}
          {isAdminMode && (
            <button
              onClick={onOpenShareLinks}
              title="બે લિંક મેળવો: ૧. રજીસ્ટ્રેશન અને ૨. એડમિન સમિતિ લિંક"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Link2 className="w-3.5 h-3.5 text-amber-800" />
              <span>બે લિંક્સ (2 Links)</span>
            </button>
          )}

          <button
            onClick={() => onSelectTab('lookup')}
            className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
            title="પાસ શોધો"
          >
            <Ticket className="w-5 h-5" />
          </button>

          <button
            onClick={() => onSelectTab('register')}
            className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-amber-700 hover:bg-amber-800 active:bg-amber-900 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            રજીસ્ટ્રેશન / અપડેટ
          </button>
        </div>
      </div>
    </header>
  );
};
