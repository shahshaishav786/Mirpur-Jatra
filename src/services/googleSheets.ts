import { RegistrationRecord } from '../types';

export const TARGET_DRIVE_FOLDER_ID = '1Bp920iNoIogGrlkgqLCT5utGopKsg-El';
export const TARGET_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${TARGET_DRIVE_FOLDER_ID}`;
export const SPREADSHEET_TITLE = 'પ્રેમ સમરથ પરિવાર - જાત્રા ૨૦૨૬ રજીસ્ટ્રેશન લિસ્ટ (Prem Samarth Yatra 2026)';

export const SHEET_HEADERS = [
  'પાસ ID (Pass ID)',
  'નોંધણી તારીખ & સમય (Date & Time)',
  'પરિવાર મોભીનું નામ (Head of Family)',
  'સંપર્ક નંબર ૧ / મુખ્ય મોબાઈલ (Contact No. 1)',
  'સંપર્ક નંબર ૨ / વૈકલ્પિક મોબાઈલ (Contact No. 2)',
  'મૂળ વતન (Native Place)',
  'સરનામું (Address)',
  'કુલ સભ્યો (Pax)',
  'ટોકન દર (Rate / Pax)',
  'કુલ ટોકન જમા (Total Token Paid)',
  'અંદાજિત કુલ ખર્ચ (Estimated Total Cost)',
  'પેમેન્ટ પદ્ધતિ (Payment Method)',
  'UPI UTR / ટ્રાન્ઝેક્શન રેફરન્સ (UTR / Ref ID)',
  'પેમેન્ટ સ્ટેટસ (Payment Status)',
  'સભ્યોની વિગત (Pax Members Breakdown)',
  'છેલ્લો સુધારો (Last Updated)',
];

export interface SpreadsheetSyncResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  folderUrl: string;
  totalSynced: number;
}

// In-memory cache for the spreadsheet ID
let cachedSpreadsheetId: string | null = null;

export const formatRecordRow = (r: RegistrationRecord): (string | number)[] => {
  const membersStr = (r.members || [])
    .map((m, idx) => `${idx + 1}. ${m.name || 'નામ બાકી'} (${m.relationship || 'સભ્ય'}, ${m.ageCategory || 'મોટા'}, ${m.foodPreference || 'શુદ્ધ જૈન ચોકો'})`)
    .join(' | ');

  const formattedDate = r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '';
  const updatedDate = r.updatedAt ? new Date(r.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : formattedDate;

  return [
    r.id,
    formattedDate,
    r.headName,
    r.phone,
    r.alternatePhone || '',
    r.nativePlace || '',
    r.address || '',
    r.numberOfPax,
    r.ratePerPax || 1000,
    r.tokenAmount,
    r.estimatedTotalCost || r.numberOfPax * 3500,
    (r.paymentMethod || 'PHONEPE').toUpperCase(),
    r.transactionId || '',
    r.paymentStatus === 'confirmed' ? 'કન્ફર્મ (CONFIRMED)' : 'વેરિફિકેશન બાકી (PENDING)',
    membersStr,
    updatedDate,
  ];
};

/**
 * Searches for an existing spreadsheet in the target Drive folder, or creates a new one.
 */
export const findOrCreateSpreadsheet = async (accessToken: string): Promise<{ id: string; url: string }> => {
  if (cachedSpreadsheetId) {
    return {
      id: cachedSpreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${cachedSpreadsheetId}/edit`,
    };
  }

  // 1. Check if the spreadsheet already exists in the target folder
  try {
    const q = `'${TARGET_DRIVE_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,webViewLink)&pageSize=10`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const existing = searchData.files[0];
        cachedSpreadsheetId = existing.id;
        return {
          id: existing.id,
          url: existing.webViewLink || `https://docs.google.com/spreadsheets/d/${existing.id}/edit`,
        };
      }
    }
  } catch (err) {
    console.warn('Could not query target folder files, attempting direct creation:', err);
  }

  // 2. Create a new Google Spreadsheet inside the target folder using Drive API v3
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: SPREADSHEET_TITLE,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parents: [TARGET_DRIVE_FOLDER_ID],
    }),
  });

  if (!createRes.ok) {
    const errBody = await createRes.text();
    // Fallback: If folder permissions disallow creating inside parents directly, create in root and move or link
    const fallbackCreate = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: SPREADSHEET_TITLE,
        },
      }),
    });

    if (!fallbackCreate.ok) {
      throw new Error(`Failed to create Google Spreadsheet: ${errBody}`);
    }

    const fallbackData = await fallbackCreate.json();
    cachedSpreadsheetId = fallbackData.spreadsheetId;
    return {
      id: fallbackData.spreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${fallbackData.spreadsheetId}/edit`,
    };
  }

  const createdFile = await createRes.json();
  cachedSpreadsheetId = createdFile.id;
  return {
    id: createdFile.id,
    url: createdFile.webViewLink || `https://docs.google.com/spreadsheets/d/${createdFile.id}/edit`,
  };
};

/**
 * Format the header row with nice styling (amber background, bold text, frozen row)
 */
export const formatSpreadsheet = async (accessToken: string, spreadsheetId: string): Promise<void> => {
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          // Freeze top row
          {
            updateSheetProperties: {
              properties: {
                sheetId: 0,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
          // Style top header row (amber-gold header with bold dark brown text)
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.98, green: 0.92, blue: 0.8 }, // Warm amber
                  textFormat: {
                    bold: true,
                    fontSize: 10,
                    foregroundColor: { red: 0.35, green: 0.15, blue: 0.05 },
                  },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
        ],
      }),
    });
  } catch (err) {
    console.warn('Formatting spreadsheet headers skipped:', err);
  }
};

/**
 * Sync all registrations into the Google Sheet in the Drive folder
 */
export const syncAllRegistrationsToSheets = async (
  accessToken: string,
  registrations: RegistrationRecord[]
): Promise<SpreadsheetSyncResult> => {
  const { id: spreadsheetId, url: spreadsheetUrl } = await findOrCreateSpreadsheet(accessToken);

  // Prepare full data matrix (Headers + All Rows)
  const rows = [
    SHEET_HEADERS,
    ...registrations.map(formatRecordRow),
  ];

  // Write all rows to the sheet
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error(`Google Sheets write failed: ${errText}`);
  }

  // Apply visual formatting to header row
  await formatSpreadsheet(accessToken, spreadsheetId);

  return {
    spreadsheetId,
    spreadsheetUrl,
    folderUrl: TARGET_DRIVE_FOLDER_URL,
    totalSynced: registrations.length,
  };
};

/**
 * Append a single new registration record to the spreadsheet
 */
export const appendRegistrationToSheets = async (
  accessToken: string,
  registration: RegistrationRecord
): Promise<string> => {
  const { id: spreadsheetId, url: spreadsheetUrl } = await findOrCreateSpreadsheet(accessToken);

  const row = formatRecordRow(registration);

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!appendRes.ok) {
    const errText = await appendRes.text();
    throw new Error(`Failed to append row to Google Sheet: ${errText}`);
  }

  return spreadsheetUrl;
};
