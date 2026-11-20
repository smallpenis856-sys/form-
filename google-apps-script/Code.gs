// Paste this into Extensions -> Apps Script of the Google Sheet:
// "FIRST NOBLE STEP — Student Registrations" (tab: Registrations)
// Then Deploy -> New deployment -> Web app (Execute as: Me, Who has access: Anyone)
// and set the Web App URL as VITE_GOOGLE_SHEETS_WEBHOOK_URL.

const SHEET_NAME = 'Registrations';

function safeCell(value) {
  const s = value === null || value === undefined ? '' : String(value);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const data = JSON.parse(e.postData.contents);
    if (!data || !data.reference || !data.name) {
      return jsonOut({ ok: false, error: 'Missing required fields' });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    const row = [
      safeCell(data.reference),
      safeCell(data.submittedAt),
      safeCell(data.status || 'Form Submitted'),
      safeCell(data.name),
      safeCell(data.email),
      safeCell(data.phone),
      safeCell(data.address),
      safeCell(data.university),
      safeCell(data.institutionCategory),
      Number(data.fee) || '',
      safeCell(data.degree),
      safeCell(data.semester),
      safeCell(data.universityCardFile),
      safeCell(data.issueDate),
      safeCell(data.validTill),
    ];

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const refs = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < refs.length; i++) {
        if (String(refs[i][0]) === String(data.reference)) {
          sheet.getRange(i + 2, 1, 1, row.length).setValues([row]);
          return jsonOut({ ok: true, action: 'updated', row: i + 2 });
        }
      }
    }

    sheet.appendRow(row);
    return jsonOut({ ok: true, action: 'inserted', row: sheet.getLastRow() });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
