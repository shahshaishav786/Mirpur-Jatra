export type FoodPreference = string;
export type AgeCategory = string;

export interface PaxMember {
  id: string;
  name: string;
  ageCategory: string; // e.g. "Senior (60+) / વડીલ", "Adult (12+) / મોટા", "Child (4-11) / બાળક", "Infant / નાનું બાળક"
  gender?: string; // Male / Female
  relationship: string; // "Self (મોભી)", "Wife / પત્ની", "Son / પુત્ર", etc.
  foodPreference: string; // "Jain / શુદ્ધ જૈન ચોકો", "Pure Veg / શુદ્ધ શાકાહારી", etc.
  roomPreference?: string;
}

export interface PaymentEntry {
  amount: number;
  transactionId: string;
  date: string;
  method: string;
  note?: string;
}

export interface RegistrationRecord {
  id: string; // e.g. PS-2026-4821
  createdAt: string;
  updatedAt?: string;
  headName: string;
  phone: string;
  alternatePhone?: string; // Contact Number 2 (Alternate / Secondary Mobile)
  email?: string;
  nativePlace: string;
  address?: string;
  numberOfPax: number;
  initialPax?: number;
  ratePerPax: number; // 1000
  tokenAmount: number; // Total token amount paid
  initialTokenPaid?: number;
  estimatedTotalCost: number; // numberOfPax * estimatedCostPerPax (approx ₹3,500)
  members: PaxMember[];
  boardingPoint?: string; // Optional Ahmedabad Bus pickup point
  paymentStatus: 'confirmed' | 'pending_verification';
  paymentMethod: string;
  transactionId: string; // UTR or Ref number
  paymentNote?: string;
  paymentHistory?: PaymentEntry[];
}

export interface ContactPerson {
  name: string;
  phone: string;
  role?: string;
}

export interface EventConfig {
  familyGroupName: string; // "પ્રેમ સમરથ" પરિવાર
  eventName: string; // સ્નેહમિલન & પવિત્ર યાત્રાધામ જાત્રા
  pilgrimageDestination: string; // શ્રી જહાજ મંદિર - મીરપુર (પાવાપુરી પાસે, રાજસ્થાન)
  templeSpeciality: string; // અત્યંત સુંદર, પ્રાચીન અને ચમત્કારી તીર્થધામ
  eventDate: string; // 2026-12-25T06:00:00
  eventDisplayDate: string; // ૨૫, ૨૬ અને ૨૭ ડિસેમ્બર ૨૦૨૬ (શુક્ર, શનિ, રવિ)
  travelMode: string; // અમદાવાદથી લક્ઝરી AC બસ
  roomBookingNotice: string; // યાત્રાધામ પર અન્ય સંઘોનું પણ બુકિંગ ચાલુ હોવાથી રૂમોનું કન્ફર્મેશન આગામી બુધવાર સુધી આપવું અનિવાર્ય છે.
  ratePerPax: number; // 1000 (Non-refundable Token)
  estimatedCostPerPax: number; // 3500 (અંદાજિત કુલ ખર્ચ પ્રતિ વ્યક્તિ)
  upiId: string; // UPI ID for Google Pay
  payeeName: string; // Payee display name
  contactPersons: ContactPerson[];
  organizerPhone: string;
  organizerEmail: string;
  accountNotePrefix: string;
  showItineraryToUsers: boolean; // Push toggle: whether detailed itinerary is shown on registration link
}
