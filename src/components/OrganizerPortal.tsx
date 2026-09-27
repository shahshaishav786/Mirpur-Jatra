import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  CheckCircle, 
  Clock, 
  Settings, 
  Eye, 
  Save, 
  Share2, 
  Copy, 
  Check, 
  AlertTriangle, 
  Bus, 
  Phone,
  UserPlus,
  Link2,
  ExternalLink,
  DollarSign,
  Calendar,
  Send,
  EyeOff,
  FileSpreadsheet
} from 'lucide-react';
import { User } from 'firebase/auth';
import { EventConfig, RegistrationRecord, PaxMember } from '../types';
import { formatINR, generateRegistrationId, buildParivarWhatsAppBroadcast } from '../utils/upi';
import { MemberDetailsModal } from './MemberDetailsModal';
import { PhonePeQRCard } from './PhonePeQRCard';
import { EventHighlights } from './EventHighlights';
import { GoogleDriveSyncCard } from './GoogleDriveSyncCard';

interface OrganizerPortalProps {
  config: EventConfig;
  registrations: RegistrationRecord[];
  onUpdateConfig: (updated: EventConfig) => void;
  onUpdateStatus: (id: string, status: 'confirmed' | 'pending_verification') => void;
  onAddManualRegistration: (reg: RegistrationRecord) => void;
  onViewPass: (reg: RegistrationRecord) => void;
  onUpdateMembers: (id: string, updatedMembers: PaxMember[]) => void;
  onOpenShareLinks?: () => void;
  onViewRegistrationForm?: () => void;
  currentUser?: User | null;
  onUserChange?: (user: User | null) => void;
}

