import React from 'react';
import { EventConfig } from '../types';

interface FooterProps {
  config: EventConfig;
  onSelectTab: (tab: 'register' | 'lookup' | 'organizer' | 'details') => void;
  isAdminMode?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ config, onSelectTab, isAdminMode = false }) => {
  return (
    <footer className="bg-neutral-950 text-neutral-400 text-xs border-t border-neutral-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <span className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>🙏 "{config.familyGroupName}"</span>
            </span>
            <p className="text-neutral-400 max-w-sm leading-relaxed">
              સ્નેહમિલન અને {config.pilgrimageDestination} પવિત્ર યાત્રા રજીસ્ટ્રેશન પોર્ટલ.
              ટોકન રકમ વ્યક્તિ દીઠ ₹ ૧,૦૦૦/- ઓટો-કેલ્ક્યુલેટ સાથે Google Pay (GPay) અને PhonePe દ્વારા સીધી જમા કરાવવાની સુવિધા.
            </p>
            <div className="text-[11px] text-neutral-500 pt-1">
              સત્તાવાર UPI ID: <strong className="text-neutral-300 font-mono">{config.upiId}</strong>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <span className="font-bold text-neutral-200 uppercase tracking-wider block">
              ઝડપી લિંક્સ (Quick Links)
            </span>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectTab('register')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  પરિવાર રજીસ્ટ્રેશન & સુધારો (Register & Update)
                </button>
              </li>
              {config.showItineraryToUsers && (
                <li>
                  <button
                    onClick={() => onSelectTab('details')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    યાત્રા શિડ્યુલ & સમયપત્રક (Itinerary)
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => onSelectTab('lookup')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  મારો જાત્રા પાસ શોધો (Find Pass)
                </button>
              </li>
              {isAdminMode && (
                <li>
                  <button
                    onClick={() => onSelectTab('organizer')}
                    className="hover:text-white transition-colors cursor-pointer text-left text-amber-400"
                  >
                    સમિતિ એડમિન પોર્ટલ (Admin Portal)
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Help & Contact */}
          <div className="space-y-3">
            <span className="font-bold text-neutral-200 uppercase tracking-wider block">
              સંપર્ક સૂત્ર (Helpline)
            </span>
            <div className="space-y-2 text-neutral-400 font-mono text-[11px]">
              {config.contactPersons.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <span className="font-sans text-neutral-300">{c.name}:</span>
                  <a href={`tel:${c.phone}`} className="text-amber-400 font-bold hover:underline">
                    {c.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>© ૨૦૨૬ "{config.familyGroupName}" સ્નેહમિલન આયોજક સમિતિ. સર્વ હક સુરક્ષિત.</p>
          <div className="flex items-center gap-4">
            <span>ટોકન: વ્યક્તિ દીઠ ₹ ૧,૦૦૦/-</span>
            <span aria-hidden="true">·</span>
            <span>Google Pay & PhonePe Direct Gateway</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
