const API_BASE_KEY = 'CHALLENGE_APP_API_BASE_URL';

const DEFAULT_API_BASE = '';
const DEFAULT_TIMEZONE = 'America/Sao_Paulo';
const FRONTEND_VERSION = '1.0.0';

let appState = {
  config: null,
  students: [],
  challenge: null,
  selectedStudentId: null,
  selectedStudentDisplay: null,
  studentSource: null,
  isSubmitting: false,
  hasSubmitted: false,
};

let apiBase = DEFAULT_API_BASE;

function getApiUrl(resource) {
  const base = apiBase || localStorage.getItem(API_BASE_KEY) || '';
  return base + '?resource=' + encodeURIComponent(resource);
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    let msg;
    try { msg = JSON.parse(text).message || text; }
    catch { msg = text || 'Request failed with status ' + res.status; }
    throw new Error(msg);
  }
  return res.json();
}

function postJSON(url, data) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

function showSection(id) {
  document.querySelectorAll('#app > section').forEach(s => s.classList.add('hidden'));
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function showError(message) {
  document.getElementById('error-message').textContent = message;
  showSection('error-section');
}

function setLoading(visible) {
  if (visible) showSection('loading-section');
  else document.getElementById('loading-section').classList.add('hidden');
}

async function loadAppData() {
  setLoading(true);
  try {
    const [config, students, challenge] = await Promise.all([
      fetchJSON(getApiUrl('config')),
      fetchJSON(getApiUrl('students')),
      fetchJSON(getApiUrl('challenge')).catch(err => {
        if (err.message.includes('404') || err.message.includes('No challenge')) {
          return null;
        }
        throw err;
      }),
    ]);
    appState.config = config;
    appState.students = students;
    appState.challenge = challenge;

    if (config.course_name) {
      document.getElementById('course-name').textContent = config.course_name;
    }

    if (challenge) {
      renderChallenge(challenge);
      initStudentAutocomplete();
      showSection('challenge-section');
      document.getElementById('submit-btn').removeAttribute('disabled');
    } else {
      showSection('no-challenge-section');
    }
  } catch (err) {
    showError('Failed to load app data: ' + err.message + '. Please check your connection and try again.');
  } finally {
    setLoading(false);
  }
}

function renderChallenge(challenge) {
  document.getElementById('challenge-title').textContent = challenge.title || '';

  const metaParts = [];
  if (challenge.topics && challenge.topics.length) {
    metaParts.push(challenge.topics.join(', '));
  }
  if (challenge.difficulty) {
    metaParts.push(challenge.difficulty);
  }
  document.getElementById('challenge-topics').textContent = metaParts.join(' · ');

  if (challenge.intro && challenge.intro.length) {
    renderBlocks('challenge-intro', challenge.intro);
  }
  if (challenge.prompt && challenge.prompt.length) {
    renderBlocks('challenge-prompt', challenge.prompt);
  }

  if (challenge.response) {
    renderResponseFields(challenge.response);
  }
}

function renderBlocks(containerId, blocks) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  blocks.forEach(block => {
    const el = renderBlock(block);
    if (el) container.appendChild(el);
  });
}

function renderBlock(block) {
  switch (block.type) {
    case 'markdown': return renderMarkdownBlock(block);
    case 'code': return renderCodeBlock(block);
    case 'image': return renderImageBlock(block);
    case 'callout': return renderCalloutBlock(block);
    default:
      console.warn('Unknown block type:', block.type);
      return null;
  }
}

function renderMarkdownBlock(block) {
  const div = document.createElement('div');
  div.className = 'block block-markdown';
  const p = document.createElement('p');
  p.textContent = block.content || '';
  div.appendChild(p);
  return div;
}

function renderCodeBlock(block) {
  const div = document.createElement('div');
  div.className = 'block block-code';
  const header = document.createElement('div');
  header.className = 'code-header';
  header.textContent = block.language || 'code';
  div.appendChild(header);
  const pre = document.createElement('pre');
  pre.textContent = block.content || '';
  div.appendChild(pre);
  return div;
}

function renderImageBlock(block) {
  const div = document.createElement('div');
  div.className = 'block block-image';
  const img = document.createElement('img');
  img.src = block.url || '';
  img.alt = block.alt || '';
  div.appendChild(img);
  if (block.caption) {
    const caption = document.createElement('p');
    caption.className = 'image-caption';
    caption.textContent = block.caption;
    div.appendChild(caption);
  }
  if (block.alt) {
    const altP = document.createElement('p');
    altP.className = 'image-alt';
    altP.textContent = 'Alt text: ' + block.alt;
    div.appendChild(altP);
  }
  return div;
}

