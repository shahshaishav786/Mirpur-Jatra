import React, { useEffect, useState } from 'react';
import { 
  Printer, 
  Share2, 
  CheckCircle, 
  Calendar, 
  Users, 
  ArrowLeft, 
  ShieldCheck, 
  Bus, 
  UserPlus, 
  Edit3,
  FolderGit2,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { EventConfig, RegistrationRecord, PaxMember } from '../types';
import { formatINR, buildWhatsAppShareUrl } from '../utils/upi';
import { MemberDetailsModal } from './MemberDetailsModal';
import { TARGET_DRIVE_FOLDER_URL } from '../services/googleSheets';

interface PassReceiptProps {
  registration: RegistrationRecord;
  config: EventConfig;
  onNewRegistration: () => void;
  onBackToHome: () => void;
  onUpdateMembers: (updatedMembers: PaxMember[]) => void;
  onEditRegistration?: () => void;
}

export const PassReceipt: React.FC<PassReceiptProps> = ({
  registration,
  config,
  onNewRegistration,
  onBackToHome,
  onUpdateMembers,
  onEditRegistration,
}) => {
  const [passQrCode, setPassQrCode] = useState<string>('');
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#b45309', '#059669', '#1d4ed8', '#f59e0b'],
    });

    const qrPayload = JSON.stringify({
      id: registration.id,
      parivar: 'પ્રેમ સમરથ પરિવાર',
      destination: 'શ્રી જહાજ મંદિર મીરપુર',
      head: registration.headName,
      pax: registration.numberOfPax,
      token: registration.tokenAmount,
      utr: registration.transactionId,
      status: registration.paymentStatus,
    });

    QRCode.toDataURL(qrPayload, {
      width: 280,
      margin: 2,
      color: { dark: '#111827', light: '#ffffff' },
    }).then(setPassQrCode);
  }, [registration]);

  const handlePrint = () => {
    window.print();
  };

  const shareUrl = buildWhatsAppShareUrl({
    regId: registration.id,
    headName: registration.headName,
    pax: registration.numberOfPax,
    amount: registration.tokenAmount,
    estimatedCost: registration.estimatedTotalCost || registration.numberOfPax * config.estimatedCostPerPax,
    eventName: config.eventName,
    eventDate: config.eventDisplayDate,
    venue: config.pilgrimageDestination,
    transId: registration.transactionId,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>મુખ્ય પાના પર પાછા જાઓ / Back to Home</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* ACTION BUTTON: EDIT REGISTRATION / CHANGE PAX */}
          {onEditRegistration && (
            <button
              onClick={onEditRegistration}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-amber-700" />
              <span>રજીસ્ટ્રેશન સુધારો / Edit Registration & Pax</span>
            </button>
          )}

          {/* ACTION BUTTON: ADD / UPDATE FAMILY MEMBER DETAILS */}
          <button
            onClick={() => setShowMemberModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>સભ્યોની વિગત ઉમેરો / Add Members</span>
          </button>

          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp શેર</span>
          </a>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>પ્રિન્ટ / Print</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-3xl flex items-start gap-3 no-print">
        <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm text-emerald-950">
          <p className="font-bold text-base">જાત્રા રજીસ્ટ્રેશન & ટોકન રકમ જમા થઈ ગયેલ છે! (Registration Confirmed)</p>
          <p className="text-emerald-800">
            <strong>{registration.numberOfPax} સભ્યો (Pax)</strong> માટે વ્યક્તિ દીઠ ₹૧,૦૦૦ પ્રમાણે કુલ ટોકન રકમ <strong>{formatINR(registration.tokenAmount)}</strong> સફળતાપૂર્વક જમા થઈ ગઈ છે.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowMemberModal(true)}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>સભ્યોના નામ & ભોજન વિગત ભરો / Add Member Details</span>
            </button>
            <a
              href={TARGET_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg font-bold text-xs shadow-2xs transition-colors"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Google Drive Excel ફોલ્ડર</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
            <span className="text-emerald-700 text-[11px]">(રૂમ & જૈન ચોકા ભોજન વ્યવસ્થા માટે જરૂરી)</span>
          </div>
        </div>
      </div>

      {/* Official Pass Printable Card */}
      <div
        id="printable-receipt"
        className="bg-white border-2 border-amber-300 rounded-3xl shadow-xl overflow-hidden print:border-neutral-900 print:shadow-none"
      >
        {/* Pass Top Ribbon */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 p-6 text-white text-center relative">
          <div className="flex items-center justify-between text-xs text-amber-200 mb-2">
            <span className="font-bold">🙏 જય જિનેન્દ્ર · સ્નેહમિલન પાસ (Official Pass)</span>
            <span className="font-mono font-bold tracking-wider bg-amber-950/70 px-2.5 py-0.5 rounded border border-amber-500/40">
              {registration.id}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
            "{config.familyGroupName}" સ્નેહમિલન
          </h2>
          <p className="text-sm sm:text-base font-semibold text-amber-200 mt-1">
            {config.pilgrimageDestination}
          </p>
          <p className="text-xs text-amber-100/90 mt-0.5">
            {config.templeSpeciality}
          </p>
        </div>

        {/* Pass Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Key Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-neutral-200">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="text-neutral-500 block">યાત્રા તારીખો / Event Dates</span>
                <span className="font-bold text-neutral-900 text-sm block">{config.eventDisplayDate}</span>
                <span className="text-neutral-600 block mt-0.5">૩ દિવસીય પરિવાર જાત્રા પ્રવાસ</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Bus className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="text-neutral-500 block">પ્રવાસ વ્યવસ્થા / Travel Arrangement</span>
                <span className="font-bold text-neutral-900 text-sm block">અમદાવાદથી લક્ઝરી AC બસ</span>
                <span className="text-neutral-600 block mt-0.5">સીધા શ્રી જહાજ મંદિર (મીરપુર)</span>
              </div>
            </div>
          </div>

          {/* Registration & Token Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left 2 Cols */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-500 block">પરિવારના મોભી / Head of Family</span>
                  <span className="font-bold text-neutral-900 text-base block">{registration.headName}</span>
                  <div className="text-neutral-600 font-mono font-medium text-xs mt-0.5 space-y-0.5">
                    <div>સંપર્ક ૧: {registration.phone}</div>
                    {registration.alternatePhone && (
                      <div className="text-neutral-500 text-[11px]">સંપર્ક ૨: {registration.alternatePhone}</div>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-500 block">મૂળ વતન / Native Place</span>
                  <span className="font-bold text-neutral-800 text-sm block">{registration.nativePlace || 'ગુજરાત'}</span>
                </div>
              </div>

              {/* Token Payment Status Box */}
              <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-950 pb-1 border-b border-amber-200">
                  <span>ટોકન રકમ હિસાબ / Token Payment Summary</span>
                  <span className="font-mono text-emerald-800 flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>PAYMENT CONFIRMED</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700 font-medium">કુલ સભ્યો (Total Pax):</span>
                  <span className="font-mono font-bold text-neutral-900">{registration.numberOfPax} વ્યક્તિ (Pax)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700 font-medium">ટોકન દર (Rate per Pax):</span>
                  <span className="font-mono text-neutral-900">₹ ૧,૦૦૦ / Person</span>
                </div>
                <div className="flex items-center justify-between text-base pt-1 border-t border-amber-200 font-bold">
                  <span className="text-amber-950">જમા કરેલ કુલ ટોકન રકમ / Total Paid:</span>
                  <span className="font-mono text-neutral-950 text-xl font-extrabold">{formatINR(registration.tokenAmount)}</span>
                </div>

                {/* Additional Payment History if Pax Changed */}
                {registration.paymentHistory && registration.paymentHistory.length > 1 && (
                  <div className="pt-1.5 border-t border-dashed border-amber-200 text-[11px] space-y-1">
                    <span className="font-bold text-neutral-700 block">પેમેન્ટ હિસ્ટ્રી (સભ્યો વધતા કરેલ ચૂકવણી):</span>
                    {registration.paymentHistory.map((entry, idx) => (
                      <div key={idx} className="flex justify-between text-neutral-600">
                        <span>{entry.note || `ચૂકવણી ${idx + 1}`} ({entry.method.toUpperCase()}):</span>
                        <span className="font-mono font-bold">{formatINR(entry.amount)} · UTR: {entry.transactionId}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-neutral-600 pt-1">
                  <span>અંદાજિત કુલ ખર્ચ (₹૩,૫૦૦/Pax):</span>
                  <span className="font-mono font-semibold text-neutral-800">
                    {formatINR(registration.estimatedTotalCost || registration.numberOfPax * config.estimatedCostPerPax)}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-600 pt-1 flex items-center justify-between border-t border-dashed border-amber-200">
                  <span>UPI / UTR Ref:</span>
                  <span className="font-mono font-bold text-neutral-800">{registration.transactionId}</span>
                </div>
              </div>
            </div>

            {/* Right Col: QR Code */}
            <div className="text-center p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex flex-col items-center justify-center">
              {passQrCode ? (
                <img
                  src={passQrCode}
                  alt={`Gate QR Code for ${registration.id}`}
                  className="w-36 h-36 object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-36 h-36 bg-neutral-200 rounded-lg flex items-center justify-center text-xs text-neutral-500">
                  QR Loading...
                </div>
              )}
              <span className="font-mono text-xs font-bold text-neutral-800 mt-2">
                {registration.id}
              </span>
              <span className="text-[10px] text-neutral-500">બસ બોર્ડિંગ & રૂમ ફાળવણી માટે</span>
            </div>
          </div>

          {/* Members List Table or Prompt to Fill */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                જોડાનાર પરિવાર સભ્યોની યાદી / Member Details ({registration.members?.length || 1} / {registration.numberOfPax} Pax)
              </h4>
              <button
                onClick={() => setShowMemberModal(true)}
                className="text-xs font-bold text-amber-800 hover:text-amber-900 underline flex items-center gap-1 cursor-pointer no-print"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>સભ્યોની વિગત બદલો / ઉમેરો</span>
              </button>
            </div>

            {registration.members && registration.members.length > 0 ? (
              <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-100 text-neutral-700 font-semibold border-b border-neutral-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">સભ્યનું નામ / Name</th>
                      <th className="py-2.5 px-3">સંબંધ / Relation</th>
                      <th className="py-2.5 px-3">ઉંમર જૂથ / Age</th>
                      <th className="py-2.5 px-3">ભોજન વ્યવસ્થા / Meal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {registration.members.map((mem, idx) => (
                      <tr key={mem.id || idx} className="hover:bg-neutral-50">
                        <td className="py-2 px-3 font-mono text-neutral-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-neutral-900">{mem.name || `સભ્ય ${idx + 1}`}</td>
                        <td className="py-2 px-3 text-neutral-600">{mem.relationship}</td>
                        <td className="py-2 px-3 text-neutral-600">{mem.ageCategory}</td>
                        <td className="py-2 px-3 font-bold text-emerald-800">{mem.foodPreference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-900 space-y-2">
                <span>હજુ સુધી સભ્યોના નામ ઉમેરાયા નથી. રૂમ અને ભોજન વ્યવસ્થા માટે વિગતો ઉમેરવા ક્લિક કરો.</span>
                <div>
                  <button
                    onClick={() => setShowMemberModal(true)}
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                  >
                    + સભ્યોના નામ & ભોજન પદ્ધતિ ઉમેરો / Add Member Details
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Committee Contacts */}
          <div className="p-3.5 bg-neutral-100 rounded-xl text-neutral-700 text-xs space-y-1.5">
            <span className="font-bold text-neutral-900 block">સંપર્ક સૂત્ર / Committee Helpline (કોઈપણ સહાય માટે):</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              {config.contactPersons.map((c) => (
                <div key={c.name} className="bg-white p-2 rounded border border-neutral-200">
                  <span className="font-sans font-medium text-neutral-800 block">{c.name}</span>
                  <a href={`tel:${c.phone}`} className="text-amber-800 font-bold block">{c.phone}</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4 no-print flex flex-wrap justify-center gap-3">
        {onEditRegistration && (
          <button
            onClick={onEditRegistration}
            className="px-5 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
          >
            સભ્યો વધારો અથવા રજીસ્ટ્રેશન સુધારો / Update Pax
          </button>
        )}
        <button
          onClick={onNewRegistration}
          className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
        >
          બીજા પરિવારની નોંધણી કરો (Register Another Family)
        </button>
      </div>

      {/* Modal to add / update family member details */}
      {showMemberModal && (
        <MemberDetailsModal
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          registration={registration}
          onSaveMembers={(updatedMembers) => {
            onUpdateMembers(updatedMembers);
          }}
        />
      )}
    </div>
  );
};
