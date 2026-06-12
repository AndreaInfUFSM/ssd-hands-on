function doGet(e) {
  const resource = e && e.parameter && e.parameter.resource;
  const origin = (e && e.parameter && e.parameter.origin) || '*';

  try {
    let result;
    switch (resource) {
      case 'challenge':
        result = getChallenge();
        break;
      case 'students':
        result = getStudents();
        break;
      case 'config':
        result = getConfig();
        break;
      default:
        return sendJson({ error: 'Unknown resource: ' + resource }, 400, origin);
    }
    return sendJson(result, 200, origin);
  } catch (err) {
    return sendJson({ error: err.message }, 500, origin);
  }
}

function doPost(e) {
  const origin = (e && e.parameter && e.parameter.origin) || '*';

  try {
    const payload = JSON.parse(e.postData.contents);
    const resource = payload && payload.resource;

    if (resource === 'submit' || (!resource && payload.challenge_id)) {
      const result = handleSubmission(payload);
      return sendJson(result, 200, origin);
    }

    return sendJson({ error: 'Unknown resource' }, 400, origin);
  } catch (err) {
    return sendJson({ error: err.message }, 500, origin);
  }
}

function sendJson(data, status, origin) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function getSheetByName(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Sheet "' + name + '" not found.');
  return sheet;
}

function getHeaderRow(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

function sheetToObjects(sheet) {
  const headers = getHeaderRow(sheet);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return data.map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h.toString().trim()] = row[i]; });
    return obj;
  });
}

function getStudents() {
  const sheet = getSheetByName('Students');
  const rows = sheetToObjects(sheet);
  return rows
    .filter(r => String(r.active).toLowerCase() === 'true' || r.active === true)
    .map(r => ({
      id: String(r.student_id || ''),
      display_name: String(r.display_name || ''),
    }));
}

function getChallenge() {
  const sheet = getSheetByName('Challenges');
  const rows = sheetToObjects(sheet);
  const tz = getConfig().timezone || 'America/Sao_Paulo';
  const today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');

  const active = rows.filter(r => {
    const isActive = String(r.active).toLowerCase() === 'true' || r.active === true;
    const dateMatch = String(r.date || '').trim() === today;
    return isActive && dateMatch;
  });

  if (active.length === 0) {
    throw new Error('No challenge');
  }

  const challengeRow = active[0];
  let challengeJson;
  try {
    challengeJson = typeof challengeRow.challenge_json === 'string'
      ? JSON.parse(challengeRow.challenge_json)
      : challengeRow.challenge_json;
  } catch (e) {
    throw new Error('Invalid challenge JSON in row for challenge ' + challengeRow.challenge_id);
  }

  challengeJson.challenge_id = String(challengeRow.challenge_id || challengeJson.challenge_id);
  challengeJson.version = Number(challengeRow.version || challengeJson.version || 1);
  challengeJson.date = String(challengeRow.date || challengeJson.date || today);
  challengeJson.title = String(challengeRow.title || challengeJson.title || '');
  challengeJson.topics = challengeRow.topics
    ? String(challengeRow.topics).split(',').map(s => s.trim()).filter(Boolean)
    : (challengeJson.topics || []);
  challengeJson.difficulty = String(challengeRow.difficulty || challengeJson.difficulty || '');

  return challengeJson;
}

function getConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const namedRange = ss.getRangeByName('Config');
  if (!namedRange) {
    return getDefaultConfig();
  }

  const values = namedRange.getValues();
  const config = getDefaultConfig();

  for (let i = 0; i < values.length; i++) {
    const key = String(values[i][0] || '').trim();
    const value = values[i][1];
    if (key) {
      config[key] = value;
    }
  }

  return config;
}

function getDefaultConfig() {
  return {
    course_name: 'Programming Paradigms',
    timezone: 'America/Sao_Paulo',
    allow_manual_name: false,
    frontend_version: '1.0.0',
    challenge_selection_mode: 'daily',
  };
}

function handleSubmission(payload) {
  const required = ['challenge_id', 'student_display_name', 'response_json'];
  for (const field of required) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
      throw new Error('Missing required field: ' + field);
    }
  }

  const sheet = getSheetByName('Responses');
  const headers = getHeaderRow(sheet);
  const tz = getConfig().timezone || 'America/Sao_Paulo';
  const now = new Date();

  const studentId = payload.student_id || '';
  const challengeId = String(payload.challenge_id);

  if (studentId) {
    const existing = findDuplicate(sheet, headers, challengeId, studentId);
    if (existing) {
      throw new Error('Duplicate submission: student ' + studentId + ' already submitted for challenge ' + challengeId);
    }
  }

  const row = buildRow(headers, {
    timestamp: Utilities.formatDate(now, tz, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    challenge_id: challengeId,
    challenge_version: payload.challenge_version || 1,
    student_id: studentId,
    student_display_name: String(payload.student_display_name),
    student_source: payload.student_source || (studentId ? 'listed' : 'manual'),
    response_json: JSON.stringify(payload.response_json),
    feedback_json: payload.feedback_json ? JSON.stringify(payload.feedback_json) : '',
    elapsed_seconds: payload.elapsed_seconds || '',
    frontend_version: payload.frontend_version || '',
  });

  sheet.appendRow(row);

  return { status: 'ok', message: 'Response recorded.' };
}

function buildRow(headers, data) {
  return headers.map(h => {
    const key = h.toString().trim();
    return data[key] !== undefined ? data[key] : '';
  });
}

function findDuplicate(sheet, headers, challengeId, studentId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  const ci = headers.indexOf('challenge_id');
  const si = headers.indexOf('student_id');

  if (ci === -1 || si === -1) return null;

  for (let i = 0; i < data.length; i++) {
    if (String(data[i][ci]).trim() === challengeId && String(data[i][si]).trim() === studentId) {
      return data[i];
    }
  }
  return null;
}