function renderCalloutBlock(block) {
  const div = document.createElement('div');
  div.className = 'block block-callout ' + (block.style || 'note');
  div.textContent = block.content || '';
  return div;
}

function renderResponseFields(responseModel) {
  const container = document.getElementById('response-fields');
  container.innerHTML = '';

  if (responseModel.type === 'mixed' && responseModel.fields) {
    responseModel.fields.forEach(field => {
      const el = renderField(field);
      if (el) container.appendChild(el);
    });
  } else {
    const el = renderField(responseModel);
    if (el) container.appendChild(el);
  }
}

function renderField(field) {
  switch (field.type) {
    case 'open_text': return renderOpenTextField(field);
    case 'single_choice': return renderSingleChoiceField(field);
    case 'code': return renderCodeResponseField(field);
    default:
      console.warn('Unknown field type:', field.type);
      return null;
  }
}

function renderOpenTextField(field) {
  const div = document.createElement('div');
  div.className = 'field';
  div.dataset.fieldId = field.id || '';

  const label = document.createElement('label');
  label.textContent = field.label || 'Your answer';
  if (field.required) {
    const req = document.createElement('span');
    req.className = 'required-mark';
    req.textContent = ' *';
    label.appendChild(req);
  }
  div.appendChild(label);

  if (field.hint) {
    const hint = document.createElement('p');
    hint.className = 'field-hint';
    hint.textContent = field.hint;
    div.appendChild(hint);
  }

  const textarea = document.createElement('textarea');
  textarea.id = 'field-' + (field.id || 'open_text');
  textarea.placeholder = field.placeholder || '';
  if (field.max_length) textarea.setAttribute('maxlength', field.max_length);
  div.appendChild(textarea);

  if (field.max_length) {
    const count = document.createElement('div');
    count.className = 'char-count';
    count.textContent = '0/' + field.max_length;
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      count.textContent = len + '/' + field.max_length;
      count.classList.toggle('over', len > field.max_length);
    });
    div.appendChild(count);
  }

  return div;
}

function renderSingleChoiceField(field) {
  const div = document.createElement('div');
  div.className = 'field';
  div.dataset.fieldId = field.id || '';

  const label = document.createElement('label');
  label.textContent = field.label || 'Choose one';
  if (field.required) {
    const req = document.createElement('span');
    req.className = 'required-mark';
    req.textContent = ' *';
    label.appendChild(req);
  }
  div.appendChild(label);

  const optionsDiv = document.createElement('div');
  optionsDiv.className = 'choice-options';

  let selectedInput = null;

  (field.options || []).forEach(opt => {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'choice-option';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'field-' + (field.id || 'choice');
    radio.value = opt.id;
    optionDiv.appendChild(radio);

    const optLabel = document.createElement('span');
    optLabel.className = 'option-label';
    optLabel.textContent = opt.label || opt.id;
    optionDiv.appendChild(optLabel);

    optionDiv.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        radio.checked = true;
      }
      optionsDiv.querySelectorAll('.choice-option').forEach(o => o.classList.remove('selected'));
      if (radio.checked) optionDiv.classList.add('selected');
    });

    radio.addEventListener('change', () => {
      optionsDiv.querySelectorAll('.choice-option').forEach(o => o.classList.remove('selected'));
      if (radio.checked) optionDiv.classList.add('selected');
    });

    optionsDiv.appendChild(optionDiv);
  });

  div.appendChild(optionsDiv);

  if (field.explanation) {
    const fieldId = field.id || 'choice';
    const explField = { ...field.explanation, id: fieldId + '_explanation', label: field.explanation.label || 'Explain your choice' };
    const explEl = renderOpenTextField(explField);
    if (explEl) {
      explEl.style.marginTop = '12px';
      div.appendChild(explEl);
    }
  }

  return div;
}

