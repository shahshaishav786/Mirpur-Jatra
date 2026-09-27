import QRCode from 'qrcode';

export interface UpiLinkOptions {
  upiId: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
  transactionId?: string;
}

/**
 * Builds the standard universal UPI URI
 * Supported by all UPI apps on mobile and QR scanners
 */
export function buildStandardUpiUrl(options: UpiLinkOptions): string {
  const { upiId, payeeName, amount, transactionNote, transactionId } = options;
  const params = new URLSearchParams({
    pa: upiId.trim(),
    pn: payeeName.trim(),
    am: amount.toFixed(2),
    cu: 'INR',
    tn: transactionNote.trim(),
  });

  if (transactionId) {
    params.append('tr', transactionId);
  }

  return `upi://pay?${params.toString()}`;
}

/**
 * Builds dedicated Google Pay (GPay / Tez) deep link URI
 * Launches Google Pay directly on Android / iOS
 */
export function buildGPayDeepLink(options: UpiLinkOptions): string {
  const { upiId, payeeName, amount, transactionNote, transactionId } = options;
  const params = new URLSearchParams({
    pa: upiId.trim(),
    pn: payeeName.trim(),
    am: amount.toFixed(2),
    cu: 'INR',
    tn: transactionNote.trim(),
  });

  if (transactionId) {
    params.append('tr', transactionId);
  }

  // Canonical Google Pay scheme for India
  return `tez://upi/pay?${params.toString()}`;
}

/**
 * Generates high quality QR code data URL
 */
export async function generateUpiQrCode(upiUrl: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(upiUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}

/**
 * Formats a number to Indian Rupee (₹)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generates Prem Samarth Registration ID (e.g., PS-2026-1045)
 */
export function generateRegistrationId(): string {
  const random = Math.floor(100 + Math.random() * 900);
  return `PS-2026-${random}`;
}

/**
 * Builds the official WhatsApp invitation & broadcast message requested by the user
 */
export function buildParivarWhatsAppBroadcast(currentAppUrl: string, upiId: string): string {
  return `જય જિનેન્દ્ર 🙏✨

સહર્ષ જણાવવાનું કે *"પ્રેમ સમરથ"* પરિવાર હેઠળ આપણું સ્નેહમિલન એક પવિત્ર યાત્રાધામ ખાતે યોજવાનું નક્કી થયેલ છે.

અત્યંત સુંદર, પ્રાચીન અને ચમત્કારી તીર્થધામ *શ્રી જહાજ મંદિર - મીરપુર (પાવાપુરી પાસે, રાજસ્થાન)* ની જાત્રા ફાઇનલ કરવામાં આવી છે.

*યાત્રાની મુખ્ય વિગતો:*
🗓 *તારીખ:* ૨૫, ૨૬ અને ૨૭ ડિસેમ્બર ૨૦૨૬
📍 *સ્થળ:* શ્રી જહાજ મંદિર, મીરપુર (રાજસ્થાન)
🚌 *પ્રવાસ વ્યવસ્થા:* અમદાવાદથી લક્ઝરી AC બસ

*અગત્યની સૂચના (રૂમ બુકિંગ અંગે):*
યાત્રાધામ પર અન્ય સંઘોનું પણ બુકિંગ ચાલુ હોવાથી, આપણે રૂમોનું કન્ફર્મેશન આગામી બુધવાર સુધીમાં આપવું અનિવાર્ય છે. ગત વખતે મોડું થવાથી આપણે સારું સ્થળ ગુમાવવું પડ્યું હતું, તેથી સમયસર નોંધણી કરાવવી જરૂરી છે.

💰 *ટોકન રકમ:* ₹ ૧,૦૦૦/- (વ્યક્તિ દીઠ - નોન-રિફંડેબલ)
💵 *અંદાજિત કુલ ખર્ચ:* આશરે ₹ ૩,૫૦૦/- પ્રતિ વ્યક્તિ (બાકીની રકમ પછીથી જણાવવામાં આવશે)

*રજીસ્ટ્રેશન પ્રક્રિયા:*
નીચે આપેલી લિંક પર દરેક સભ્યની વિગત ભરી, આપેલા સ્કેનર (QR Code) મારફત વ્યક્તિ દીઠ ₹૧,૦૦૦/- ટોકન જમા કરાવી તમારું કન્ફર્મેશન તાત્કાલિક મોકલી આપવા વિનંતી.

🔗 *રજીસ્ટ્રેશન ફોર્મ લિંક:* ${currentAppUrl}
📲 *Google Pay / UPI ID:* ${upiId}

*સંપર્ક સૂત્ર:*
• રાજુભાઈ શાહ: 9428001127
• સુરેશભાઈ: 9426413878
• હેતલ શાહ: 9978810372
• વિપુલભાઈ: 9825083373`;
}

/**
 * Builds individual confirmed pass WhatsApp message
 */
export function buildWhatsAppShareUrl(options: {
  regId: string;
  headName: string;
  pax: number;
  amount: number;
  estimatedCost: number;
  eventName: string;
  eventDate: string;
  venue: string;
  transId: string;
}): string {
  const message = `જય જિનેન્દ્ર 🙏✨

*શ્રી જહાજ મંદિર (મીરપુર) જાત્રા રજીસ્ટ્રેશન કન્ફર્મ થયું છે!*
*"પ્રેમ સમરથ" પરિવાર સ્નેહમિલન*

*રજીસ્ટ્રેશન નંબર:* ${options.regId}
*પરિવારના મોભી (Head):* ${options.headName}
*કુલ સભ્યો (Pax):* ${options.pax} વ્યક્તિ
*જમા કરેલ ટોકન રકમ:* ${formatINR(options.amount)} (વ્યક્તિ દીઠ ₹૧,૦૦૦ પ્રમાણે)
*અંદાજિત કુલ ખર્ચ:* ${formatINR(options.estimatedCost)} (આશરે ₹૩,૫૦૦/વ્યક્તિ)
*Google Pay / UTR:* ${options.transId}

🗓 *તારીખ:* ${options.eventDate}
📍 *સ્થળ:* ${options.venue}
🚌 *પ્રવાસ:* અમદાવાદથી લક્ઝરી AC બસ

રૂમ અને બસ સીટિંગ ફાળવણી સમયસર કરી દેવામાં આવશે.`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
