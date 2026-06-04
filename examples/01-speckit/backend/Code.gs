const BACKEND_FRONTEND_VERSION = '1.0.0';

function doGet(e) {
  return handleRequest(e, false);
}

function doPost(e) {
  return handleRequest(e, true);
}

function handleRequest(e, isPost) {
  try {
    const action = e.parameter && e.parameter.action;
    if (!action) {
      return jsonResponse({ success: false, error: 'Missing action parameter' }, 400);
    }

    if (isPost) {
      if (action === 'submitResponse') {
        const payload = parseJson(e.postData && e.postData.contents);
        return jsonResponse(submitResponse(payload));
      }
      return jsonResponse({ success: false, error: `Unsupported POST action: ${action}` }, 400);
    }

    switch (action) {
      case 'getConfig':
        return jsonResponse(getConfig());
      case 'getStudents':
        return jsonResponse(getStudents());
      case 'getActiveChallenge':
        return jsonResponse(getActiveChallenge());
      default:
        return jsonResponse({ success: false, error: `Unsupported GET action: ${action}` }, 400);
    }
  } catch (error) {
    return jsonResponse({ success: false, error: String(error) }, 500);
  }
}

function getConfig() {
  const config = Object.assign({
    course_name: 'Challenge of the Day',
    timezone: 'America/Sao_Paulo',
    allow_manual_name: true,
    frontend_version: BACKEND_FRONTEND_VERSION,
    challenge_selection_mode: 'date',
  }, readConfigSheet());

  if (typeof config.allow_manual_name === 'string') {
    config.allow_manual_name = /^(true|1|yes)$/i.test(config.allow_manual_name);
  }

  return config;
}

function getStudents() {
  const sheet = getSheetByName('Students');
  if (!sheet) return [];

  const rows = getSheetData(sheet);
  return rows
    .filter(row => row.student_id && row.display_name)
    .filter(row => isTruthy(row.active))
    .map(row => ({
      student_id: String(row.student_id),
      display_name: String(row.display_name),
      active: true,
    }));
}

function getActiveChallenge() {
  const sheet = getSheetByName('Challenges');
  if (!sheet) return { challenge: null, message: 'Challenges sheet not found.' };

  const rows = getSheetData(sheet);
  const config = getConfig();
  const today = Utilities.formatDate(new Date(), config.timezone, 'yyyy-MM-dd');

  const activeRows = rows.filter(row => isTruthy(row.active) && row.date);
  const match = activeRows.find(row => String(row.date).trim() === today);

  if (!match) {
    return { challenge: null, message: 'No challenge configured for today.' };
  }

  const challengeJson = parseJson(match.challenge_json);
  if (!challengeJson || typeof challengeJson !== 'object') {
    return { challenge: null, message: 'Challenge JSON is malformed.' };
  }

  return { challenge: challengeJson };
}

function submitResponse(payload) {
  validateSubmissionPayload(payload);
  const ss = getSpreadsheet();
  const sheet = getOrCreateSheet(ss, 'Responses');

  const row = [
    new Date(),
    payload.challenge_id,
    payload.challenge_version,
    payload.student_id || '',
    payload.student_display_name,
    payload.student_source,
    JSON.stringify(payload.response_json || {}),
    JSON.stringify(payload.feedback_json || {}),
    Number(payload.elapsed_seconds) || 0,
    payload.frontend_version || BACKEND_FRONTEND_VERSION,
  ];

  sheet.appendRow(row);
  return { success: true };
}

function validateSubmissionPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be a JSON object.');
  }

  const required = ['challenge_id', 'challenge_version', 'student_display_name', 'student_source', 'response_json', 'frontend_version'];
  required.forEach(key => {
    if (!payload[key]) {
      throw new Error(`Missing required field: ${key}`);
    }
  });

  if (payload.student_source === 'listed' && !payload.student_id) {
    throw new Error('student_id is required for listed students.');
  }

  if (!['listed', 'manual'].includes(payload.student_source)) {
    throw new Error('student_source must be either "listed" or "manual".');
  }

  if (typeof payload.response_json !== 'object') {
    throw new Error('response_json must be a JSON object.');
  }
}

function readConfigSheet() {
  const sheet = getSheetByName('Config');
  if (!sheet) return {};
  const rows = getSheetData(sheet);
  const config = {};
  rows.forEach(row => {
    if (row.key) {
      config[String(row.key).trim()] = row.value;
    }
  });
  return config;
}

function isTruthy(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return /^(true|1|yes|y)$/i.test(String(value).trim());
}

function getSheetByName(name) {
  const ss = getSpreadsheet();
  return ss.getSheetByName(name);
}

function getSpreadsheet() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  if (spreadsheetId) {
    return SpreadsheetApp.openById(spreadsheetId);
  }

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    return active;
  }

  throw new Error('Unable to open the spreadsheet. Set SPREADSHEET_ID in script properties or bind the script to a spreadsheet.');
}

function getSheetData(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(header => String(header || '').trim());
  return values.slice(1).map(row => {
    const record = {};
    row.forEach((value, index) => {
      record[headers[index]] = value;
    });
    return record;
  });
}

function parseJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(String(value));
  } catch (error) {
    return null;
  }
}

function jsonResponse(payload, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  if (statusCode) {
    output.setContent(JSON.stringify(payload));
  }
  return output;
}
