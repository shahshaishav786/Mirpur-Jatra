import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle, 
  User, 
  Heart, 
  Calendar, 
  Utensils 
} from 'lucide-react';
import { PaxMember, RegistrationRecord } from '../types';

interface MemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: RegistrationRecord;
  onSaveMembers: (updatedMembers: PaxMember[]) => void;
}

export const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({
  isOpen,
  onClose,
  registration,
  onSaveMembers,
}) => {
  const [members, setMembers] = useState<PaxMember[]>(() => {
    if (registration.members && registration.members.length > 0) {
      // Ensure there are at least as many member rows as numberOfPax
      const existing = [...registration.members];
      while (existing.length < registration.numberOfPax) {
        const i = existing.length;
        existing.push({
          id: `mem-${registration.id}-${i + 1}`,
          name: '',
          relationship: 'પરિવાર સભ્ય (Family Member)',
          ageCategory: 'મોટા / Adult (12+)',
          gender: 'Male',
          foodPreference: 'શુદ્ધ જૈન ચોકો (Jain Choko)',
          roomPreference: 'Family Room',
        });
      }
      return existing;
    }
    // Auto-generate rows to match registration.numberOfPax
    return Array.from({ length: registration.numberOfPax }).map((_, i) => ({
      id: `mem-${registration.id}-${i + 1}`,
      name: i === 0 ? registration.headName : '',
      relationship: i === 0 ? 'Self / મોભી' : i === 1 ? 'પત્ની / Wife' : 'પરિવાર સભ્ય / Family Member',
      ageCategory: i === 0 ? 'વડીલ / Senior (60+)' : 'મોટા / Adult (12+)',
      gender: i % 2 === 0 ? 'Male' : 'Female',
      foodPreference: 'શુદ્ધ જૈન ચોકો (Jain Choko)',
      roomPreference: 'Family Room',
    }));
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleMemberChange = (index: number, field: keyof PaxMember, value: string) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddMember = () => {
    setMembers((prev) => [
      ...prev,
      {
        id: `mem-${Date.now()}-${prev.length}`,
        name: '',
        relationship: 'પરિવાર સભ્ય / Family Member',
        ageCategory: 'મોટા / Adult (12+)',
        gender: 'Male',
        foodPreference: 'શુદ્ધ જૈન ચોકો (Jain Choko)',
        roomPreference: 'Family Room',
      },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMembers(members);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl my-6 bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-bold text-amber-200">
                પરિવાર સભ્યોની વિગત / Family Member Details
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display">
                {registration.headName} · {registration.id}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-2 text-xs text-amber-100 flex flex-wrap items-center gap-2">
            <span>કુલ સભ્યો (Total Pax): <strong className="text-white font-mono">{registration.numberOfPax} Pax</strong></span>
            <span>·</span>
            <span>રૂમ & ભોજન વ્યવસ્થા માટે દરેક સભ્યનું નામ લખો (કોઈ ડ્રોપડાઉન નથી, સરળ ટેક્સ્ટ ઇનપુટ)</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {savedSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs sm:text-sm text-emerald-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>પરિવાર સભ્યોની વિગતો સાચવી લેવામાં આવી છે! / Member details saved successfully!</span>
            </div>
          )}

          <div className="space-y-5">
            {members.map((member, idx) => (
              <div
                key={member.id}
                className="p-4 sm:p-5 rounded-2xl border border-neutral-200 bg-neutral-50/70 hover:bg-white hover:border-amber-400 transition-colors space-y-4"
              >
                <div className="flex items-center justify-between text-xs font-bold text-neutral-800 border-b border-neutral-200 pb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center text-[11px] font-mono">
                      {idx + 1}
                    </span>
                    <span>
                      {idx === 0 ? 'સભ્ય ૧: પરિવારના મોભી (Head of Family)' : `સભ્ય ${idx + 1} (Member ${idx + 1})`}
                    </span>
                  </span>

                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="p-1 text-neutral-400 hover:text-rose-600 rounded transition-colors cursor-pointer flex items-center gap-1"
                      title="સભ્ય હટાવો / Remove Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">હટાવો / Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {/* Name */}
                  <div>
                    <label className="block text-neutral-800 font-bold mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-neutral-500" />
                      <span>સભ્યનું પૂરું નામ / Member Full Name <span className="text-rose-600">*</span></span>
                    </label>
                    <input
                      type="text"
                      placeholder="દા.ત. અલ્કાબેન શાહ / Full Name"
                      value={member.name}
                      onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                      required
                    />
                  </div>

                  {/* Relationship - Text input without dropdown */}
                  <div>
                    <label className="block text-neutral-800 font-bold mb-1 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-neutral-500" />
                      <span>મોભી સાથે સંબંધ / Relationship</span>
                    </label>
                    <input
                      type="text"
                      placeholder="પત્ની / પુત્ર / Self / માતા / Daughter"
                      value={member.relationship}
                      onChange={(e) => handleMemberChange(idx, 'relationship', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                    {/* Quick suggestion tags (optional 1-click fill, no dropdown) */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['Self / મોભી', 'પત્ની / Wife', 'પુત્ર / Son', 'પુત્રી / Daughter', 'માતા / પિતા'].map((rel) => (
                        <button
                          key={rel}
                          type="button"
                          onClick={() => handleMemberChange(idx, 'relationship', rel)}
                          className="text-[10px] px-1.5 py-0.5 bg-neutral-200 hover:bg-amber-100 rounded text-neutral-700 cursor-pointer"
                        >
                          {rel.split('/')[0].trim()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age / Category - Text input without dropdown */}
                  <div>
                    <label className="block text-neutral-800 font-bold mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span>ઉંમર / વય જૂથ / Age or Category</span>
                    </label>
                    <input
                      type="text"
                      placeholder="વડીલ (60+) / Adult (12+) / બાળક / 45"
                      value={member.ageCategory}
                      onChange={(e) => handleMemberChange(idx, 'ageCategory', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                    {/* Quick suggestion tags */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['વડીલ (60+)', 'મોટા (12+)', 'બાળક (4-11)', 'નાનું બાળક (0-3)'].map((age) => (
                        <button
                          key={age}
                          type="button"
                          onClick={() => handleMemberChange(idx, 'ageCategory', age)}
                          className="text-[10px] px-1.5 py-0.5 bg-neutral-200 hover:bg-amber-100 rounded text-neutral-700 cursor-pointer"
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Food Preference - Text input without dropdown */}
                  <div>
                    <label className="block text-neutral-800 font-bold mb-1 flex items-center gap-1">
                      <Utensils className="w-3.5 h-3.5 text-neutral-500" />
                      <span>ભોજન વ્યવસ્થા / Food Preference</span>
                    </label>
                    <input
                      type="text"
                      placeholder="શુદ્ધ જૈન ચોકો / શાકાહારી / Jain"
                      value={member.foodPreference}
                      onChange={(e) => handleMemberChange(idx, 'foodPreference', e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold text-emerald-800 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                    {/* Quick suggestion tags */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['શુદ્ધ જૈન ચોકો (Jain)', 'શુદ્ધ શાકાહારી (Pure Veg)', 'સ્વામિનારાયણ (Swaminarayan)'].map((food) => (
                        <button
                          key={food}
                          type="button"
                          onClick={() => handleMemberChange(idx, 'foodPreference', food)}
                          className="text-[10px] px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded cursor-pointer"
                        >
                          {food.split('(')[0].trim()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add more button */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleAddMember}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ વધુ સભ્ય ઉમેરો / Add Another Member</span>
            </button>

            <span className="text-xs text-neutral-600">
              કુલ સભ્યોની યાદી / Member Rows: <strong className="text-neutral-900 font-mono">{members.length}</strong>
            </span>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              બંધ કરો / Close
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>સભ્યોની વિગત સાચવો / Save Member Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
