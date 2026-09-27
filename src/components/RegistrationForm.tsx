import React, { useState, useEffect } from 'react';
import { 
  Users, 
  User, 
  Phone, 
  MapPin, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Calculator, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  Search, 
  Edit3, 
  UserPlus, 
  Home, 
  CreditCard,
  QrCode,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  Info
} from 'lucide-react';
import { EventConfig, RegistrationRecord, PaxMember } from '../types';
import { 
  formatINR, 
  generateRegistrationId, 
  buildStandardUpiUrl, 
  buildGPayDeepLink 
} from '../utils/upi';
import { PhonePeQRCard } from './PhonePeQRCard';
import { PaymentModal } from './PaymentModal';
import { MemberDetailsModal } from './MemberDetailsModal';

interface RegistrationFormProps {
  config: EventConfig;
  registrations: RegistrationRecord[];
  onRegistrationComplete: (record: RegistrationRecord) => void;
  onRegistrationUpdate: (record: RegistrationRecord) => void;
  initialSelectedId?: string | null;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  config,
  registrations,
  onRegistrationComplete,
  onRegistrationUpdate,
  initialSelectedId,
}) => {
  // Mode: 'new' or 'update'
  const [formMode, setFormMode] = useState<'new' | 'update'>('new');

  // Search in update mode
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordToUpdate, setSelectedRecordToUpdate] = useState<RegistrationRecord | null>(null);
  const [searchFeedback, setSearchFeedback] = useState('');

  // Form Fields - Head of Family & Details
  const [headName, setHeadName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [nativePlace, setNativePlace] = useState('');
  const [address, setAddress] = useState('');
  const [numberOfPax, setNumberOfPax] = useState<number>(3);

  // In-form UTR and Payment State
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentMethodUsed, setPaymentMethodUsed] = useState<string>('phonepe');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Remaining token payment state for update mode
  const [isPayingRemaining, setIsPayingRemaining] = useState(false);
  const [remainingAmountToPay, setRemainingAmountToPay] = useState(0);

  // Payment Modal visibility (optional popup backup)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdRegDraft, setCreatedRegDraft] = useState<Partial<RegistrationRecord> | null>(null);
  const [formError, setFormError] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // Member details modal for updating members in update mode
  const [showMemberModal, setShowMemberModal] = useState(false);

  // If initialSelectedId is passed, switch to update mode
  useEffect(() => {
    if (initialSelectedId) {
      const match = registrations.find((r) => r.id === initialSelectedId);
      if (match) {
        loadRecordIntoForm(match);
      }
    }
  }, [initialSelectedId, registrations]);

  const loadRecordIntoForm = (record: RegistrationRecord) => {
    setSelectedRecordToUpdate(record);
    setFormMode('update');
    setHeadName(record.headName);
    setPhone(record.phone);
    setAlternatePhone(record.alternatePhone || '');
    setNativePlace(record.nativePlace || '');
    setAddress(record.address || '');
    setNumberOfPax(record.numberOfPax);
    setSearchFeedback('');
    setFormError('');
  };

  const handleSearchRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchQuery.trim().toLowerCase();
    if (!clean) return;

    const match = registrations.find(
      (r) =>
        r.phone.includes(clean) ||
        r.id.toLowerCase() === clean ||
        r.headName.toLowerCase().includes(clean)
    );

    if (match) {
      loadRecordIntoForm(match);
      setSearchFeedback(`✅ નોંધણી મળી ગઈ: ${match.headName} (${match.id})`);
    } else {
      setSelectedRecordToUpdate(null);
      setSearchFeedback(`❌ "${searchQuery}" માટે કોઈ રજીસ્ટ્રેશન મળ્યું નથી. કૃપા કરી મોબાઈલ નંબર ચકાસો.`);
    }
  };

  const handlePaxChange = (newCount: number) => {
    const validCount = Math.max(1, Math.min(30, newCount));
    setNumberOfPax(validCount);
  };

  // Calculations
  const tokenAmount = numberOfPax * config.ratePerPax;
  const estimatedTotalCost = numberOfPax * config.estimatedCostPerPax;

  // In update mode, calculate differential token if pax increased
  const previousPax = selectedRecordToUpdate ? selectedRecordToUpdate.numberOfPax : 0;
  const previousTokenPaid = selectedRecordToUpdate ? selectedRecordToUpdate.tokenAmount : 0;
  const paxDiff = numberOfPax - previousPax;
  const remainingTokenRequired = paxDiff > 0 ? paxDiff * config.ratePerPax : 0;

  // Payable amount on the QR scanner (either full token or remaining token)
  const currentPayableAmount = formMode === 'new' ? tokenAmount : remainingTokenRequired;

  const validateHeadDetails = () => {
    if (!headName.trim()) {
      setFormError('કૃપા કરી પરિવારના મોભીનું પૂરું નામ લખો / Please enter Head of Family Name.');
      const headEl = document.getElementById('head-name-input');
      if (headEl) {
        headEl.focus();
        headEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setFormError('કૃપા કરી માન્ય ૧૦ આંકડાનો મોબાઈલ નંબર લખો / Please enter valid 10-digit mobile number.');
      const phoneEl = document.getElementById('phone-input');
      if (phoneEl) {
        phoneEl.focus();
        phoneEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }
    setFormError('');
    return true;
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(config.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleLaunchGPayDirect = () => {
    if (!headName.trim()) {
      setFormError('કૃપા કરી પહેલા પરિવારના મોભીનું પૂરું નામ ઉમેરો / Please enter Head of Family Name first.');
      const headEl = document.getElementById('head-name-input');
      if (headEl) {
        headEl.focus();
        headEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setFormError('');
    setPaymentMethodUsed('gpay');

    const note = `PremSamarth-${numberOfPax}pax`;
    const deepLink = buildGPayDeepLink({
      upiId: config.upiId,
      payeeName: config.payeeName,
      amount: currentPayableAmount,
      transactionNote: note,
    });
    const standardUrl = buildStandardUpiUrl({
      upiId: config.upiId,
      payeeName: config.payeeName,
      amount: currentPayableAmount,
      transactionNote: note,
    });

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = deepLink;
      setTimeout(() => {
        window.location.href = standardUrl;
      }, 500);
    } else {
      window.open(standardUrl, '_blank');
    }
  };

  // Direct In-Form Submission with UTR
  const handleDirectSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateHeadDetails()) return;

    if (!utrNumber.trim()) {
      setFormError('કૃપા કરી PhonePe / Google Pay પેમેન્ટ કર્યા બાદ ૧૨ આંકડાનો UTR / Reference નંબર લખો / Please enter 12-digit UTR number.');
      const utrEl = document.getElementById('in-form-utr-input');
      if (utrEl) {
        utrEl.focus();
        utrEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (utrNumber.trim().length < 6) {
      setFormError('કૃપા કરી સાચો UPI રેફરન્સ નંબર અથવા UTR લખો / Please enter valid UTR.');
      return;
    }

    setIsSubmitting(true);

    if (formMode === 'new') {
      // Create new registration record
      const initialMembers: PaxMember[] = [
        {
          id: `mem-${Date.now()}-1`,
          name: headName.trim(),
          relationship: 'Self / મોભી',
          ageCategory: 'મોટા / Adult (12+)',
          gender: 'Male',
          foodPreference: 'શુદ્ધ જૈન ચોકો (Jain Choko)',
          roomPreference: 'Family Room',
        },
      ];

      const newRecord: RegistrationRecord = {
        id: generateRegistrationId(),
        createdAt: new Date().toISOString(),
        headName: headName.trim(),
        phone: phone.trim(),
        alternatePhone: alternatePhone.trim() || undefined,
        nativePlace: nativePlace.trim(),
        address: address.trim(),
        numberOfPax,
        initialPax: numberOfPax,
        ratePerPax: config.ratePerPax,
        tokenAmount,
        initialTokenPaid: tokenAmount,
        estimatedTotalCost,
        members: initialMembers,
        paymentMethod: paymentMethodUsed,
        paymentStatus: 'confirmed',
        transactionId: utrNumber.trim(),
        paymentNote: `Paid via ${paymentMethodUsed.toUpperCase()}`,
        paymentHistory: [
          {
            amount: tokenAmount,
            transactionId: utrNumber.trim(),
            date: new Date().toISOString(),
            method: paymentMethodUsed,
            note: 'Initial Token Payment',
          },
        ],
      };

      setTimeout(() => {
        setIsSubmitting(false);
        onRegistrationComplete(newRecord);
      }, 500);
    } else if (selectedRecordToUpdate) {
      // Update registration with remaining token
      const updatedMembers = [...(selectedRecordToUpdate.members || [])];
      while (updatedMembers.length < numberOfPax) {
        const i = updatedMembers.length;
        updatedMembers.push({
          id: `mem-${selectedRecordToUpdate.id}-${i + 1}`,
          name: '',
          relationship: 'પરિવાર સભ્ય / Family Member',
          ageCategory: 'મોટા / Adult (12+)',
          gender: 'Male',
          foodPreference: 'શુદ્ધ જૈન ચોકો (Jain Choko)',
          roomPreference: 'Family Room',
        });
      }

      const newTotalToken = previousTokenPaid + remainingTokenRequired;
      const combinedRecord: RegistrationRecord = {
        ...selectedRecordToUpdate,
        headName: headName.trim(),
        phone: phone.trim(),
        alternatePhone: alternatePhone.trim() || undefined,
        nativePlace: nativePlace.trim(),
        address: address.trim(),
        numberOfPax,
        tokenAmount: newTotalToken,
        estimatedTotalCost: numberOfPax * config.estimatedCostPerPax,
        members: updatedMembers,
        transactionId: `${selectedRecordToUpdate.transactionId} + Addl:${utrNumber.trim()}`,
        paymentStatus: 'confirmed',
        updatedAt: new Date().toISOString(),
        paymentHistory: [
          ...(selectedRecordToUpdate.paymentHistory || [
            {
              amount: previousTokenPaid,
              transactionId: selectedRecordToUpdate.transactionId,
              date: selectedRecordToUpdate.createdAt,
              method: selectedRecordToUpdate.paymentMethod,
              note: 'Initial Token',
            },
          ]),
          {
            amount: remainingTokenRequired,
            transactionId: utrNumber.trim(),
            date: new Date().toISOString(),
            method: paymentMethodUsed,
            note: `Remaining token for +${paxDiff} pax`,
          },
        ],
      };

      setTimeout(() => {
        setIsSubmitting(false);
        onRegistrationUpdate(combinedRecord);
      }, 500);
    }
  };

  // Save Updated Registration Details (without Pax Increase)
  const handleSaveUpdatedDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateHeadDetails() || !selectedRecordToUpdate) return;

    let updatedMembers = [...(selectedRecordToUpdate.members || [])];
    if (updatedMembers.length < numberOfPax) {
      while (updatedMembers.length < numberOfPax) {
        const i = updatedMembers.length;
        updatedMembers.push({
          id: `mem-${selectedRecordToUpdate.id}-${i + 1}`,
          name: '',
          relationship: 'પરિવાર સભ્ય / Family Member',
          ageCategory: 'મોટા / Adult (12+)',
          gender: 'Male',
          foodPreference: 'શુદ્ધ જૈન ચોકો (Jain Choko)',
          roomPreference: 'Family Room',
        });
      }
    }

    const updatedRecord: RegistrationRecord = {
      ...selectedRecordToUpdate,
      headName: headName.trim(),
      phone: phone.trim(),
      alternatePhone: alternatePhone.trim() || undefined,
      nativePlace: nativePlace.trim(),
      address: address.trim(),
      numberOfPax,
      estimatedTotalCost: numberOfPax * config.estimatedCostPerPax,
      members: updatedMembers,
      updatedAt: new Date().toISOString(),
    };

    onRegistrationUpdate(updatedRecord);
    setFormSuccessMessage('✅ રજીસ્ટ્રેશન વિગતો સફળતાપૂર્વક અપડેટ થઈ ગઈ છે! / Registration details updated successfully!');
    setTimeout(() => setFormSuccessMessage(''), 3000);
  };

  const handleResetToNew = () => {
    setFormMode('new');
    setSelectedRecordToUpdate(null);
    setHeadName('');
    setPhone('');
    setAlternatePhone('');
    setNativePlace('');
    setAddress('');
    setNumberOfPax(3);
    setUtrNumber('');
    setSearchQuery('');
    setSearchFeedback('');
    setFormError('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 2-Mode Selector Tab: New Registration VS Update Registration */}
      <div className="mb-8 p-1.5 bg-neutral-200/90 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 shadow-inner">
        <button
          type="button"
          onClick={handleResetToNew}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            formMode === 'new'
              ? 'bg-white text-neutral-900 shadow-sm border border-neutral-300'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-700" />
          <span>૧. નવું રજીસ્ટ્રેશન (New Family Registration)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setFormMode('update');
            setFormError('');
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            formMode === 'update'
              ? 'bg-white text-amber-900 shadow-sm border border-amber-300'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
          }`}
        >
          <Edit3 className="w-4 h-4 text-amber-700" />
          <span>૨. રજીસ્ટ્રેશન સુધારો & સભ્યો ઉમેરો (Update Registration & Add Pax)</span>
        </button>
      </div>

      {/* Info Notice Banner */}
      <div className="mb-6 p-4 bg-amber-100/70 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
            {formMode === 'new' ? '૧' : '✏️'}
          </div>
          <div>
            <span className="font-bold text-neutral-900 text-sm block">
              {formMode === 'new'
                ? 'પરિવાર મોભીની વિગત & ટોકન રકમથી ઝડપી રજીસ્ટ્રેશન'
                : 'હાલની નોંધણીમાં સુધારો, સભ્યો વધારવા (Pax Increase) અને બાકીનું ટોકન'}
            </span>
            <span className="text-xs text-neutral-700 block mt-0.5">
              વ્યક્તિ દીઠ ₹૧,૦૦૦ ટોકન રકમ. મોભીનું નામ ઉમેરી સીધો QR કોડ સ્કેન કરી પેમેન્ટ કન્ફર્મ કરો.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-200 shrink-0">
          <span>ટોકન: ₹ ૧,૦૦૦ / Person</span>
        </div>
      </div>

      {formError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {formSuccessMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs sm:text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{formSuccessMessage}</span>
        </div>
      )}

      {/* MODE 2: SEARCH TO UPDATE EXISTING REGISTRATION */}
      {formMode === 'update' && !selectedRecordToUpdate && (
        <div className="mb-8 bg-white rounded-3xl border-2 border-amber-300 shadow-sm p-6 sm:p-8 space-y-4">
          <div>
            <h3 className="text-lg font-bold font-display text-neutral-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-700" />
              <span>આપનું અગાઉનું રજીસ્ટ્રેશન શોધો (Find Your Registration to Update)</span>
            </h3>
            <p className="text-xs text-neutral-600 mt-1">
              નોંધાયેલ મોબાઈલ નંબર અથવા પાસ ID (જેમ કે PS-2026-...) લખીને આપનું રજીસ્ટ્રેશન ખોલો.
            </p>
          </div>

          <form onSubmit={handleSearchRegistration} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-800">
                મોબાઈલ નંબર અથવા પાસ ID / Mobile Number or Registration Pass ID <span className="text-rose-600">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="દા.ત. 9428001127 અથવા PS-2026-XXXX / Mobile or ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 text-sm border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0"
                >
                  શોધો / Search
                </button>
              </div>
            </div>

            {searchFeedback && (
              <p className="text-xs font-semibold text-neutral-800 p-2.5 bg-neutral-100 rounded-lg">
                {searchFeedback}
              </p>
            )}
          </form>
        </div>
      )}

      {/* When record is loaded in Update Mode, show a highlighted badge */}
      {formMode === 'update' && selectedRecordToUpdate && (
        <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-amber-800 block">
              સુધારી રહેલ રજીસ્ટ્રેશન / Editing Registration Pass
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base font-bold text-neutral-900 font-display">
                {selectedRecordToUpdate.headName}
              </span>
              <span className="font-mono text-xs font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                {selectedRecordToUpdate.id}
              </span>
            </div>
            <div className="text-xs text-neutral-600 mt-1">
              અગાઉ નોંધાયેલ સભ્યો: <strong className="font-mono text-neutral-900">{previousPax} Pax</strong> · અગાઉ ભરેલ ટોકન: <strong className="font-mono text-emerald-800">{formatINR(previousTokenPaid)}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMemberModal(true)}
              className="px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>સભ્યોની વિગત જુઓ / બદલો</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRecordToUpdate(null)}
              className="px-3 py-2 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              બીજું શોધો
            </button>
          </div>
        </div>
      )}

      {/* Main Registration / Update Form */}
      {(formMode === 'new' || selectedRecordToUpdate) && (
        <form
          onSubmit={formMode === 'update' && paxDiff <= 0 ? handleSaveUpdatedDetails : handleDirectSubmitRegistration}
          className="space-y-6"
        >
          {/* POINT 1: COMBINED FAMILY HEAD & CONTACT DETAILS (POINT 1 & 2 COMBINED) */}
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                  {config.familyGroupName} સ્નેહમિલન ૨૦૨૬
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 mt-0.5">
                  ૧. પરિવાર મોભી & સંપર્ક વિગતો / Head of Family & Contact Details
                </h2>
                <p className="text-xs text-neutral-600 mt-0.5">
                  મોભીનું નામ અને સંપર્ક નંબર ૧ & ૨ ઉમેરો (વિગત ઉમેરાયા બાદ નીચે ૨. સત્તાવાર પેમેન્ટ સ્કેનર સક્રિય થશે)
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-[11px] text-neutral-500 block">પવિત્ર યાત્રાધામ</span>
                <span className="text-xs font-bold text-amber-900 font-display">શ્રી જહાજ મંદિર (મીરપુર)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Field 1: Head of Family Name (Full Width) */}
              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="head-name-input" className="block text-xs font-bold text-neutral-800">
                  પરિવારના મોભીનું પૂરું નામ / Head of Family Full Name <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="head-name-input"
                    type="text"
                    required
                    placeholder="દા.ત. રાજુભાઈ શાહ / Full Name of Head"
                    value={headName}
                    onChange={(e) => {
                      setHeadName(e.target.value);
                      if (formError) setFormError('');
                    }}
                    className="w-full pl-10 pr-3.5 py-3 text-sm sm:text-base font-medium border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              {/* Field 2: Contact Number 1 (Primary Mobile / WhatsApp) */}
              <div>
                <label htmlFor="phone-input" className="block text-xs font-bold text-neutral-800 mb-1.5">
                  સંપર્ક નંબર ૧ (વોટ્સએપ / મુખ્ય મોબાઈલ) / Contact No. 1 <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="phone-input"
                    type="tel"
                    required
                    placeholder="૧૦ આંકડાનો મુખ્ય મોબાઈલ (દા.ત. 9428001127)"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (formError) setFormError('');
                    }}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm font-mono border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  મુખ્ય નંબર - યાત્રા પાસ & ગ્રુપ અપડેટ્સ આ નંબર પર મોકલાશે
                </span>
              </div>

              {/* Field 3: Contact Number 2 (Alternate / Secondary Mobile) */}
              <div>
                <label htmlFor="alt-phone-input" className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center justify-between">
                  <span>સંપર્ક નંબર ૨ (વૈકલ્પિક / ઘરનો નંબર) / Contact No. 2</span>
                  <span className="text-[11px] font-normal text-neutral-500">(મરજિયાત / Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="alt-phone-input"
                    type="tel"
                    placeholder="બીજો મોબાઈલ નંબર (વૈકલ્પિક / ઘરનો નંબર)"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm font-mono border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  ઈમરજન્સી અથવા પરિવારના અન્ય સભ્યનો સંપર્ક નંબર
                </span>
              </div>

              {/* Field 4: Native Place */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  મૂળ વતન / શહેર / ગામ / Native Place or Hometown
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="દા.ત. પાટણ / ઊંઝા / વિસનગર / સિદ્ધપુર / Native Village"
                    value={nativePlace}
                    onChange={(e) => setNativePlace(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              {/* Field 5: Current Address (Optional) */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center justify-between">
                  <span>હાલનું રહેઠાણનું સરનામું / Current Residential Address</span>
                  <span className="text-[11px] font-normal text-neutral-500">(મરજિયાત)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Home className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="દા.ત. સેટેલાઇટ, પાલડી, બોડકદેવ, અમદાવાદ"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic feedback indicator right inside combined point 1 */}
            {headName.trim() && phone.trim() ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  ✓ પરિવાર મોભી: <strong>{headName}</strong> | સંપર્ક ૧: <strong>{phone}</strong>{alternatePhone.trim() ? ` | સંપર્ક ૨: ${alternatePhone}` : ''} ઉમેરાઈ ગયા છે. હવે નીચે આપેલ <strong>૨. સત્તાવાર પેમેન્ટ સ્કેનર</strong>થી ટોકન રકમ ભરો.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200/60 px-4 py-2.5 rounded-xl">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>મોભીનું નામ અને સંપર્ક વિગત ઉમેર્યા પછી તરત જ નીચે PhonePe & Google Pay QR કોડ સ્કેનરથી પેમેન્ટ કરી શકાશે.</span>
              </div>
            )}
          </div>

          {/* POINT 2: OFFICIAL PAYMENT SCANNER: PHONEPE & GOOGLE PAY QR CODE (PLACED DIRECTLY AFTER POINT 1) */}
          <div className="bg-gradient-to-br from-purple-50/70 via-white to-amber-50/60 rounded-3xl border-2 border-purple-300 shadow-lg p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-neutral-900">
                    ૨. સત્તાવાર પેમેન્ટ સ્કેનર: PhonePe & Google Pay QR કોડ
                  </h3>
                  <span className="text-xs text-purple-900 font-medium block">
                    Official Payment Scanner ({config.payeeName} · {config.upiId})
                  </span>
                </div>
              </div>
              <div className="text-xs font-bold text-purple-900 bg-purple-100 border border-purple-200 px-3 py-1 rounded-xl">
                ટોકન: વ્યક્તિ દીઠ ₹ ૧,૦૦૦/-
              </div>
            </div>

            {/* If head name is filled, show clear personalization banner */}
            {headName.trim() && (
              <div className="p-3 bg-purple-100/70 border border-purple-300 rounded-xl flex items-center justify-between gap-2 text-xs text-purple-950 font-bold">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-700" />
                  <span>શ્રી {headName} પરિવાર માટે સત્તાવાર પેમેન્ટ સ્કેનર</span>
                </span>
                <span className="bg-white/80 px-2.5 py-0.5 rounded-lg border border-purple-200 font-mono">
                  {numberOfPax} વ્યક્તિ (Pax) = {formatINR(currentPayableAmount)}
                </span>
              </div>
            )}

            {/* Grid: Pax Selector & Live Calculation on Left, QR Code on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Pax Selector, Calculations, and GPay Button (7 Cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Pax Counter */}
                <div className="p-4 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-3">
                  <label className="block text-xs font-bold text-neutral-800">
                    {formMode === 'new'
                      ? 'જાત્રામાં જોડાનાર કુલ સભ્યો (Number of Pax):'
                      : 'સભ્યોની સંખ્યા સુધારો (Update Pax):'}
                  </label>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handlePaxChange(numberOfPax - 1)}
                      disabled={numberOfPax <= 1}
                      className="w-11 h-11 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 disabled:opacity-40 flex items-center justify-center text-neutral-800 transition-colors cursor-pointer"
                      aria-label="Decrease Pax"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="flex-1 text-center py-2 px-3 bg-amber-50 rounded-xl border border-amber-400">
                      <span className="text-2xl sm:text-3xl font-extrabold font-mono text-neutral-950 block">
                        {numberOfPax}
                      </span>
                      <span className="text-[11px] font-bold text-amber-900 uppercase">
                        {numberOfPax === 1 ? 'સભ્ય (Person)' : 'સભ્યો (Persons / Pax)'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePaxChange(numberOfPax + 1)}
                      disabled={numberOfPax >= 30}
                      className="w-11 h-11 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 disabled:opacity-40 flex items-center justify-center text-neutral-800 transition-colors cursor-pointer"
                      aria-label="Increase Pax"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Preset Pax Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-neutral-500 font-medium">વારંવાર પસંદ થતા:</span>
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handlePaxChange(preset)}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          numberOfPax === preset
                            ? 'bg-amber-700 text-white'
                            : 'bg-neutral-100 border border-neutral-200 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {preset} Pax
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-neutral-700">
                    <span>કુલ સભ્યો (Current Pax):</span>
                    <span className="font-mono font-bold text-neutral-900">{numberOfPax} વ્યક્તિ</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-700">
                    <span>ટોકન દર (Rate per Pax):</span>
                    <span className="font-mono font-bold text-neutral-900">₹ ૧,૦૦૦ / Person</span>
                  </div>

                  {formMode === 'new' ? (
                    <div className="pt-2 border-t border-dashed border-neutral-300 flex items-center justify-between font-bold">
                      <span className="text-amber-950 font-display text-sm">જમા કરવાની ટોકન રકમ (Payable):</span>
                      <span className="font-mono text-xl font-black text-amber-800">
                        {formatINR(tokenAmount)}
                      </span>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-dashed border-neutral-300 space-y-1">
                      <div className="flex justify-between text-neutral-600">
                        <span>અગાઉ ભરેલ ટોકન ({previousPax} Pax):</span>
                        <span className="font-mono font-bold text-emerald-800">{formatINR(previousTokenPaid)}</span>
                      </div>
                      {paxDiff > 0 ? (
                        <div className="p-2 bg-amber-50 rounded-lg border border-amber-300 flex justify-between font-bold text-amber-950">
                          <span>બાકી રહેલ ટોકન રકમ (+{paxDiff} Pax):</span>
                          <span className="font-mono text-base text-rose-700 font-black">{formatINR(remainingTokenRequired)}</span>
                        </div>
                      ) : (
                        <div className="p-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded">
                          ✓ કોઈ વધારાની ટોકન રકમ ભરવાની જરૂર નથી.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Direct Google Pay 1-Tap Launcher Button */}
                <div className="p-4 bg-blue-50/80 rounded-2xl border-2 border-blue-300 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-blue-700" />
                      <span>Google Pay (GPay) ડાયરેક્ટ પેમેન્ટ</span>
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      ડિફોલ્ટ વિકલ્પ
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLaunchGPayDirect}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Google Pay (GPay) ખોલો અને {formatINR(currentPayableAmount)} ચૂકવો</span>
                  </button>

                  <div className="flex items-center justify-between text-xs text-neutral-600 pt-1">
                    <span className="font-mono">UPI ID: <strong>{config.upiId}</strong></span>
                    <button
                      type="button"
                      onClick={handleCopyUpiId}
                      className="text-amber-800 hover:text-amber-900 text-[11px] font-bold underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUpi ? 'કોપી થઈ!' : 'UPI કોપી'}</span>
                    </button>
                  </div>
                </div>

                {/* UTR / Reference Number Input Field Right Here */}
                {(formMode === 'new' || paxDiff > 0) && (
                  <div className="p-4 bg-white rounded-2xl border-2 border-emerald-300 shadow-sm space-y-2">
                    <label htmlFor="in-form-utr-input" className="block text-xs font-bold text-neutral-900">
                      Google Pay / PhonePe ૧૨ આંકડાનો UTR નંબર / 12-digit UPI UTR Number <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="in-form-utr-input"
                      type="text"
                      placeholder="દા.ત. 428919024810 (12 digits UTR Ref)"
                      value={utrNumber}
                      onChange={(e) => {
                        setUtrNumber(e.target.value);
                        if (formError) setFormError('');
                      }}
                      className="w-full px-3.5 py-2.5 text-sm font-mono border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Info className="w-3 h-3 text-neutral-400" />
                        <span>પેમેન્ટ હિસ્ટ્રીમાં આપેલો UPI રેફરન્સ / UTR</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setUtrNumber(`UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`)}
                        className="text-amber-800 hover:text-amber-900 underline font-semibold cursor-pointer"
                      >
                        ટેસ્ટિંગ UTR ઓટો-ભરો
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Authentic PhonePe & GPay QR Code Card (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="w-full">
                  <PhonePeQRCard
                    amount={currentPayableAmount}
                    payeeName={config.payeeName}
                  />
                </div>
                <p className="text-[11px] text-center text-neutral-500 mt-2">
                  કોઈપણ UPI App (PhonePe, GPay, Paytm, BHIM) થી સ્કેન કરી શકાય છે
                </p>
              </div>
            </div>
          </div>

          {/* POINT 3: CONFIRMATION & FINAL SUBMIT ACTION BOX */}
          <div className="p-6 bg-white rounded-3xl border border-neutral-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-neutral-600">
              <span className="block font-semibold text-neutral-800 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>૩. પુષ્ટિ & અધિકૃત યાત્રા પાસ જનરેશન / Confirmation</span>
              </span>
              <span className="block text-neutral-700">
                રૂમ કન્ફર્મેશન આખરી મુદત: <strong className="text-amber-900 font-bold">આગામી બુધવાર</strong>
              </span>
              <span className="text-[11px] text-neutral-500 block mt-0.5">
                ટોકન રકમ જમા થયા બાદ તુરંત જ આપનો અધિકૃત યાત્રા પાસ જનરેટ થઈ જશે.
              </span>
            </div>

            {formMode === 'new' ? (
              /* New Registration: Submit & Confirm Token */
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-60 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-200" />
                <span>
                  {isSubmitting
                    ? 'પેમેન્ટ ચકાસાઈ રહ્યું છે...'
                    : `ટોકન પેમેન્ટ કન્ફર્મ કરો અને જાત્રા પાસ મેળવો (${formatINR(tokenAmount)}) →`}
                </span>
              </button>
            ) : (
              /* Update Mode Buttons */
              <div className="w-full sm:w-auto flex flex-wrap items-center gap-3">
                {paxDiff > 0 ? (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3.5 bg-rose-700 hover:bg-rose-800 active:bg-rose-900 disabled:opacity-60 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-5 h-5 text-rose-200" />
                    <span>
                      {isSubmitting
                        ? 'ચકાસાઈ રહ્યું છે...'
                        : `બાકી રહેલ ટોકન ${formatINR(remainingTokenRequired)} જમા કરી પાસ મેળવો →`}
                    </span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5 text-amber-200" />
                    <span>સુધારેલી માહિતી સાચવો / Save Updated Registration</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </form>
      )}

      {/* Payment Processing Modal with PhonePe / GPay QR code (Optional Popup Backup) */}
      {showPaymentModal && createdRegDraft && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          registration={createdRegDraft}
          config={config}
          onPaymentSuccess={(transactionId, paymentMethod) => {
            if (!createdRegDraft) return;

            if (isPayingRemaining && selectedRecordToUpdate) {
              const updatedMembers = [...(selectedRecordToUpdate.members || [])];
              while (updatedMembers.length < numberOfPax) {
                const i = updatedMembers.length;
                updatedMembers.push({
                  id: `mem-${selectedRecordToUpdate.id}-${i + 1}`,
                  name: '',
                  relationship: 'પરિવાર સભ્ય / Family Member',
                  ageCategory: 'મોટા / Adult (12+)',
                  gender: 'Male',
                  foodPreference: 'શુદ્ધ જૈન ચોકો (Jain Choko)',
                  roomPreference: 'Family Room',
                });
              }

              const newTotalToken = previousTokenPaid + remainingAmountToPay;
              const combinedRecord: RegistrationRecord = {
                ...selectedRecordToUpdate,
                headName: headName.trim(),
                phone: phone.trim(),
                alternatePhone: alternatePhone.trim() || undefined,
                nativePlace: nativePlace.trim(),
                address: address.trim(),
                numberOfPax,
                tokenAmount: newTotalToken,
                estimatedTotalCost: numberOfPax * config.estimatedCostPerPax,
                members: updatedMembers,
                transactionId: `${selectedRecordToUpdate.transactionId} + Addl:${transactionId}`,
                paymentStatus: 'confirmed',
                updatedAt: new Date().toISOString(),
                paymentHistory: [
                  ...(selectedRecordToUpdate.paymentHistory || [
                    {
                      amount: previousTokenPaid,
                      transactionId: selectedRecordToUpdate.transactionId,
                      date: selectedRecordToUpdate.createdAt,
                      method: selectedRecordToUpdate.paymentMethod,
                      note: 'Initial Token',
                    },
                  ]),
                  {
                    amount: remainingAmountToPay,
                    transactionId,
                    date: new Date().toISOString(),
                    method: paymentMethod,
                    note: `Remaining token for +${paxDiff} pax`,
                  },
                ],
              };

              setShowPaymentModal(false);
              onRegistrationUpdate(combinedRecord);
            } else {
              const fullRecord: RegistrationRecord = {
                ...(createdRegDraft as RegistrationRecord),
                paymentStatus: 'confirmed',
                paymentMethod,
                transactionId,
                paymentNote: `Paid via ${paymentMethod.toUpperCase()}`,
                paymentHistory: [
                  {
                    amount: tokenAmount,
                    transactionId,
                    date: new Date().toISOString(),
                    method: paymentMethod,
                    note: 'Initial Token Payment',
                  },
                ],
              };

              setShowPaymentModal(false);
              onRegistrationComplete(fullRecord);
            }
          }}
        />
      )}

      {/* Member Details Modal for update mode */}
      {showMemberModal && selectedRecordToUpdate && (
        <MemberDetailsModal
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          registration={{
            ...selectedRecordToUpdate,
            numberOfPax,
          }}
          onSaveMembers={(updatedMembers) => {
            const updated = {
              ...selectedRecordToUpdate,
              members: updatedMembers,
            };
            setSelectedRecordToUpdate(updated);
            onRegistrationUpdate(updated);
            setShowMemberModal(false);
          }}
        />
      )}
    </div>
  );
};
