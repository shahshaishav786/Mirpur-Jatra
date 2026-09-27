import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FolderGit2, 
  LogOut,
  ShieldCheck,
  Download
} from 'lucide-react';
import { User } from 'firebase/auth';
import { RegistrationRecord } from '../types';
import { GoogleSignInButton } from './GoogleSignInButton';
import { 
  googleSignIn, 
  logoutGoogle, 
  getAccessToken 
} from '../services/googleAuth';
import { 
  syncAllRegistrationsToSheets, 
  TARGET_DRIVE_FOLDER_URL, 
  TARGET_DRIVE_FOLDER_ID,
  SPREADSHEET_TITLE,
  SpreadsheetSyncResult
} from '../services/googleSheets';

interface GoogleDriveSyncCardProps {
  registrations: RegistrationRecord[];
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
  onExportCSV?: () => void;
}

export const GoogleDriveSyncCard: React.FC<GoogleDriveSyncCardProps> = ({
  registrations,
  currentUser,
  onUserChange,
  onExportCSV,
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SpreadsheetSyncResult | null>(null);
  const [syncError, setSyncError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setSyncError('');
    try {
      const res = await googleSignIn();
      if (res) {
        onUserChange(res.user);
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setSyncError('ગૂગલ સાઇન-ઇન નિષ્ફળ રહ્યું. કૃપા કરી ફરી પ્રયાસ કરો.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    onUserChange(null);
    setSyncResult(null);
  };

  const handleRequestSync = () => {
    setSyncError('');
    if (!currentUser) {
      handleSignIn();
      return;
    }
    // Mandatory confirmation prompt for Workspace API data updates
    setShowConfirmModal(true);
  };

  const handleConfirmSync = async () => {
    setShowConfirmModal(false);
    setIsSyncing(true);
    setSyncError('');

    try {
      let token = await getAccessToken();
      if (!token) {
        const signResult = await googleSignIn();
        if (signResult) {
          onUserChange(signResult.user);
          token = signResult.accessToken;
        }
      }

      if (!token) {
        throw new Error('Google Workspace access token unavailable. Please sign in again.');
      }

      const result = await syncAllRegistrationsToSheets(token, registrations);
      setSyncResult(result);
      setLastSyncTime(new Date().toLocaleTimeString('en-IN'));
    } catch (err: any) {
      console.error('Sync failed:', err);
      setSyncError(err?.message || 'ગૂગલ શીટમાં ડેટા સેવ કરવામાં ક્ષતિ આવી.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/60 rounded-3xl border-2 border-emerald-300 shadow-md p-6 sm:p-7 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold font-display text-neutral-900">
                Google Drive & Excel/Sheets સિંક
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300">
                લાઈવ ડ્રાઇવ ફોલ્ડર
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-0.5">
              બધા જાત્રા રજીસ્ટ્રેશન આપના નિયત ગૂગલ ડ્રાઇવ ફોલ્ડરમાં એક્સેલ/શીટમાં સ્ટોર થશે
            </p>
          </div>
        </div>

        {/* User Auth Status / Sign In Button */}
        <div>
          {currentUser ? (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shadow-2xs">
              <img
                src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'Google User')}`}
                alt="Avatar"
                className="w-6 h-6 rounded-full border border-neutral-300"
              />
              <span className="text-xs font-semibold text-neutral-800 max-w-[120px] truncate">
                {currentUser.displayName || currentUser.email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-neutral-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                title="Google ખાતું સાઇન આઉટ કરો"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <GoogleSignInButton
              onClick={handleSignIn}
              isLoading={isLoggingIn}
              label="Sign in with Google to Sync"
            />
          )}
        </div>
      </div>

      {/* Target Drive Folder Info Box */}
      <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-neutral-800 flex items-center gap-1.5">
            <FolderGit2 className="w-4 h-4 text-emerald-700" />
            <span>લક્ષિત ગૂગલ ડ્રાઇવ ફોલ્ડર (Target Drive Folder):</span>
          </span>
          <span className="font-mono text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
            ID: {TARGET_DRIVE_FOLDER_ID.slice(0, 8)}...
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Direct Drive Folder Button */}
          <a
            href={TARGET_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-all border border-neutral-300 shadow-2xs"
          >
            <FolderGit2 className="w-4 h-4 text-emerald-700" />
            <span>ગૂગલ ડ્રાઇવ ફોલ્ડર ખોલો (Open Drive Folder)</span>
            <ExternalLink className="w-3 h-3 text-neutral-500" />
          </a>

          {/* If sheet exists or synced, show direct link to Google Sheet */}
          {syncResult?.spreadsheetUrl && (
            <a
              href={syncResult.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>એક્સેલ/ગૂગલ શીટ ખોલો (Open Sheet)</span>
              <ExternalLink className="w-3 h-3 text-emerald-200" />
            </a>
          )}

          {/* Offline CSV / Excel Download */}
          {onExportCSV && (
            <button
              type="button"
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              <span>ઓફલાઇન એક્સેલ (.csv) ડાઉનલોડ</span>
            </button>
          )}
        </div>
      </div>

      {/* Sync Action & Feedback */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-neutral-600">
          <span>કુલ રેકોર્ડ્સ: <strong className="text-neutral-900 font-mono">{registrations.length} પરિવારો</strong></span>
          {lastSyncTime && (
            <span className="text-emerald-700 font-medium ml-2">
              (છેલ્લે સિંક થયું: {lastSyncTime})
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleRequestSync}
          disabled={isSyncing}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>
            {isSyncing
              ? 'શીટમાં સેવ થઈ રહ્યું છે...'
              : 'બધા ડેટા ગૂગલ શીટમાં સેવ કરો (Sync All Data)'}
          </span>
        </button>
      </div>

      {/* Success Notification */}
      {syncResult && (
        <div className="p-3.5 bg-emerald-100/80 border border-emerald-300 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-950 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              સફળતાપૂર્વક <strong>{syncResult.totalSynced} રજીસ્ટ્રેશન રેકોર્ડ્સ</strong> ડ્રાઇવ ફોલ્ડરમાં ગૂગલ શીટમાં સ્ટોર થઈ ગયા છે!
            </span>
          </div>
          <a
            href={syncResult.spreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-900 font-bold underline flex items-center gap-1 shrink-0"
          >
            <span>શીટ જુઓ</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Error Notification */}
      {syncError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{syncError}</span>
        </div>
      )}

      {/* Mandatory User Confirmation Modal for Mutating Workspace Data */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-neutral-900">
                  ગૂગલ શીટમાં ડેટા સેવ કરવાની પુષ્ટિ
                </h4>
                <p className="text-xs text-neutral-500">
                  Google Sheets Data Sync Confirmation
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              આપના ગૂગલ ડ્રાઇવ ફોલ્ડરમાં રહેલી <strong>"{SPREADSHEET_TITLE}"</strong> શીટમાં હાલના <strong>{registrations.length} રજીસ્ટ્રેશન રેકોર્ડ્સ</strong> અપડેટ કરવામાં આવશે. શું આપ આગળ વધવા માંગો છો?
            </p>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 font-mono space-y-1">
              <div>• ફોલ્ડર ID: {TARGET_DRIVE_FOLDER_ID}</div>
              <div>• અપડેટ થનાર રેકોર્ડ્સ: {registrations.length} પરિવારો</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                રદ કરો (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmSync}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
              >
                હા, શીટમાં સેવ કરો (Confirm Sync)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