function renderCodeResponseField(field) {
  const div = document.createElement('div');
  div.className = 'field';
  div.dataset.fieldId = field.id || '';

  const label = document.createElement('label');
  label.textContent = field.label || 'Write your code';
  if (field.required) {
    const req = document.createElement('span');
    req.className = 'required-mark';
    req.textContent = ' *';
    label.appendChild(req);
  }
  div.appendChild(label);

  if (field.language) {
    const hint = document.createElement('p');
    hint.className = 'field-hint';
    hint.textContent = 'Language: ' + field.language;
    div.appendChild(hint);
  }

  const textarea = document.createElement('textarea');
  textarea.id = 'field-' + (field.id || 'code');
  textarea.className = 'code-textarea';
  textarea.placeholder = field.placeholder || 'Write your code here...';
  textarea.spellcheck = false;
  div.appendChild(textarea);

  return div;
}

function initStudentAutocomplete() {
  const input = document.getElementById('student-input');
  const suggestions = document.getElementById('student-suggestions');

  input.addEventListener('input', () => {
    const query = input.value.trim();
    if (query) {
      const matches = filterStudents(query);
      renderSuggestions(matches);
      if (appState.selectedStudentId) {
        const match = appState.students.find(s => s.id === appState.selectedStudentId);
        if (!match || match.display_name.toLowerCase() !== query.toLowerCase()) {
          clearStudentSelection();
        }
      }
    } else {
      suggestions.classList.add('hidden');
      clearStudentSelection();
    }
  });

  input.addEventListener('blur', () => {
    setTimeout(() => suggestions.classList.add('hidden'), 200);
  });

  input.addEventListener('focus', () => {
    const query = input.value.trim();
    if (query) {
      const matches = filterStudents(query);
      renderSuggestions(matches);
    }
  });
}

function filterStudents(query) {
  const lower = query.toLowerCase();
  return appState.students.filter(s =>
    s.display_name.toLowerCase().includes(lower)
  );
}

function renderSuggestions(matches) {
  const list = document.getElementById('student-suggestions');
  list.innerHTML = '';

  if (matches.length === 0) {
    list.classList.add('hidden');
    return;
  }

  matches.forEach(student => {
    const li = document.createElement('li');
    li.textContent = student.display_name;
    li.addEventListener('mousedown', (e) => {
      e.preventDefault();
      selectStudent(student);
    });
    list.appendChild(li);
  });

  list.classList.remove('hidden');
}

function selectStudent(student) {
  const input = document.getElementById('student-input');
  input.value = student.display_name;
  appState.selectedStudentId = student.id;
  appState.selectedStudentDisplay = student.display_name;
  appState.studentSource = 'listed';
  document.getElementById('student-suggestions').classList.add('hidden');
  updateStudentStatus();
}

function clearStudentSelection() {
  appState.selectedStudentId = null;
  appState.selectedStudentDisplay = null;
  appState.studentSource = null;
  updateStudentStatus();
}

function updateStudentStatus() {
  const statusEl = document.getElementById('student-status');
  const input = document.getElementById('student-input').value.trim();

  if (appState.studentSource === 'listed') {
    statusEl.textContent = 'Identified as: ' + appState.selectedStudentDisplay + ' (listed)';
    statusEl.className = 'status-message listed';
    statusEl.classList.remove('hidden');
  } else if (input && appState.config && appState.config.allow_manual_name) {
    appState.studentSource = 'manual';
    appState.selectedStudentDisplay = input;
    statusEl.textContent = 'Submitting as: ' + input + ' (unlisted)';
    statusEl.className = 'status-message manual';
    statusEl.classList.remove('hidden');
  } else {
    statusEl.classList.add('hidden');
  }
}

function getStudentSelection() {
  const input = document.getElementById('student-input').value.trim();

  if (appState.studentSource === 'listed' && appState.selectedStudentId) {
    return {
      student_id: appState.selectedStudentId,
      student_display_name: appState.selectedStudentDisplay,
      student_source: 'listed',
    };
  }

  if (appState.config && appState.config.allow_manual_name && input) {
    return {
      student_id: '',
      student_display_name: input,
      student_source: 'manual',
    };
  }

  return null;
}

function collectResponseData() {
  const data = {};
  const fields = document.querySelectorAll('#response-fields .field');

  fields.forEach(field => {
    const fieldId = field.dataset.fieldId;
    if (!fieldId) return;

    const choiceOptions = field.querySelector('.choice-options');
    if (choiceOptions) {
      const checked = field.querySelector('input[type="radio"]:checked');
      data[fieldId] = checked ? checked.value : null;
      const explField = field.querySelector('.field[data-field-id$="_explanation"]');
      if (explField) {
        const explId = explField.dataset.fieldId;
        const explTextarea = explField.querySelector('textarea');
        data[explId] = explTextarea ? explTextarea.value : '';
      }
      return;
    }

    const textarea = field.querySelector('textarea');
    if (textarea) {
      data[fieldId] = textarea.value;
    }
  });

  return data;
}

