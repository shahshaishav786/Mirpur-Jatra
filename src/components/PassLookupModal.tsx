import React, { useState } from 'react';
import { Search, Ticket, X, ArrowRight, Phone } from 'lucide-react';
import { RegistrationRecord } from '../types';
import { formatINR } from '../utils/upi';

interface PassLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrations: RegistrationRecord[];
  onSelectRegistration: (reg: RegistrationRecord) => void;
}

export const PassLookupModal: React.FC<PassLookupModalProps> = ({
  isOpen,
  onClose,
  registrations,
  onSelectRegistration,
}) => {
  const [query, setQuery] = useState('');
  const [matchedResults, setMatchedResults] = useState<RegistrationRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().toLowerCase();
    if (!clean) return;

    const matches = registrations.filter(
      (r) =>
        r.phone.includes(clean) ||
        r.id.toLowerCase().includes(clean) ||
        r.headName.toLowerCase().includes(clean)
    );

    setMatchedResults(matches);
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-800 to-amber-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-200" />
            <h3 className="text-lg font-bold font-display">
              આપનો જાત્રા પાસ શોધો / Find Registration Pass
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-neutral-600">
            નોંધાયેલ ૧૦ આંકડાનો મોબાઈલ નંબર અથવા મોભીનું નામ લખીને ડિજિટલ પાસ મેળવો અને વિગતો સુધારો:
          </p>

          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                મોબાઈલ નંબર અથવા પાસ ID / Mobile Number or Registration ID
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="દા.ત. 9428001127 અથવા PS-2026-XXXX / Mobile or Name"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setHasSearched(false);
                    }}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  શોધો / Search
                </button>
              </div>
            </div>
          </form>

          {/* Results */}
          {hasSearched && (
            <div className="space-y-3 pt-2">
              {matchedResults.length === 0 ? (
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-center text-xs text-neutral-500">
                  "{query}" માટે કોઈ પાસ મળ્યો નથી. કૃપા કરી સાચો મોબાઈલ નંબર ચકાસો.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {matchedResults.map((reg) => (
                    <div
                      key={reg.id}
                      onClick={() => {
                        onSelectRegistration(reg);
                        onClose();
                      }}
                      className="p-3.5 rounded-xl border border-neutral-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-neutral-900">{reg.headName}</span>
                          <span className="font-mono text-[11px] text-neutral-500">{reg.id}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          {reg.numberOfPax} સભ્યો (Pax) · ટોકન {formatINR(reg.tokenAmount)} · {reg.phone}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-800">
                        <span>પાસ જુઓ / View Pass</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
