import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { EventConfig, RegistrationRecord, PaxMember } from './types';
import { 
  loadEventConfig, 
  saveEventConfig, 
  loadRegistrations, 
  addRegistration, 
  updateRegistration,
  updateRegistrationStatus,
  updateRegistrationMembers
} from './utils/storage';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { RegistrationForm } from './components/RegistrationForm';
import { PassReceipt } from './components/PassReceipt';
import { OrganizerPortal } from './components/OrganizerPortal';
import { EventHighlights } from './components/EventHighlights';
import { PassLookupModal } from './components/PassLookupModal';
import { ShareLinksModal } from './components/ShareLinksModal';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { initAuth, getAccessToken } from './services/googleAuth';
import { appendRegistrationToSheets } from './services/googleSheets';

export default function App() {
  const [config, setConfig] = useState<EventConfig>(loadEventConfig);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>(loadRegistrations);
  const [activeTab, setActiveTab] = useState<'register' | 'lookup' | 'organizer' | 'details'>('register');
  const [activeReceipt, setActiveReceipt] = useState<RegistrationRecord | null>(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isShareLinksOpen, setIsShareLinksOpen] = useState(false);
  const [selectedRegIdToEdit, setSelectedRegIdToEdit] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize Firebase Auth listener for Google Workspace token management
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => setCurrentUser(user),
      () => setCurrentUser(null)
    );
    return () => unsubscribe();
  }, []);

  // Initialize view from URL query params: ?view=admin or ?view=register
  useEffect(() => {
    const handleUrlRoute = () => {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      const hash = window.location.hash;

      if (view === 'admin' || hash === '#admin') {
        setActiveTab('organizer');
      } else if ((view === 'details' || hash === '#details') && config.showItineraryToUsers) {
        setActiveTab('details');
      } else {
        setActiveTab('register');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [config.showItineraryToUsers]);

  // If itinerary is turned off and user is currently on details tab, switch back to register
  useEffect(() => {
    if (!config.showItineraryToUsers && activeTab === 'details') {
      setActiveTab('register');
    }
  }, [config.showItineraryToUsers, activeTab]);

  const switchTab = (tab: 'register' | 'lookup' | 'organizer' | 'details') => {
    if (tab === 'lookup') {
      setIsLookupOpen(true);
      return;
    }

    // Guard: do not allow details tab if not published by admin
    if (tab === 'details' && !config.showItineraryToUsers) {
      tab = 'register';
    }

    setActiveTab(tab);
    setActiveReceipt(null);
    setSelectedRegIdToEdit(null);

    // Sync URL query param
    const url = new URL(window.location.href);
    if (tab === 'organizer') {
      url.searchParams.set('view', 'admin');
    } else if (tab === 'details') {
      url.searchParams.set('view', 'details');
    } else {
      url.searchParams.set('view', 'register');
    }
    window.history.replaceState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync config
  const handleUpdateConfig = (newConfig: EventConfig) => {
    setConfig(newConfig);
    saveEventConfig(newConfig);
  };

  const handleRegistrationComplete = (newRecord: RegistrationRecord) => {
    const updated = addRegistration(newRecord);
    setRegistrations(updated);
    setActiveReceipt(newRecord);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Auto-sync into Google Sheet in Google Drive folder if signed in
    getAccessToken().then((token) => {
      if (token) {
        appendRegistrationToSheets(token, newRecord).catch((err) => {
          console.warn('Auto-sync to Google Sheet failed:', err);
        });
      }
    });
  };

  const handleRegistrationUpdate = (updatedRecord: RegistrationRecord) => {
    const updated = updateRegistration(updatedRecord);
    setRegistrations(updated);
    setActiveReceipt(updatedRecord);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Auto-sync into Google Sheet in Google Drive folder if signed in
    getAccessToken().then((token) => {
      if (token) {
        appendRegistrationToSheets(token, updatedRecord).catch((err) => {
          console.warn('Auto-sync to Google Sheet failed:', err);
        });
      }
    });
  };

  const handleUpdateStatus = (id: string, status: 'confirmed' | 'pending_verification') => {
    const updated = updateRegistrationStatus(id, status);
    setRegistrations(updated);
  };

  const handleUpdateMembers = (id: string, members: PaxMember[]) => {
    const updated = updateRegistrationMembers(id, members);
    setRegistrations(updated);
    if (activeReceipt && activeReceipt.id === id) {
      setActiveReceipt({ ...activeReceipt, members });
    }
  };

  const handleAddManual = (newReg: RegistrationRecord) => {
    const updated = addRegistration(newReg);
    setRegistrations(updated);
    setActiveReceipt(newReg);
  };

  const totalPax = registrations.reduce((sum, r) => sum + (r.numberOfPax || 0), 0);

  // Check if current user is in admin mode (strictly based on view=admin or being in organizer tab)
  const isAdminMode = activeTab === 'organizer' || window.location.search.includes('view=admin') || window.location.hash === '#admin';

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={switchTab}
        confirmedCount={registrations.length}
        config={config}
        isAdminMode={isAdminMode}
        onOpenShareLinks={() => setIsShareLinksOpen(true)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* If viewing a completed Registration Pass / Receipt */}
        {activeReceipt ? (
          <PassReceipt
            registration={activeReceipt}
            config={config}
            onNewRegistration={() => {
              setActiveReceipt(null);
              setSelectedRegIdToEdit(null);
              switchTab('register');
            }}
            onBackToHome={() => {
              setActiveReceipt(null);
              setSelectedRegIdToEdit(null);
              switchTab('register');
            }}
            onUpdateMembers={(updatedMembers) => {
              handleUpdateMembers(activeReceipt.id, updatedMembers);
            }}
            onEditRegistration={() => {
              setSelectedRegIdToEdit(activeReceipt.id);
              setActiveReceipt(null);
              switchTab('register');
            }}
          />
        ) : (
          <>
            {/* TAB: REGISTER & UPDATE */}
            {activeTab === 'register' && (
              <>
                <div className="max-w-4xl mx-auto px-4 pt-3 sm:pt-4">
                  <PWAInstallButton variant="banner" />
                </div>

                <HeroBanner
                  config={config}
                  totalRegisteredPax={totalPax}
                  onStartRegistration={() => {
                    const formEl = document.getElementById('registration-section');
                    if (formEl) {
                      formEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  onViewDetails={() => {
                    switchTab('details');
                  }}
                />

                <div id="registration-section">
                  <RegistrationForm
                    config={config}
                    registrations={registrations}
                    initialSelectedId={selectedRegIdToEdit}
                    onRegistrationComplete={handleRegistrationComplete}
                    onRegistrationUpdate={handleRegistrationUpdate}
                  />
                </div>
              </>
            )}

            {/* TAB: DETAILS & ITINERARY (Only accessible if pushed by admin) */}
            {activeTab === 'details' && config.showItineraryToUsers && (
              <EventHighlights
                config={config}
                onRegisterClick={() => {
                  switchTab('register');
                }}
              />
            )}

            {/* TAB: ORGANIZER COMMITTEE / ADMIN PORTAL */}
            {activeTab === 'organizer' && (
              <OrganizerPortal
                config={config}
                registrations={registrations}
                onUpdateConfig={handleUpdateConfig}
                onUpdateStatus={handleUpdateStatus}
                onAddManualRegistration={handleAddManual}
                onViewPass={(reg) => {
                  setActiveReceipt(reg);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onUpdateMembers={handleUpdateMembers}
                onOpenShareLinks={() => setIsShareLinksOpen(true)}
                onViewRegistrationForm={() => switchTab('register')}
                currentUser={currentUser}
                onUserChange={setCurrentUser}
              />
            )}
          </>
        )}
      </main>

      {/* Lookup Pass Modal */}
      <PassLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        registrations={registrations}
        onSelectRegistration={(reg) => {
          setActiveReceipt(reg);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Share 2 Links Modal (Admin Link & Register Link) */}
      <ShareLinksModal
        isOpen={isShareLinksOpen}
        onClose={() => setIsShareLinksOpen(false)}
        config={config}
        totalRegistrations={registrations.length}
        totalPax={totalPax}
      />

      {/* Offline Connectivity Toast Indicator */}
      <OfflineIndicator />

      {/* Quiet Footer */}
      <Footer
        config={config}
        onSelectTab={switchTab}
        isAdminMode={isAdminMode}
      />
    </div>
  );
}