function clearFormErrors() {
  document.getElementById('form-errors').classList.add('hidden');
  document.getElementById('form-errors-list').innerHTML = '';
  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
  document.querySelectorAll('.field-error-message').forEach(el => el.remove());
}

function showFormError(message) {
  const list = document.getElementById('form-errors-list');
  const li = document.createElement('li');
  li.textContent = message;
  list.appendChild(li);
  document.getElementById('form-errors').classList.remove('hidden');
}

function markFieldError(fieldEl, message) {
  fieldEl.classList.add('field-error');
  const msg = document.createElement('p');
  msg.className = 'field-error-message';
  msg.textContent = message;
  fieldEl.parentNode.insertBefore(msg, fieldEl.nextSibling);
}

function validateForm() {
  clearFormErrors();
  let valid = true;

  const student = getStudentSelection();
  if (!student) {
    const input = document.getElementById('student-input').value.trim();
    if (!input) {
      showFormError('Please type or select your name.');
    } else if (appState.config && !appState.config.allow_manual_name) {
      showFormError('The typed name was not found in the student list. Please select a name from the suggestions.');
    } else {
      showFormError('Please type or select your name.');
    }
    valid = false;
  }

  const challenge = appState.challenge;
  const responseModel = challenge ? challenge.response : null;
  if (!responseModel) {
    showFormError('No challenge response model available.');
    return false;
  }

  const fields = responseModel.type === 'mixed' ? (responseModel.fields || []) : [responseModel];
  const responseData = collectResponseData();

  fields.forEach(field => {
    const fieldId = field.id || field.type;
    if (field.required) {
      const val = responseData[fieldId];
      const isEmpty = val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
      if (isEmpty) {
        valid = false;
        const fieldEl = document.querySelector(`.field[data-field-id="${fieldId}"]`);
        if (fieldEl) markFieldError(fieldEl, 'This field is required.');
        else showFormError('Field "' + (field.label || fieldId) + '" is required.');
      }
    }

    const minLen = field.min_length;
    if (minLen && (field.type === 'open_text' || field.type === 'code')) {
      const val = responseData[fieldId] || '';
      if (val.length > 0 && val.length < minLen) {
        valid = false;
        const fieldEl = document.querySelector(`.field[data-field-id="${fieldId}"]`);
        if (fieldEl) markFieldError(fieldEl, 'Minimum length is ' + minLen + ' characters (' + val.length + '/' + minLen + ').');
        else showFormError('Field "' + (field.label || fieldId) + '" must have at least ' + minLen + ' characters.');
      }
    }

    if (field.type === 'single_choice' && field.explanation) {
      const explId = fieldId + '_explanation';
      const explField = field.explanation;
      if (explField.required) {
        const val = responseData[explId] || '';
        if (val.trim() === '') {
          valid = false;
          const fieldEl = document.querySelector(`.field[data-field-id="${explId}"]`);
          if (fieldEl) markFieldError(fieldEl, 'Explanation is required.');
          else showFormError('Explanation is required.');
        }
      }
    }
  });

  return valid;
}

function evaluateFeedback() {
  const challenge = appState.challenge;
  if (!challenge || !challenge.feedback) return null;

  const feedback = challenge.feedback;
  const responseData = collectResponseData();

  switch (feedback.mode) {
    case 'static':
      return evaluateStaticFeedback(feedback);
    case 'answer_key':
      return evaluateAnswerKeyFeedback(feedback, responseData);
    case 'rule_based':
      return evaluateRuleBasedFeedback(feedback.rules || [], responseData, feedback.default_message);
    case 'hybrid':
      return evaluateHybridFeedback(feedback, responseData);
    default:
      return null;
  }
}

function evaluateStaticFeedback(feedback) {
  return feedback.message ? [{ type: 'static', message: feedback.message }] : null;
}

function evaluateAnswerKeyFeedback(feedback, responseData) {
  const fieldId = feedback.field_id;
  const selected = responseData[fieldId];
  const isCorrect = (feedback.correct_options || []).includes(selected);

  return [{
    type: 'answer_key',
    correct: isCorrect,
    message: isCorrect ? (feedback.messages || {}).correct : (feedback.messages || {}).incorrect,
    field_id: fieldId,
  }];
}

