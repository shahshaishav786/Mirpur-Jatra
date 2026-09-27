import React from 'react';
import { 
  Clock, 
  MapPin, 
  Utensils, 
  Sparkles, 
  Bus, 
  AlertTriangle, 
  Phone,
  BedDouble,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { EventConfig } from '../types';
import { formatINR } from '../utils/upi';

interface EventHighlightsProps {
  config: EventConfig;
  onRegisterClick: () => void;
}

export const EventHighlights: React.FC<EventHighlightsProps> = ({
  config,
  onRegisterClick,
}) => {
  const tripSchedule = [
    {
      day: 'દિવસ ૧: શુક્રવાર, ૨૫ ડિસેમ્બર ૨૦૨૬',
      items: [
        { time: '૦૫:૩૦ AM', desc: 'અમદાવાદથી લક્ઝરી AC બસ ઉપડશે (પાલડી, ઇસ્કોન, સુભાષબ્રિજ પિક-અપ)' },
        { time: '૦૮:૩૦ AM', desc: 'માર્ગમાં ગરમા-ગરમ નાસ્તો અને ચાય-કોફી' },
        { time: '૧૨:૩૦ PM', desc: 'શ્રી જહાજ મંદિર (મીરપુર) આગમન, રૂમ ફાળવણી અને વિશ્રામ' },
        { time: '૦૧:૩૦ PM', desc: 'શુદ્ધ જૈન ચોકાનું રાજસી બપોરનું ભોજન' },
        { time: '૦૪:૩૦ PM', desc: 'શ્રી જહાજ મંદિરના ચમત્કારી જિનાલયના સામૂહિક દર્શન, સ્નાત્ર મહોત્સવ' },
        { time: '૦૭:૩૦ PM', desc: 'ચૌવિહાર ભોજન, ભક્તિ સંધ્યા અને પરિવાર પરિચય બેઠક' },
      ],
    },
    {
      day: 'દિવસ ૨: શનિવાર, ૨૬ ડિસેમ્બર ૨૦૨૬',
      items: [
        { time: '૦૬:૩૦ AM', desc: 'નવકારવાળી, પ્રભાતિયાં અને પ્રક્ષાલ પૂજા' },
        { time: '૦૮:૦૦ AM', desc: 'સવારનો પૌષ્ટિક નાસ્તો' },
        { time: '૦૯:૩૦ AM', desc: '"પ્રેમ સમરથ" પરિવાર સ્નેહમિલન સભા, વડીલોના આશીર્વાદ અને સન્માન' },
        { time: '૧૨:૩૦ PM', desc: 'બપોરનું સ્વાદિષ્ટ ભોજન' },
        { time: '૦૩:૦૦ PM', desc: 'પાવાપુરી તીર્થ દર્શન તથા નજીકના પ્રાચીન દેરાસરોની જાત્રા' },
        { time: '૦૮:૦૦ PM', desc: 'મનોરંજક પારિવારિક સાંસ્કૃતિક કાર્યક્રમ & રાસ-ગરબા' },
      ],
    },
    {
      day: 'દિવસ ૩: રવિવાર, ૨૭ ડિસેમ્બર ૨૦૨૬',
      items: [
        { time: '૦૭:૦૦ AM', desc: 'મંગલ દર્શન, ચૈત્યવંદન અને નાસ્તો' },
        { time: '૧૦:૦૦ AM', desc: 'જહાજ મંદિર ખાતે ભાવપૂર્વક વિદાય સભા અને સ્મૃતિ ભેટ' },
        { time: '૧૧:૩૦ AM', desc: 'ભોજન બાદ અમદાવાદ માટે પરત પ્રયાણ' },
        { time: '૦૭:૩૦ PM', desc: 'સુખરૂપ અમદાવાદ આગમન' },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
          🙏 તીર્થ દર્શન & પ્રવાસ આયોજન
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-neutral-900">
          શ્રી જહાજ મંદિર (મીરપુર) - ૩ દિવસીય કાર્યક્રમ
        </h2>
        <p className="text-sm text-neutral-600">
          "પ્રેમ સમરથ" પરિવારના સ્નેહમિલન માટેની તમામ વ્યવસ્થા અને સમયપત્રક.
        </p>
      </div>

      {/* Urgent Room booking banner */}
      <div className="p-6 rounded-3xl bg-amber-500/15 border-2 border-amber-500/50 space-y-3">
        <div className="flex items-center gap-2 text-amber-950 font-bold text-base sm:text-lg">
          <AlertTriangle className="w-6 h-6 text-amber-800" />
          <span>અગત્યની સૂચના (રૂમ બુકિંગ અંગે):</span>
        </div>
        <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
          {config.roomBookingNotice}
        </p>
        <div className="pt-1 flex flex-wrap items-center gap-6 text-xs text-amber-900 font-bold">
          <span>• ટોકન રકમ: ₹ ૧,૦૦૦/- (વ્યક્તિ દીઠ - નોન-રિફંડેબલ)</span>
          <span>• અંદાજિત કુલ ખર્ચ: આશરે ₹ ૩,૫૦૦/- પ્રતિ વ્યક્તિ</span>
          <span>• આખરી મુદત: આગામી બુધવાર</span>
        </div>
      </div>

      {/* Temple Features & Significance */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-200">
          <Sparkles className="w-5 h-5 text-amber-700" />
          <h3 className="text-xl font-bold font-display text-neutral-900">
            શ્રી જહાજ મંદિર, મીરપુરની પવિત્ર વિશેષતાઓ
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
            <span className="font-bold text-sm text-neutral-900 block">ચમત્કારી & પ્રાચીન તીર્થ</span>
            <p className="text-xs text-neutral-600 leading-relaxed">
              જહાજના આકારમાં નિર્મિત અદ્ભુત શ્વેતાંબર જિનાલય, જ્યાં દાદા પાર્શ્વનાથ ભગવાનની અત્યંત મનોહર અને પ્રભાવશાળી પ્રતિમાજી બિરાજમાન છે.
            </p>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
            <Bus className="w-5 h-5 text-amber-700" />
            <span className="font-bold text-sm text-neutral-900 block">અમદાવાદથી લક્ઝરી AC બસ</span>
            <p className="text-xs text-neutral-600 leading-relaxed">
              પરિવારજનો માટે આરામદાયક પુશબેક સીટવાળી લક્ઝરી બસ, જેમાં વડીલો અને બાળકો માટે સરળતા રહેશે.
            </p>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
            <Utensils className="w-5 h-5 text-emerald-700" />
            <span className="font-bold text-sm text-neutral-900 block">શુદ્ધ જૈન ચોકા ભોજનશાળા</span>
            <p className="text-xs text-neutral-600 leading-relaxed">
              ત્રણેય દિવસ સવારનો નાસ્તો, રાજસી બપોરનું ભોજન અને સાંજનું ચૌવિહાર સંપૂર્ણ શુદ્ધ જૈન વિધિ અનુસાર રહેશે.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Days Itinerary */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold font-display text-neutral-900 text-center">
          ૩ દિવસીય યાત્રા ક્રમ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tripSchedule.map((daySchedule, idx) => (
            <div
              key={idx}
              className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4 hover:border-amber-300 transition-colors"
            >
              <div className="pb-3 border-b border-neutral-200">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide block">
                  યાત્રા શિડ્યુલ
                </span>
                <h4 className="text-base font-bold text-neutral-900 font-display mt-0.5">
                  {daySchedule.day}
                </h4>
              </div>

              <div className="space-y-3">
                {daySchedule.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="text-xs flex items-start gap-2.5">
                    <span className="font-mono font-bold text-amber-800 shrink-0 mt-0.5">
                      {item.time}
                    </span>
                    <span className="text-neutral-700 leading-relaxed">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Committee Contacts Bar from User Prompt */}
      <div className="p-6 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white rounded-3xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-amber-200 font-bold uppercase tracking-wider block">
              કોઈપણ પ્રશ્ન કે પૂછપરછ માટે સંપર્ક સૂત્ર
            </span>
            <h3 className="text-xl font-bold font-display mt-0.5">
              "પ્રેમ સમરથ" પરિવાર આયોજક સમિતિ
            </h3>
          </div>

          <button
            onClick={onRegisterClick}
            className="px-6 py-3 bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-md"
          >
            હમણાં જ રજીસ્ટ્રેશન કરો (₹૧,૦૦૦/Pax)
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          {config.contactPersons.map((contact) => (
            <div key={contact.name} className="p-3 bg-white/10 rounded-xl border border-white/15">
              <span className="text-amber-200 font-semibold block">{contact.name}</span>
              <a href={`tel:${contact.phone}`} className="text-white font-mono font-bold text-sm block mt-0.5">
                {contact.phone}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