export const OrganizerPortal: React.FC<OrganizerPortalProps> = ({
  config,
  registrations,
  onUpdateConfig,
  onUpdateStatus,
  onAddManualRegistration,
  onViewPass,
  onUpdateMembers,
  onOpenShareLinks,
  onViewRegistrationForm,
  currentUser = null,
  onUserChange = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'drive_sheets' | 'itinerary' | 'links' | 'qr_code' | 'broadcast' | 'manual' | 'settings'>('roster');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending_verification'>('all');

  // Edit members modal state
  const [selectedRegForMembers, setSelectedRegForMembers] = useState<RegistrationRecord | null>(null);

  // Broadcast text copy state
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);
  const [copiedRegLink, setCopiedRegLink] = useState(false);
  const [copiedAdminLink, setCopiedAdminLink] = useState(false);

  // Itinerary push toast feedback
  const [itineraryPushToast, setItineraryPushToast] = useState('');

  // Settings form state
  const [editConfig, setEditConfig] = useState<EventConfig>(config);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Manual entry state - zero select dropdowns
  const [manualHead, setManualHead] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualNative, setManualNative] = useState('');
  const [manualPax, setManualPax] = useState(2);
  const [manualMethod, setManualMethod] = useState<'cash' | 'gpay' | 'phonepe'>('cash');
  const [manualRef, setManualRef] = useState('');

  // Computations for Organizer summary
  const totalFamilies = registrations.length;
  const totalPax = registrations.reduce((acc, r) => acc + (r.numberOfPax || 0), 0);
  const totalTokenCollected = registrations.reduce((acc, r) => acc + (r.tokenAmount || 0), 0);
  const totalEstimatedCost = registrations.reduce(
    (acc, r) => acc + (r.estimatedTotalCost || r.numberOfPax * config.estimatedCostPerPax),
    0
  );

  let totalJain = 0;
  let totalPureVeg = 0;
  let totalOther = 0;

  registrations.forEach((reg) => {
    reg.members?.forEach((mem) => {
      const food = (mem.foodPreference || '').toLowerCase();
      if (food.includes('jain') || food.includes('ચોકો')) totalJain++;
      else if (food.includes('veg') || food.includes('શાકાહારી')) totalPureVeg++;
      else totalOther++;
    });
  });

  const filteredRegs = registrations.filter((r) => {
    const matchesSearch =
      r.headName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm) ||
      (r.nativePlace && r.nativePlace.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = [
      'Registration ID',
      'Date Registered',
      'Head of Family',
      'Phone Number',
      'Native Place',
      'Residential Address',
      'Number of Pax',
      'Token Rate',
      'Total Token Paid',
      'Estimated Total Cost',
      'Payment Status',
      'Payment Method',
      'Transaction Ref / UTR',
      'Members Breakdown',
    ];

    const rows = registrations.map((r) => {
      const membersStr = (r.members || [])
        .map((m) => `${m.name} (${m.relationship}, ${m.ageCategory}, ${m.foodPreference})`)
        .join('; ');
      return [
        r.id,
        new Date(r.createdAt).toLocaleDateString(),
        `"${r.headName.replace(/"/g, '""')}"`,
        r.phone,
        `"${(r.nativePlace || '').replace(/"/g, '""')}"`,
        `"${(r.address || '').replace(/"/g, '""')}"`,
        r.numberOfPax,
        r.ratePerPax || config.ratePerPax,
        r.tokenAmount,
        r.estimatedTotalCost || r.numberOfPax * config.estimatedCostPerPax,
        r.paymentStatus,
        r.paymentMethod,
        `"${(r.transactionId || '').replace(/"/g, '""')}"`,
        `"${membersStr.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PremSamarth_JahajMandir_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(editConfig);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleToggleItineraryPush = (publish: boolean) => {
    const updated = {
      ...config,
      showItineraryToUsers: publish,
    };
    onUpdateConfig(updated);
    setEditConfig(updated);
    if (publish) {
      setItineraryPushToast('🚀 જાત્રા સમયપત્રક સફળતાપૂર્વક પરિવારોની રજીસ્ટ્રેશન લિંક પર પબ્લિશ થઈ ગયું છે!');
    } else {
      setItineraryPushToast('🔒 જાત્રા સમયપત્રક પરિવારોની રજીસ્ટ્રેશન લિંક પરથી છુપાવી દેવામાં આવ્યું છે.');
    }
    setTimeout(() => setItineraryPushToast(''), 4000);
  };

  const handleCopyBroadcast = () => {
    const text = buildParivarWhatsAppBroadcast(window.location.href, config.upiId);
    navigator.clipboard.writeText(text);
    setCopiedBroadcast(true);
    setTimeout(() => setCopiedBroadcast(false), 2500);
  };

  const origin = window.location.origin + window.location.pathname;
  const registerUrl = `${origin}?view=register`;
  const adminUrl = `${origin}?view=admin`;

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualHead.trim() || !manualPhone.trim()) return;

    const newReg: RegistrationRecord = {
      id: generateRegistrationId(),
      createdAt: new Date().toISOString(),
      headName: manualHead.trim(),
      phone: manualPhone.trim(),
      nativePlace: manualNative.trim(),
      address: '',
      numberOfPax: manualPax,
      ratePerPax: config.ratePerPax,
      tokenAmount: manualPax * config.ratePerPax,
      estimatedTotalCost: manualPax * config.estimatedCostPerPax,
      paymentStatus: 'confirmed',
      paymentMethod: manualMethod,
      transactionId: manualRef.trim() || `MANUAL-${Date.now().toString().slice(-6)}`,
      paymentNote: 'Manual registration added by committee',
      members: Array.from({ length: manualPax }).map((_, i) => ({
        id: `mem-manual-${Date.now()}-${i}`,
        name: i === 0 ? manualHead.trim() : `સભ્ય ${i + 1}`,
        ageCategory: 'મોટા / Adult (12+)',
        gender: 'Male',
        relationship: i === 0 ? 'Self / મોભી' : 'પરિવાર સભ્ય',
        foodPreference: 'શુદ્ધ જૈન ચોકો (Jain Choko)',
        roomPreference: 'Family Room',
      })),
    };

    onAddManualRegistration(newReg);
    setManualHead('');
    setManualPhone('');
    setManualNative('');
    setManualPax(2);
    setManualRef('');
    setActiveTab('roster');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
            "{config.familyGroupName}" યાત્રા સમિતિ / Admin Committee Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-neutral-900">
            સમિતિ એડમિન ડેશબોર્ડ: કેટલી નોંધણીઓ આવી?
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            પરિવાર રજીસ્ટ્રેશન યાદી, રૂમ આયોજન, ભોજન હિસાબ અને પેમેન્ટ વેરિફિકેશન.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-200 rounded-2xl">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'roster' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            પરિવાર યાદી ({totalFamilies})
          </button>
          <button
            onClick={() => setActiveTab('drive_sheets')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'drive_sheets'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel / Drive સિંક</span>
          </button>
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'itinerary' ? 'bg-white text-amber-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>સમયપત્રક પબ્લિશ {config.showItineraryToUsers ? '●' : ''}</span>
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'links' ? 'bg-white text-amber-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            🔗 ૨ લિંક્સ
          </button>
          <button
            onClick={() => setActiveTab('qr_code')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'qr_code' ? 'bg-white text-purple-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            PhonePe QR
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'broadcast' ? 'bg-white text-emerald-800 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            WhatsApp સંદેશ
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'manual' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            + ઑફલાઇન એન્ટ્રી
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            સેટિંગ્સ
          </button>
        </div>
      </div>

      {/* METRICS DASHBOARD CARDS: How many registrations came? */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Families */}
        <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold">કુલ નોંધાયેલ પરિવારો / Families</span>
            <Users className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-neutral-900">
            {totalFamilies}
          </div>
          <span className="text-[11px] text-neutral-500 block">
            કુલ {registrations.filter((r) => r.paymentStatus === 'confirmed').length} કન્ફર્મ નોંધણી
          </span>
        </div>

        {/* Metric 2: Total Pax */}
        <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold">કુલ જાત્રાળુઓ / Total Pax</span>
            <Bus className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-amber-900">
            {totalPax} <span className="text-sm font-semibold text-neutral-600">વ્યક્તિ</span>
          </div>
          <span className="text-[11px] text-neutral-500 block">
            રૂમ & લક્ઝરી AC બસ સીટ જરૂરિયાત
          </span>
        </div>

        {/* Metric 3: Total Token Collected */}
        <div className="p-5 rounded-3xl bg-white border border-emerald-300 shadow-xs space-y-2 bg-gradient-to-br from-emerald-50/50 to-white">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold">જમા થયેલ ટોકન રકમ / Tokens</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-emerald-900">
            {formatINR(totalTokenCollected)}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold block">
            ₹૧,૦૦૦/વ્યક્તિ પ્રમાણે નોન-રિફંડેબલ
          </span>
        </div>

        {/* Metric 4: Meal & Food Habits */}
        <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold">રસોડું / ભોજન વ્યવસ્થા</span>
            <span className="text-xs font-bold text-amber-800">જૈન ચોકો</span>
          </div>
          <div className="text-xs font-mono space-y-1 pt-1">
            <div className="flex justify-between">
              <span className="text-neutral-600">શુદ્ધ જૈન ચોકો:</span>
              <strong className="text-emerald-800 font-bold">{totalJain} સભ્યો</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">શાકાહારી / અન્ય:</span>
              <strong className="text-neutral-800">{totalPureVeg + totalOther} સભ્યો</strong>
            </div>
          </div>
          <span className="text-[10px] text-neutral-400 block pt-1 border-t border-neutral-100">
            અંદાજિત બજેટ: {formatINR(totalEstimatedCost)}
          </span>
        </div>
      </div>

      {/* TAB: ITINERARY PUSH / PUBLISH MANAGEMENT */}
      {activeTab === 'itinerary' && (
        <div className="bg-white border border-neutral-200 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-800 block">
                પરિવાર લિંક પર સમયપત્રક કંટ્રોલ
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 mt-0.5">
                જાત્રા શિડ્યુલ & સમયપત્રક પબ્લિશ મેનેજમેન્ટ
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                જો આપ અહીંથી સમયપત્રક પબ્લિશ કરશો તો જ તે પરિવારોની રજીસ્ટ્રેશન લિંક પર આપોઆપ દેખાશે.
              </p>
            </div>

            {/* Current Push Status Badge */}
            <div className="flex items-center gap-2">
              {config.showItineraryToUsers ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>પબ્લિશ થયેલ છે (Live on Registration Link)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>અત્યારે બંધ છે (Hidden from Families)</span>
                </span>
              )}
            </div>
          </div>

          {itineraryPushToast && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs sm:text-sm text-emerald-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{itineraryPushToast}</span>
            </div>
          )}

          {/* Action Card: Push Button */}
          <div className={`p-6 rounded-3xl border-2 transition-all space-y-4 ${
            config.showItineraryToUsers 
              ? 'bg-emerald-50/50 border-emerald-300' 
              : 'bg-amber-50/60 border-amber-300'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  {config.showItineraryToUsers
                    ? 'સમયપત્રક હાલ પરિવારો જોઈ શકે છે'
                    : 'સમયપત્રક પરિવારોની રજીસ્ટ્રેશન લિંક પર પબ્લિશ કરો'}
                </h3>
                <p className="text-xs text-neutral-600 mt-1 max-w-xl">
                  {config.showItineraryToUsers
                    ? 'પરિવારો પોતાની રજીસ્ટ્રેશન લિંક પર "તીર્થ માહિતી (Itinerary)" ટેબ દ્વારા અમદાવાદથી રવાના થવાનો સમય, નાસ્તો, જહાજ મંદિર આગમન, દર્શન, અને કાર્યક્રમની વિગતો જોઈ શકે છે.'
                    : 'આ બટન દબાવવાથી પરિવારોની રજીસ્ટ્રેશન લિંક પર વિગતવાર સમયપત્રક, પ્રવાસ રૂટ અને કાર્યક્રમની વિગતો આપોઆપ ખુલી જશે.'}
                </p>
              </div>

              {config.showItineraryToUsers ? (
                <button
                  type="button"
                  onClick={() => handleToggleItineraryPush(false)}
                  className="px-5 py-3 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>પરિવારોથી છુપાવો (Hide Itinerary)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleToggleItineraryPush(true)}
                  className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-md hover:shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>🚀 પરિવારોને પબ્લિશ કરો (Push Itinerary)</span>
                </button>
              )}
            </div>
          </div>

          {/* Live Itinerary Preview for Committee */}
          <div className="pt-4 border-t border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>સમિતિ માટે સમયપત્રક પ્રિવ્યૂ (Itinerary Preview):</span>
              </h3>
              <span className="text-xs text-neutral-500">
                {config.eventDisplayDate}
              </span>
            </div>

            <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-neutral-50/50 p-4">
              <EventHighlights
                config={config}
                onRegisterClick={() => {}}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB: 2 DEDICATED LINKS VIEW */}
      {activeTab === 'links' && (
        <div className="max-w-3xl mx-auto bg-white border border-neutral-200 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold font-display text-neutral-900 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-amber-800" />
              <span>સત્તાવાર ૨ લિંક્સ (2 Dedicated Links for Distribution)</span>
            </h2>
            <p className="text-xs text-neutral-600 mt-1">
              ૧ લી લિંક પરિવારજનોને રજીસ્ટ્રેશન અને સભ્યો અપડેટ કરવા માટે મોકલો, અને ૨ જી લિંક આયોજક સમિતિ માટે છે.
            </p>
          </div>

          {/* Link 1 Box */}
          <div className="p-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                  ૧
                </span>
                <span className="font-bold text-sm text-neutral-900">
                  પરિવાર રજીસ્ટ્રેશન અને સુધારા લિંક (Registration & Update Link)
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded">
                પરિવારજનો માટે (No Admin Info)
              </span>
            </div>

            <p className="text-xs text-neutral-700">
              આ લિંક પર કોઈપણ એડમિન વિગત કે અન્ય પરિવારોના ડેટા દેખાતા નથી. સભ્યો નવું રજીસ્ટ્રેશન કરી શકશે અથવા પોતાનો નંબર લખી સભ્યો વધારી બાકીનું ટોકન ભરી શકશે.
            </p>

            <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-emerald-300">
              <input
                type="text"
                readOnly
                value={registerUrl}
                className="w-full text-xs font-mono text-neutral-800 bg-transparent outline-hidden select-all"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(registerUrl);
                  setCopiedRegLink(true);
                  setTimeout(() => setCopiedRegLink(false), 2000);
                }}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                {copiedRegLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRegLink ? 'કોપી થઈ!' : 'લિંક કોપી'}</span>
              </button>
            </div>
          </div>

          {/* Link 2 Box */}
          <div className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center">
                  ૨
                </span>
                <span className="font-bold text-sm text-neutral-900">
                  આયોજક સમિતિ એડમિન લિંક (Admin Committee Portal Link)
                </span>
              </div>
              <span className="text-xs font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                સમિતિ સભ્યો માટે
              </span>
            </div>

            <p className="text-xs text-neutral-700">
              આ લિંકથી આયોજકો સીધા એડમિન ડેશબોર્ડમાં જઈને કેટલી નોંધણીઓ આવી, કુલ સભ્યો અને રસીદો જોઈ શકશે.
            </p>

            <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-amber-300">
              <input
                type="text"
                readOnly
                value={adminUrl}
                className="w-full text-xs font-mono text-neutral-800 bg-transparent outline-hidden select-all"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(adminUrl);
                  setCopiedAdminLink(true);
                  setTimeout(() => setCopiedAdminLink(false), 2000);
                }}
                className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                {copiedAdminLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAdminLink ? 'કોપી થઈ!' : 'લિંક કોપી'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PHONEPE QR CODE */}
      {activeTab === 'qr_code' && (
        <div className="max-w-md mx-auto bg-white border border-neutral-200 rounded-3xl shadow-xs p-6 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold font-display text-neutral-900">
              સત્તાવાર PhonePe QR કોડ
            </h2>
            <p className="text-xs text-neutral-500">
              HETAL DINESHBHAI SHAH ના ખાતા સાથે લિંક થયેલ QR કોડ
            </p>
          </div>

          <PhonePeQRCard
            payeeName={config.payeeName}
          />
        </div>
      )}

      {/* TAB: GOOGLE DRIVE & EXCEL / SHEETS SYNC */}
      {activeTab === 'drive_sheets' && (
        <div className="space-y-6">
          <GoogleDriveSyncCard
            registrations={registrations}
            currentUser={currentUser}
            onUserChange={onUserChange}
            onExportCSV={handleExportCSV}
          />
        </div>
      )}

      {/* TAB 1: ROSTER & SEARCH */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          {/* Quick Google Drive Sync Banner */}
          <GoogleDriveSyncCard
            registrations={registrations}
            currentUser={currentUser}
            onUserChange={onUserChange}
            onExportCSV={handleExportCSV}
          />

          <div className="bg-white border border-neutral-200 rounded-3xl shadow-xs overflow-hidden space-y-4">
          <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="મોભીનું નામ, ફોન, ગામ અથવા પાસ ID / Search Name or Phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              {/* Status Filter Buttons - no select dropdown */}
              <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    statusFilter === 'all' ? 'bg-white shadow-xs text-neutral-900 font-bold' : 'text-neutral-600'
                  }`}
                >
                  બધા ({registrations.length})
                </button>
                <button
                  onClick={() => setStatusFilter('confirmed')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    statusFilter === 'confirmed' ? 'bg-white shadow-xs text-emerald-800 font-bold' : 'text-neutral-600'
                  }`}
                >
                  કન્ફર્મ
                </button>
                <button
                  onClick={() => setStatusFilter('pending_verification')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    statusFilter === 'pending_verification' ? 'bg-white shadow-xs text-amber-800 font-bold' : 'text-neutral-600'
                  }`}
                >
                  પેન્ડિંગ
                </button>
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>એક્સેલ / CSV ડાઉનલોડ</span>
            </button>
          </div>

          {/* Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-700 font-bold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">પાસ ID</th>
                  <th className="py-3 px-4">પરિવારના મોભી / Head</th>
                  <th className="py-3 px-4">મોબાઈલ / Phone</th>
                  <th className="py-3 px-4">મૂળ વતન / Native</th>
                  <th className="py-3 px-4 text-center">સભ્યો (Pax)</th>
                  <th className="py-3 px-4 text-right">ટોકન રકમ</th>
                  <th className="py-3 px-4">પેમેન્ટ / UTR</th>
                  <th className="py-3 px-4 text-center">સ્થિતિ</th>
                  <th className="py-3 px-4 text-right">ક્રિયા</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredRegs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-neutral-500 font-medium">
                      કોઈ નોંધણી મળી નથી.
                    </td>
                  </tr>
                ) : (
                  filteredRegs.map((reg) => (
                    <React.Fragment key={reg.id}>
                      <tr className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                          {reg.id}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-neutral-900 block text-xs">{reg.headName}</span>
                          <span className="text-[11px] text-neutral-500">{new Date(reg.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-700 font-medium">
                          {reg.phone}
                        </td>
                        <td className="py-3 px-4 text-neutral-600">
                          {reg.nativePlace || '—'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-extrabold text-neutral-900 text-sm">
                          {reg.numberOfPax}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-800 text-sm">
                          {formatINR(reg.tokenAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold uppercase text-neutral-800 text-[11px] block">
                            {reg.paymentMethod}
                          </span>
                          <span className="font-mono text-[11px] text-neutral-500 truncate max-w-[140px] block" title={reg.transactionId}>
                            {reg.transactionId}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {reg.paymentStatus === 'confirmed' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                              <CheckCircle className="w-3 h-3" />
                              <span>કન્ફર્મ</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => onUpdateStatus(reg.id, 'confirmed')}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
                              title="ચકાસીને કન્ફર્મ કરો"
                            >
                              <Clock className="w-3 h-3" />
                              <span>વેરિફાય</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedRegForMembers(reg)}
                              className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[11px] font-bold transition-colors cursor-pointer"
                              title="સભ્યો ઉમેરો / બદલો"
                            >
                              + સભ્યો
                            </button>
                            <button
                              onClick={() => onViewPass(reg)}
                              className="p-1 hover:bg-neutral-200 rounded text-neutral-700 transition-colors cursor-pointer"
                              title="પાસ જુઓ"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* TAB 3: WHATSAPP BROADCAST */}
      {activeTab === 'broadcast' && (
        <div className="max-w-3xl mx-auto bg-white border border-neutral-200 rounded-3xl shadow-xs p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-display text-neutral-900">
                સત્તાવાર WhatsApp જાત્રા આમંત્રણ સંદેશ
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                આ સંદેશ સીધો પરિવાર કે ગ્રૂપમાં WhatsApp પર મોકલો.
              </p>
            </div>
            <button
              onClick={handleCopyBroadcast}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {copiedBroadcast ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedBroadcast ? 'મેસેજ કોપી થયો!' : 'સંદેશ કોપી કરો'}</span>
            </button>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl font-mono text-xs text-neutral-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
            {buildParivarWhatsAppBroadcast(registerUrl, config.upiId)}
          </div>
        </div>
      )}

      {/* TAB 4: MANUAL OFFLINE ENTRY - NO SELECT DROPDOWNS */}
      {activeTab === 'manual' && (
        <div className="max-w-xl mx-auto bg-white border border-neutral-200 rounded-3xl shadow-xs p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold font-display text-neutral-900">
              ઑફલાઇન / રોકડ રજીસ્ટ્રેશન ઉમેરો (Manual Entry)
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              જે સભ્યોએ રોકડ આપી હોય અથવા ફોન પર નોંધણી કરાવી હોય તેમની વિગત ઉમેરો.
            </p>
          </div>

          <form onSubmit={handleAddManual} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                પરિવારના મોભીનું નામ / Head Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={manualHead}
                onChange={(e) => setManualHead(e.target.value)}
                placeholder="દા.ત. અશોકભાઈ શાહ / Ashokbhai Shah"
                className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                મોબાઈલ નંબર / Mobile Number <span className="text-rose-600">*</span>
              </label>
              <input
                type="tel"
                required
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                placeholder="૧૦ આંકડાનો મોબાઈલ / 10-digit Mobile"
                className="w-full px-3.5 py-2 text-xs font-mono border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                મૂળ ગામ / વતન / Native Place
              </label>
              <input
                type="text"
                value={manualNative}
                onChange={(e) => setManualNative(e.target.value)}
                placeholder="દા.ત. પાટણ / ઊંઝા / Hometown"
                className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  સભ્યોની સંખ્યા / Number of Pax
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={manualPax}
                  onChange={(e) => setManualPax(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  ટોકન રકમ / Token Amount
                </label>
                <div className="px-3.5 py-2 text-xs font-mono font-bold bg-neutral-100 border border-neutral-200 rounded-xl text-neutral-900">
                  {formatINR(manualPax * config.ratePerPax)}
                </div>
              </div>
            </div>

            {/* Payment method selection using buttons (NO SELECT DROPDOWN) */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                પેમેન્ટ પદ્ધતિ / Payment Mode:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cash', label: 'રોકડ (Cash in Hand)' },
                  { id: 'phonepe', label: 'PhonePe QR' },
                  { id: 'gpay', label: 'Google Pay' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setManualMethod(item.id as any)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center cursor-pointer transition-all ${
                      manualMethod === item.id
                        ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-xs'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                રસીદ / રેફરન્સ નોંધ / Receipt Ref or Note
              </label>
              <input
                type="text"
                value={manualRef}
                onChange={(e) => setManualRef(e.target.value)}
                placeholder="દા.ત. પહોંચ #૧૨ / Cash Receipt #12"
                className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer mt-4"
            >
              નોંધણી ઉમેરો અને પાસ ઇશ્યૂ કરો / Add Registration
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl mx-auto bg-white border border-neutral-200 rounded-3xl shadow-xs p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold font-display text-neutral-900">
              જાત્રા વિગત & પેમેન્ટ સેટિંગ્સ / Settings
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Google Pay / PhonePe UPI ID અને યાત્રા માહિતી અદ્યતન કરો.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                પરિવાર / ગ્રૂપનું નામ / Family Group Name
              </label>
              <input
                type="text"
                value={editConfig.familyGroupName}
                onChange={(e) => setEditConfig({ ...editConfig, familyGroupName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Itinerary Push Toggle in Settings */}
            <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-900 block">
                  જાત્રા વિગતવાર સમયપત્રક પબ્લિશ કંટ્રોલ (Itinerary on Registration Link)
                </span>
                <span className="text-[11px] text-neutral-600 block mt-0.5">
                  જો ચાલુ હોય તો જ પરિવારોને સમયપત્રક દેખાશે
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditConfig({ ...editConfig, showItineraryToUsers: !editConfig.showItineraryToUsers })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  editConfig.showItineraryToUsers
                    ? 'bg-emerald-700 text-white'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {editConfig.showItineraryToUsers ? 'ચાલુ (Visible)' : 'બંધ (Hidden)'}
              </button>
            </div>

            {/* UPI ID */}
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wide block">
                PhonePe & Google Pay (UPI) સેટિંગ્સ
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    UPI ID <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editConfig.upiId}
                    onChange={(e) => setEditConfig({ ...editConfig, upiId: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-mono border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    GPay / PhonePe થી આ ID પર ટોકન જમા થશે
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    ખાતાધારકનું નામ / Payee Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editConfig.payeeName}
                    onChange={(e) => setEditConfig({ ...editConfig, payeeName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  ટોકન રકમ વ્યક્તિ દીઠ (₹) / Token Rate per Pax
                </label>
                <input
                  type="number"
                  required
                  value={editConfig.ratePerPax}
                  onChange={(e) => setEditConfig({ ...editConfig, ratePerPax: parseInt(e.target.value) || 1000 })}
                  className="w-full px-3.5 py-2 text-xs font-mono font-bold border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  અંદાજિત કુલ ખર્ચ વ્યક્તિ દીઠ (₹) / Estimated Cost per Pax
                </label>
                <input
                  type="number"
                  value={editConfig.estimatedCostPerPax}
                  onChange={(e) => setEditConfig({ ...editConfig, estimatedCostPerPax: parseInt(e.target.value) || 3500 })}
                  className="w-full px-3.5 py-2 text-xs font-mono font-bold border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {settingsSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>સેટિંગ્સ સફળતાપૂર્વક સાચવી લેવામાં આવ્યા છે! / Settings saved!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>સેટિંગ્સ સેવ કરો / Save Settings</span>
            </button>
          </form>
        </div>
      )}

      {/* Member Details Modal for Organizer edit */}
      {selectedRegForMembers && (
        <MemberDetailsModal
          isOpen={!!selectedRegForMembers}
          onClose={() => setSelectedRegForMembers(null)}
          registration={selectedRegForMembers}
          onSaveMembers={(updatedMembers) => {
            onUpdateMembers(selectedRegForMembers.id, updatedMembers);
            setSelectedRegForMembers(null);
          }}
        />
      )}
    </div>
  );
};