function evaluateRuleBasedFeedback(rules, responseData, defaultMessage) {
  const results = [];

  (rules || []).forEach(rule => {
    if (!rule.condition || !rule.condition.terms || !rule.condition.terms.length) return;

    const fieldValue = responseData[rule.id] || responseData[rule.condition.field_id] || '';
    const lowerValue = fieldValue.toLowerCase();

    const match = rule.condition.terms.some(term => lowerValue.includes(term.toLowerCase()));
    if (match) {
      results.push({ type: 'rule', ruleId: rule.id, message: rule.message });
    }
  });

  if (results.length === 0 && defaultMessage) {
    results.push({ type: 'default', message: defaultMessage });
  }

  return results;
}

function evaluateHybridFeedback(feedback, responseData) {
  const results = [];

  if (feedback.choice_feedback) {
    const choiceResults = evaluateAnswerKeyFeedback(feedback.choice_feedback, responseData);
    if (choiceResults) results.push(...choiceResults);
  }

  if (feedback.explanation_rules) {
    const ruleResults = evaluateRuleBasedFeedback(feedback.explanation_rules, responseData, feedback.default_message);
    if (ruleResults) results.push(...ruleResults);
  }

  return results;
}

function renderFeedback(feedbackResults) {
  const container = document.getElementById('feedback-content');
  container.innerHTML = '';

  if (!feedbackResults || feedbackResults.length === 0) {
    container.innerHTML = '<p>No feedback available.</p>';
    return;
  }

  feedbackResults.forEach(result => {
    const div = document.createElement('div');
    div.className = 'feedback-block';

    if (result.type === 'answer_key') {
      div.classList.add(result.correct ? 'correct' : 'incorrect');
      const icon = result.correct ? '✓' : '✗';
      div.innerHTML = '<strong>' + icon + '</strong> ' + (result.message || '');
    } else if (result.type === 'rule') {
      div.classList.add('correct');
      const name = document.createElement('div');
      name.className = 'feedback-rule-name';
      name.textContent = '✓ Feedback';
      div.appendChild(name);
      const msg = document.createElement('p');
      msg.textContent = result.message;
      div.appendChild(msg);
    } else if (result.type === 'static') {
      div.textContent = result.message || '';
    } else {
      div.className = 'feedback-block default';
      div.textContent = result.message || '';
    }

    container.appendChild(div);
  });
}

function renderAfterSubmission() {
  const challenge = appState.challenge;
  if (!challenge || !challenge.after_submission || !challenge.after_submission.length) return;

  const container = document.getElementById('after-submission-content');
  container.innerHTML = '';
  challenge.after_submission.forEach(block => {
    const el = renderBlock(block);
    if (el) container.appendChild(el);
  });

  document.getElementById('after-submission-section').classList.remove('hidden');
}

async function handleSubmit(event) {
  event.preventDefault();
  clearFormErrors();

  if (appState.isSubmitting) return;
  if (appState.hasSubmitted) {
    showFormError('You have already submitted a response for this challenge.');
    return;
  }

  if (!validateForm()) return;

  appState.isSubmitting = true;
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  const responseData = collectResponseData();
  const feedbackResults = evaluateFeedback();

  const student = getStudentSelection();
  const payload = {
    challenge_id: appState.challenge.challenge_id,
    challenge_version: appState.challenge.version,
    student_id: student.student_id,
    student_display_name: student.student_display_name,
    student_source: student.student_source,
    response_json: responseData,
    feedback_json: feedbackResults,
    frontend_version: FRONTEND_VERSION,
  };

  try {
    const res = await postJSON(getApiUrl('submit'), payload);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Submission failed with status ' + res.status);
    }

    appState.hasSubmitted = true;
    btn.textContent = 'Submitted ✓';
    btn.disabled = true;

    if (feedbackResults) {
      renderFeedback(feedbackResults);
      document.getElementById('feedback-section').classList.remove('hidden');
    }

    renderAfterSubmission();
  } catch (err) {
    appState.isSubmitting = false;
    btn.disabled = false;
    btn.textContent = 'Submit Response';
    showFormError('Submission failed: ' + err.message + '. Please try again.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem(API_BASE_KEY);
  if (stored) apiBase = stored;

  document.getElementById('submit-btn').addEventListener('click', handleSubmit);

  document.getElementById('student-input').addEventListener('input', updateStudentStatus);

  loadAppData();
});
