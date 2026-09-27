import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  QrCode, 
  ShieldCheck, 
  Smartphone, 
  AlertCircle, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { EventConfig, RegistrationRecord } from '../types';
import { 
  buildStandardUpiUrl, 
  buildGPayDeepLink, 
  formatINR 
} from '../utils/upi';
import { PhonePeQRCard } from './PhonePeQRCard';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Partial<RegistrationRecord>;
  config: EventConfig;
  onPaymentSuccess: (transactionId: string, paymentMethod: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'qr_scan' | 'cash') => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  registration,
  config,
  onPaymentSuccess,
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'qr_scan'>('gpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasClickedGPay, setHasClickedGPay] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const paxCount = registration.numberOfPax || 1;
  const tokenAmount = registration.tokenAmount || paxCount * config.ratePerPax;
  const note = `PremSamarth-JahajMandir-${paxCount}pax`;

  // Standard UPI and GPay URLs linked with Hetal Shah's PhonePe UPI
  const standardUpiUrl = buildStandardUpiUrl({
    upiId: config.upiId,
    payeeName: config.payeeName,
    amount: tokenAmount,
    transactionNote: note,
    transactionId: registration.id,
  });

  const gpayDeepLink = buildGPayDeepLink({
    upiId: config.upiId,
    payeeName: config.payeeName,
    amount: tokenAmount,
    transactionNote: note,
    transactionId: registration.id,
  });

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(config.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(tokenAmount.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleLaunchGPay = () => {
    setHasClickedGPay(true);
    setSelectedMethod('gpay');

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = gpayDeepLink;
      setTimeout(() => {
        window.location.href = standardUpiUrl;
      }, 500);
    } else {
      try {
        window.location.href = standardUpiUrl;
      } catch (e) {
        // ignore
      }
    }
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      setErrorMsg('કૃપા કરી Google Pay / PhonePe એપ્લિકેશનમાંથી ૧૨ આંકડાનો UPI UTR / Reference નંબર લખો / Please enter 12-digit UPI UTR number.');
      return;
    }
    if (utrNumber.trim().length < 6) {
      setErrorMsg('કૃપા કરી સાચો UPI રેફરન્સ નંબર અથવા ટ્રાન્ઝેક્શન આઈડી લખો / Please enter valid reference number.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onPaymentSuccess(utrNumber.trim(), selectedMethod);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl my-6 bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-bold text-amber-200">
                શ્રી જહાજ મંદિર જાત્રા ટોકન પેમેન્ટ / Token Payment
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display">
                ટોકન રકમ / Token Amount: {formatINR(tokenAmount)}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close payment modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-amber-100 bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-600/40">
            <span>પરિવારના મોભી: <strong>{registration.headName || 'મુખ્ય યાત્રાળુ'}</strong></span>
            <span>કુલ સભ્યો: <strong className="font-mono">{registration.numberOfPax} Pax</strong></span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* PRIMARY OPTION 1: DEFAULT GOOGLE PAY (GPAY) 1-TAP OPEN */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-2xl border-2 border-blue-400 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-blue-200 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider text-blue-900 block">
                    ડિફોલ્ટ પેમેન્ટ વિકલ્પ / Default Payment
                  </span>
                  <span className="text-sm font-bold text-neutral-900">
                    Google Pay (GPay) થી સીધું પેમેન્ટ કરો
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                ઝડપી પેમેન્ટ
              </span>
            </div>

            <p className="text-xs text-neutral-600">
              આ બટન દબાવતા સીધું Google Pay ખુલશે અને ₹{tokenAmount} ની રકમ આપોઆપ આવી જશે.
            </p>

            <button
              type="button"
              onClick={handleLaunchGPay}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Google Pay (GPay) ખોલો અને {formatINR(tokenAmount)} ચૂકવો</span>
            </button>

            {hasClickedGPay && (
              <div className="p-2.5 bg-blue-100/70 border border-blue-300 rounded-lg text-xs text-blue-950 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>જો GPay ન ખૂલે તો નીચે આપેલો QR કોડ સ્કેન કરો અથવા UPI ID કોપી કરો.</span>
              </div>
            )}
          </div>

          {/* OFFICIAL PHONEPE QR CODE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-800 pb-1 border-b border-neutral-200">
              <span className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-purple-700" />
                <span>અથવા સ્કેનરથી પેમેન્ટ કરો / Scan PhonePe QR Code</span>
              </span>
              <span className="text-[11px] text-purple-700 font-semibold">
                કોઈપણ UPI App થી સ્કેન કરો
              </span>
            </div>

            <PhonePeQRCard
              amount={tokenAmount}
              payeeName={config.payeeName}
            />
          </div>

          {/* Copyable Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-neutral-500 block">UPI ID</span>
                <span className="font-mono font-bold text-neutral-900">{config.upiId}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="p-1.5 hover:bg-neutral-200 rounded text-neutral-700 transition-colors"
                title="Copy UPI ID"
              >
                {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-neutral-500 block">ચૂકવવાની રકમ / Amount</span>
                <span className="font-mono font-bold text-neutral-900">{formatINR(tokenAmount)}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyAmount}
                className="p-1.5 hover:bg-neutral-200 rounded text-neutral-700 transition-colors"
                title="Copy Amount"
              >
                {copiedAmount ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Payment Method Selector - using buttons, zero select dropdowns */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              પેમેન્ટ એપ્લિકેશન / Payment Method Used:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: 'gpay', label: 'Google Pay' },
                { id: 'phonepe', label: 'PhonePe' },
                { id: 'paytm', label: 'Paytm' },
                { id: 'bhim', label: 'BHIM UPI' },
                { id: 'qr_scan', label: 'QR Scan' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethod(m.id as any)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    selectedMethod === m.id
                      ? 'bg-amber-100 border-amber-600 text-amber-950 font-extrabold shadow-xs'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleConfirmPayment} className="space-y-4 pt-1 border-t border-neutral-200">
            <div>
              <label htmlFor="utrInput" className="block text-xs font-bold text-neutral-800 mb-1">
                Google Pay / PhonePe ૧૨ આંકડાનો UTR નંબર / 12-digit UPI UTR Reference Number <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="utrInput"
                  type="text"
                  placeholder="દા.ત. 428919024810 અથવા GPay/PhonePe Ref ID / 12-digit UTR"
                  value={utrNumber}
                  onChange={(e) => {
                    setUtrNumber(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="w-full px-3.5 py-2.5 text-sm font-mono border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  required
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3 text-neutral-400" />
                <span>Google Pay અથવા PhonePe હિસ્ટ્રીમાં આપેલો UPI રેફરન્સ / UTR નંબર</span>
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Demo Fill Button */}
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>ટેસ્ટિંગ કરવા માટે / For Testing:</span>
              <button
                type="button"
                onClick={() => setUtrNumber(`UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`)}
                className="text-amber-800 hover:text-amber-900 underline font-semibold cursor-pointer"
              >
                નમૂનાનો UTR ઓટો-ભરો (Auto-fill Demo UTR)
              </button>
            </div>

            {/* Confirm Payment CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-60 text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>પેમેન્ટ ચકાસાઈ રહ્યું છે...</span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>ટોકન પેમેન્ટ કન્ફર્મ કરો અને જાત્રા પાસ મેળવો (Confirm & Get Pass)</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
