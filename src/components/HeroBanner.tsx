import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Bus, 
  AlertTriangle, 
  ArrowRight, 
  Phone, 
  CheckCircle2, 
  Sparkles, 
  Share2, 
  Copy, 
  Check,
  Users,
  ShieldCheck,
  Utensils,
  CreditCard,
  ArrowDown
} from 'lucide-react';
import { EventConfig } from '../types';
import { formatINR, buildParivarWhatsAppBroadcast } from '../utils/upi';

interface HeroBannerProps {
  config: EventConfig;
  totalRegisteredPax: number;
  onStartRegistration: () => void;
  onViewDetails: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  config,
  totalRegisteredPax,
  onStartRegistration,
  onViewDetails,
}) => {
  const [copiedMsg, setCopiedMsg] = useState(false);

  const handleCopyMessage = () => {
    const text = buildParivarWhatsAppBroadcast(window.location.href, config.upiId);
    navigator.clipboard.writeText(text);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = buildParivarWhatsAppBroadcast(window.location.href, config.upiId);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-100/60 via-amber-50/40 to-neutral-50 border-b border-amber-200/80">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-300/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        {/* Top Blessing Banner */}
        <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs sm:text-sm font-semibold shadow-xs">
          <span>🙏 જય જિનેન્દ્ર</span>
          <span aria-hidden="true">·</span>
          <span>"પ્રેમ સમરથ" પરિવાર સ્નેહમિલન & પવિત્ર યાત્રાધામ જાત્રા</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Hero Copy (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 font-display leading-tight">
              શ્રી જહાજ મંદિર, મીરપુર પવિત્ર જાત્રા <br />
              <span className="text-amber-800 text-2xl sm:text-3xl lg:text-4xl font-bold">
                (પાવાપુરી પાસે, રાજસ્થાન)
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-medium">
              સહર્ષ જણાવવાનું કે <strong className="text-neutral-900">"પ્રેમ સમરથ" પરિવાર</strong> હેઠળ આપણું સ્નેહમિલન એક અત્યંત સુંદર, પ્રાચીન અને ચમત્કારી તીર્થધામ ખાતે યોજવાનું નક્કી થયેલ છે.
            </p>

            {/* Crucial Room Booking Urgent Notice */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-neutral-900 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm sm:text-base">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                <span>અગત્યની સૂચના (રૂમ બુકિંગ અંગે):</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
                યાત્રાધામ પર અન્ય સંઘોનું પણ બુકિંગ ચાલુ હોવાથી, આપણે <strong>રૂમોનું કન્ફર્મેશન આગામી બુધવાર સુધીમાં આપવું અનિવાર્ય છે.</strong> ગત વખતે મોડું થવાથી આપણે સારું સ્થળ ગુમાવવું પડ્યું હતું, તેથી સમયસર નોંધણી કરાવવી જરૂરી છે.
              </p>
            </div>

            {/* Event Key Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200/90 shadow-xs flex items-start gap-3">
                <Calendar className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-neutral-900 block text-sm">૨૫, ૨૬ અને ૨૭ ડિસેમ્બર ૨૦૨૬</span>
                  <span className="text-neutral-600 block mt-0.5">૩ દિવસીય પરિવાર સ્નેહમિલન</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-neutral-200/90 shadow-xs flex items-start gap-3">
                <Bus className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-neutral-900 block text-sm">અમદાવાદથી લક્ઝરી AC બસ</span>
                  <span className="text-neutral-600 block mt-0.5">આરામદાયક બસ પ્રવાસ & ભોજન વ્યવસ્થા</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartRegistration}
                className="px-6 py-3.5 text-sm sm:text-base font-bold text-white bg-amber-700 hover:bg-amber-800 active:bg-amber-900 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>૧-સ્ટેપ ટોકન રજીસ્ટ્રેશન કરો</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {config.showItineraryToUsers && (
                <button
                  onClick={onViewDetails}
                  className="px-4 py-3.5 text-xs sm:text-sm font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-amber-700" />
                  <span>સમયપત્રક & વિગત જુઓ</span>
                </button>
              )}

              <button
                onClick={handleShareWhatsApp}
                className="px-4 py-3.5 text-xs sm:text-sm font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-emerald-800" />
                <span>WhatsApp ગ્રૂપમાં શેર કરો</span>
              </button>

              <button
                onClick={handleCopyMessage}
                className="px-4 py-3.5 text-xs sm:text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedMsg ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedMsg ? 'મેસેજ કોપી થયો!' : 'સંદેશ કોપી કરો'}</span>
              </button>
            </div>
          </div>

          {/* Right Card: Yatra Overview & Quick Registration Guidance (Col 5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-xl overflow-hidden p-6 space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                    {config.familyGroupName} સ્નેહમિલન ૨૦૨૬
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-neutral-900">
                    યાત્રા માહિતી & રજીસ્ટ્રેશન
                  </h3>
                </div>
                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-xl">
                  ૩ દિવસીય યાત્રા
                </span>
              </div>

              {/* Quick Summary Highlights */}
              <div className="space-y-2.5 text-xs text-neutral-700">
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block text-xs sm:text-sm">શ્રી જહાજ મંદિર, મીરપુર (રાજસ્થાન)</span>
                    <span className="text-neutral-600 text-[11px]">પાવાપુરી પાસે, પવિત્ર જૈન તીર્થધામ દર્શન</span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block text-xs sm:text-sm">૨૫, ૨૬ & ૨૭ ડિસેમ્બર ૨૦૨૬</span>
                    <span className="text-neutral-600 text-[11px]">શુક્રવાર, શનિવાર અને રવિવાર (નિયત સમય)</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 flex items-start gap-3">
                  <Utensils className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950 block text-xs sm:text-sm">શુદ્ધ જૈન ચોકો & ભોજન વ્યવસ્થા</span>
                    <span className="text-emerald-800 text-[11px]">સવાર-સાંજ શુદ્ધ પવિત્ર ચોખા ભોજનની સગવડ</span>
                  </div>
                </div>
              </div>

              {/* Registration Process Guide */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between font-bold text-xs text-amber-950">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>સરળ નોંધણી પ્રક્રિયા (Simple Flow):</span>
                  </span>
                  <span className="font-mono text-xs bg-amber-200/80 px-2 py-0.5 rounded text-amber-900">
                    ટોકન: ₹ ૧,૦૦૦/Pax
                  </span>
                </div>
                
                <ol className="text-xs text-neutral-700 space-y-1.5 list-decimal list-inside pl-0.5 font-medium">
                  <li>પહેલા નીચે ફોર્મમાં <strong>૧. પરિવાર મોભી & સંપર્ક વિગત (નંબર ૧ અને ૨)</strong> ઉમેરો</li>
                  <li>ત્યારબાદ <strong>૨. PhonePe & Google Pay QR કોડ</strong> સ્કેન કરી ટોકન ભરો</li>
                  <li>૧૨-આંકડાનો UTR નંબર લખી જાત્રા પાસ કન્ફર્મ કરો</li>
                </ol>
              </div>

              {/* Live Count & Room Alert */}
              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <div className="flex items-center gap-1.5 text-neutral-700">
                  <Users className="w-4 h-4 text-amber-700" />
                  <span>કુલ નોંધાયેલ: <strong className="text-neutral-900 font-mono text-sm">{totalRegisteredPax} Pax</strong></span>
                </div>
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  બુધવાર સુધી રૂમ કન્ફર્મ
                </span>
              </div>

              {/* Direct Scroll to Registration Form */}
              <button
                type="button"
                onClick={onStartRegistration}
                className="w-full py-3.5 bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-bold text-sm sm:text-base rounded-2xl transition-all cursor-pointer text-center shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span>૧. પરિવાર મોભી & સંપર્ક વિગત ભરી રજીસ્ટર કરો</span>
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
