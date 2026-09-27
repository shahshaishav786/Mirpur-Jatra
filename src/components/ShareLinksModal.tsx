import React, { useState } from 'react';
import { X, Link2, Copy, Check, Share2, Shield, UserCheck, ExternalLink } from 'lucide-react';
import { EventConfig } from '../types';

interface ShareLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: EventConfig;
  totalRegistrations: number;
  totalPax: number;
}

export const ShareLinksModal: React.FC<ShareLinksModalProps> = ({
  isOpen,
  onClose,
  config,
  totalRegistrations,
  totalPax,
}) => {
  const [copiedLink1, setCopiedLink1] = useState(false);
  const [copiedLink2, setCopiedLink2] = useState(false);

  if (!isOpen) return null;

  const origin = window.location.origin + window.location.pathname;
  const registerAndUpdateUrl = `${origin}?view=register`;
  const adminUrl = `${origin}?view=admin`;

  const copyToClipboard = (text: string, isLink1: boolean) => {
    navigator.clipboard.writeText(text);
    if (isLink1) {
      setCopiedLink1(true);
      setTimeout(() => setCopiedLink1(false), 2200);
    } else {
      setCopiedLink2(true);
      setTimeout(() => setCopiedLink2(false), 2200);
    }
  };

  const whatsappRegisterText = encodeURIComponent(
    `જય જિનેન્દ્ર 🙏✨\n\n"${config.familyGroupName}" પરિવાર હેઠળ આપણું સ્નેહમિલન & જાત્રા ${config.pilgrimageDestination} ખાતે યોજાયેલ છે.\n\n` +
    `તારીખ: ${config.eventDisplayDate}\n` +
    `ટોકન રકમ: ₹૧,૦૦૦/- પ્રતિ વ્યક્તિ\n\n` +
    `📝 રજીસ્ટ્રેશન કરવા અથવા અગાઉનું રજીસ્ટ્રેશન સુધારવા (Update Registration / Add Pax) નીચેની સત્તાવાર લિંક પર ક્લિક કરો:\n` +
    `👉 ${registerAndUpdateUrl}\n\n` +
    `નોંધ: રૂમ બુકિંગ માટે સમયસર નોંધણી કરાવવા વિનંતી.`
  );

  const whatsappAdminText = encodeURIComponent(
    `જય જિનેન્દ્ર 🙏\n\n"${config.familyGroupName}" જાત્રા સમિતિ પોર્ટલ:\n` +
    `હાલ સુધી કુલ નોંધણીઓ: ${totalRegistrations} પરિવારો (${totalPax} Pax)\n\n` +
    `સમિતિ એડમિન ડેશબોર્ડ લિંક:\n` +
    `👉 ${adminUrl}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link2 className="w-6 h-6 text-amber-300" />
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-200 block">
                પ્રેમ સમરથ પરિવાર - સત્તાવાર લિંક્સ
              </span>
              <h3 className="text-xl font-bold font-display">
                બે મહત્વની લિંક્સ (2 Dedicated Links)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <p className="text-xs sm:text-sm text-neutral-600">
            પરિવારજનો માટે રજીસ્ટ્રેશન/અપડેટ કરવાની લિંક અને આયોજક સમિતિ માટે એડમિન ડેશબોર્ડની લિંક નીચે મુજબ તૈયાર છે:
          </p>

          {/* LINK 1: REGISTER & UPDATE */}
          <div className="p-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                  ૧
                </span>
                <span className="font-bold text-sm text-neutral-900">
                  પરિવાર રજીસ્ટ્રેશન & સુધારા લિંક (Registration & Update Link)
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                પરિવારજનો માટે
              </span>
            </div>

            <p className="text-xs text-neutral-600">
              આ લિંક WhatsApp ગ્રૂપમાં મોકલો. સભ્યો નવું રજીસ્ટ્રેશન કરી શકશે, સભ્યોની સંખ્યા વધારીને બાકીનું ટોકન ભરી શકશે અને સભ્યોના નામ ઉમેરી શકશે.
            </p>

            <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-emerald-300">
              <input
                type="text"
                readOnly
                value={registerAndUpdateUrl}
                className="w-full text-xs font-mono text-neutral-800 bg-transparent outline-hidden select-all"
              />
              <button
                onClick={() => copyToClipboard(registerAndUpdateUrl, true)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                {copiedLink1 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink1 ? 'કોપી થઈ!' : 'લિંક કોપી'}</span>
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <a
                href={`https://wa.me/?text=${whatsappRegisterText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp પર પરિવાર ગ્રૂપમાં શેર કરો</span>
              </a>
            </div>
          </div>

          {/* LINK 2: ADMIN PORTAL */}
          <div className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center">
                  ૨
                </span>
                <span className="font-bold text-sm text-neutral-900">
                  આયોજક સમિતિ એડમિન લિંક (Admin Committee Portal Link)
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                માત્ર સમિતિ માટે
              </span>
            </div>

            <p className="text-xs text-neutral-600">
              આ લિંકથી આયોજકો સીધા એડમિન ડેશબોર્ડમાં જઈને કેટલી નોંધણીઓ આવી (Total: {totalRegistrations} પરિવારો, {totalPax} Pax), ટોકન કલેક્શન અને લિસ્ટ જોઈ તથા ડાઉનલોડ કરી શકે છે.
            </p>

            <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-amber-300">
              <input
                type="text"
                readOnly
                value={adminUrl}
                className="w-full text-xs font-mono text-neutral-800 bg-transparent outline-hidden select-all"
              />
              <button
                onClick={() => copyToClipboard(adminUrl, false)}
                className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                {copiedLink2 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink2 ? 'કોપી થઈ!' : 'લિંક કોપી'}</span>
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <a
                href={adminUrl}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>એડમિન ડેશબોર્ડ ખોલો (Open Admin)</span>
              </a>
              <a
                href={`https://wa.me/?text=${whatsappAdminText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>સમિતિ સભ્યોને મોકલો</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-100 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            બંધ કરો (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
