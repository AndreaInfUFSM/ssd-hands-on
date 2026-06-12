const BACKEND_BASE_URL = 'REPLACE_WITH_APPS_SCRIPT_URL';
const FRONTEND_VERSION = '1.0.0';

const state = {
  config: null,
  students: [],
  selectedStudent: null,
  challenge: null,
  submissionInProgress: false,
  selectedValues: {},
};

const elements = {
  message: document.getElementById('message'),
  statusBadge: document.getElementById('status-badge'),
  studentInput: document.getElementById('student-input'),
  suggestions: document.getElementById('suggestions'),
  studentHint: document.getElementById('student-hint'),
  challengeTitle: document.getElementById('challenge-title'),
  challengeMeta: document.getElementById('challenge-meta'),
  challengeContent: document.getElementById('challenge-content'),
  challengeError: document.getElementById('challenge-error'),
  responseForm: document.getElementById('response-form'),
  submitButton: document.getElementById('submit-button'),
  feedbackSection: document.getElementById('feedback-section'),
  feedbackContent: document.getElementById('feedback-content'),
  afterSubmissionSection: document.getElementById('after-submission-section'),
  afterSubmissionContent: document.getElementById('after-submission-content'),
};

window.addEventListener('load', () => {
  if (BACKEND_BASE_URL === 'REPLACE_WITH_APPS_SCRIPT_URL') {
    showMessage('Please set BACKEND_BASE_URL in frontend/app.js to your Apps Script web app URL.', 'error');
    elements.statusBadge.textContent = 'Configuration required';
    return;
  }

  elements.submitButton.addEventListener('click', handleSubmit);
  elements.studentInput.addEventListener('input', handleStudentInput);
  elements.studentInput.addEventListener('blur', () => setTimeout(() => elements.suggestions.hidden = true, 200));
  loadApp();
});

async function loadApp() {
  updateStatus('Loading data...');

  try {
    const [config, students, challengeResponse] = await Promise.all([
      fetchJson('getConfig'),
      fetchJson('getStudents'),
      fetchJson('getActiveChallenge'),
    ]);

    state.config = Object.assign({
      course_name: 'Challenge of the Day',
      timezone: 'America/Sao_Paulo',
      allow_manual_name: true,
      frontend_version: FRONTEND_VERSION,
      challenge_selection_mode: 'date',
    }, config);

    state.students = Array.isArray(students) ? students : [];
    if (!Array.isArray(state.students)) {
      state.students = [];
    }

    state.challenge = challengeResponse && challengeResponse.challenge ? challengeResponse.challenge : null;

    renderStudentSection();
    renderChallenge();
    updateSubmitState();
    elements.statusBadge.textContent = 'Ready';
  } catch (error) {
    console.error(error);
    showMessage('Unable to load the app: ' + error.message, 'error');
    updateStatus('Load failed');
  }
}

async function fetchJson(action, method = 'GET', body = null) {
  const url = `${BACKEND_BASE_URL}?action=${encodeURIComponent(action)}`;
  const options = {
    method,
    headers: {
      'Accept': 'application/json',
    },
  };
  if (method === 'POST') {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Backend request failed: ${response.status} ${response.statusText} ${text}`);
  }
  return response.json();
}

function renderStudentSection() {
  if (state.students.length === 0) {
    elements.studentHint.textContent = 'No active student list is available. Manual name entry is required.';
  } else {
    elements.studentHint.textContent = state.config.allow_manual_name
      ? 'Select a known student or enter your name manually.'
      : 'Select your name from the active list. Manual entry is disabled.';
  }
}

function handleStudentInput() {
  const query = elements.studentInput.value.trim();
  const matches = state.students.filter(student =>
    student.display_name.toLowerCase().includes(query.toLowerCase())
  );

  if (state.selectedStudent && query !== state.selectedStudent.display_name) {
    state.selectedStudent = null;
  }

  if (!query || matches.length === 0) {
    state.selectedStudent = null;
  }

  renderSuggestions(matches);
  updateSubmitState();
}

function renderSuggestions(matches) {
  elements.suggestions.innerHTML = '';
  if (matches.length === 0) {
    elements.suggestions.hidden = true;
    return;
  }

  matches.forEach(student => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.textContent = student.display_name;
    item.addEventListener('click', () => {
      state.selectedStudent = student;
      elements.studentInput.value = student.display_name;
      elements.suggestions.hidden = true;
      updateSubmitState();
    });
    elements.suggestions.appendChild(item);
  });

  elements.suggestions.hidden = false;
}

function renderChallenge() {
  elements.challengeError.hidden = true;
  elements.challengeContent.innerHTML = '';
  elements.challengeMeta.textContent = '';
  elements.challengeTitle.textContent = 'Challenge';
  elements.responseForm.innerHTML = '';
  elements.feedbackSection.hidden = true;
  elements.afterSubmissionSection.hidden = true;

  if (!state.challenge) {
    showMessage('No challenge is available for today. Please check back later.', 'info');
    elements.challengeTitle.textContent = 'No challenge available';
    elements.submitButton.disabled = true;
    return;
  }

  elements.message.hidden = true;
  elements.challengeTitle.textContent = state.challenge.title || 'Daily challenge';

  const metaItems = [];
  if (state.challenge.topics) metaItems.push(`Topics: ${Array.isArray(state.challenge.topics) ? state.challenge.topics.join(', ') : state.challenge.topics}`);
  if (state.challenge.difficulty) metaItems.push(`Difficulty: ${state.challenge.difficulty}`);
  if (state.challenge.date) metaItems.push(`Date: ${state.challenge.date}`);
  elements.challengeMeta.textContent = metaItems.join(' · ');

  if (!Array.isArray(state.challenge.prompt) && !Array.isArray(state.challenge.intro)) {
    showChallengeError('The challenge JSON is missing intro or prompt content.');
    return;
  }

  const contentBlocks = [];
  if (Array.isArray(state.challenge.intro)) contentBlocks.push(...state.challenge.intro);
  if (Array.isArray(state.challenge.prompt)) contentBlocks.push(...state.challenge.prompt);

  contentBlocks.forEach(block => {
    const node = renderBlock(block);
    if (node) elements.challengeContent.appendChild(node);
  });

  renderResponseControls(state.challenge.response);
}

function renderBlock(block) {
  if (!block || !block.type) return null;

  switch (block.type) {
    case 'markdown':
      return createElement('div', { className: 'markdown-block', innerHTML: renderMarkdown(block.content || '') });
    case 'code':
      const codeContainer = createElement('div', { className: 'code-block' });
      codeContainer.appendChild(createElement('div', { className: 'code-header' }, block.language ? `${block.language}` : 'Code'));
      const codeBlock = createElement('pre', {}, createElement('code', {}, escapeHtml(block.content || '')));
      codeContainer.appendChild(codeBlock);
      return codeContainer;
    case 'image':
      {
        const figure = createElement('figure', {});
        const img = createElement('img', { src: block.url || '', alt: block.alt || 'Image' });
        const caption = createElement('figcaption', {}, block.caption || block.alt || '');
        figure.appendChild(img);
        if (caption.textContent) figure.appendChild(caption);
        return figure;
      }
    case 'callout':
      return createElement('div', { className: `callout callout-${block.style || 'note'}` },
        createElement('strong', {}, capitalize(block.style || 'Note')),
        renderMarkdown(block.content || '')
      );
    default:
      return createElement('div', { className: 'alert alert-error' }, `Unsupported block type: ${block.type}`);
  }
}

function renderResponseControls(responseConfig) {
  if (!responseConfig || !responseConfig.type) {
    showChallengeError('Missing response model in challenge JSON.');
    return;
  }

  elements.responseForm.innerHTML = '';
  const fields = [];

  if (responseConfig.type === 'mixed' && Array.isArray(responseConfig.fields)) {
    responseConfig.fields.forEach(field => fields.push(renderResponseField(field)));
  } else {
    const single = renderResponseField(responseConfig);
    if (single) fields.push(single);
  }

  fields.forEach(field => elements.responseForm.appendChild(field));
}

function renderResponseField(field) {
  if (!field || !field.type) return null;

  const wrapper = createElement('div', { className: 'field-group' });
  const label = createElement('label', {}, field.label || 'Response');
  wrapper.appendChild(label);

  switch (field.type) {
    case 'open_text':
      {
        const textarea = createElement('textarea', {
          id: `field-${field.id}`,
          placeholder: field.placeholder || '',
          'data-field-id': field.id,
          'data-field-type': 'open_text',
          'data-field-required': field.required ? 'true' : 'false',
          'data-field-min-length': field.min_length || 0,
        });
        wrapper.appendChild(textarea);
      }
      break;
    case 'code':
      {
        const textarea = createElement('textarea', {
          id: `field-${field.id}`,
          placeholder: field.placeholder || 'Enter code here...',
          'data-field-id': field.id,
          'data-field-type': 'code',
          'data-field-required': field.required ? 'true' : 'false',
        });
        wrapper.appendChild(textarea);
      }
      break;
    case 'single_choice':
      {
        if (!Array.isArray(field.options)) {
          wrapper.appendChild(createElement('div', { className: 'alert alert-error' }, 'No options defined.'));
          break;
        }
        field.options.forEach(option => {
          const optionId = `field-${field.id}-option-${option.id}`;
          const optionWrapper = createElement('label', { className: 'radio-option' });
          const radio = createElement('input', {
            type: 'radio',
            name: field.id,
            value: option.id,
            id: optionId,
            'data-field-id': field.id,
            'data-field-type': 'single_choice',
            'data-field-required': field.required ? 'true' : 'false',
          });
          optionWrapper.appendChild(radio);
          optionWrapper.appendChild(document.createTextNode(` ${option.label}`));
          wrapper.appendChild(optionWrapper);
        });

        if (field.explanation) {
          const explanationLabel = createElement('label', {}, field.explanation.label || 'Explanation');
          const explanationTextarea = createElement('textarea', {
            id: `field-${field.explanation.id}`,
            placeholder: field.explanation.placeholder || '',
            'data-field-id': field.explanation.id,
            'data-field-type': 'open_text',
            'data-field-required': field.explanation.required ? 'true' : 'false',
            'data-field-min-length': field.explanation.min_length || 0,
          });
          wrapper.appendChild(explanationLabel);
          wrapper.appendChild(explanationTextarea);
        }
      }
      break;
    default:
      wrapper.appendChild(createElement('div', { className: 'alert alert-error' }, `Unsupported response type: ${field.type}`));
      break;
  }

  return wrapper;
}

function createElement(tag, attrs = {}, content = '') {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      el.className = value;
    } else if (key.startsWith('data-')) {
      el.dataset[key.slice(5)] = value;
    } else {
      el.setAttribute(key, value);
    }
  });
  if (typeof content === 'string') {
    el.innerHTML = content;
  } else if (content instanceof Node) {
    el.appendChild(content);
  }
  return el;
}

function renderMarkdown(text) {
  if (!text) return '';
  const escaped = escapeHtml(text);
  let html = escaped
    .replace(/^######\s*(.*)$/gm, '<h6>$1</h6>')
    .replace(/^#####\s*(.*)$/gm, '<h5>$1</h5>')
    .replace(/^####\s*(.*)$/gm, '<h4>$1</h4>')
    .replace(/^###\s*(.*)$/gm, '<h3>$1</h3>')
    .replace(/^##\s*(.*)$/gm, '<h2>$1</h2>')
    .replace(/^#\s*(.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+?)`/g, '<code>$1</code>')
    .replace(/\n{2,}/g, '</p><p>');
  html = `<p>${html}</p>`;
  html = html.replace(/<p><\/p>/g, '');
  return html;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function showMessage(text, type = 'info') {
  elements.message.hidden = false;
  elements.message.textContent = text;
  elements.message.className = `alert alert-${type}`;
}

function showChallengeError(text) {
  elements.challengeError.hidden = false;
  elements.challengeError.textContent = text;
  elements.submitButton.disabled = true;
}

function updateStatus(text) {
  elements.statusBadge.textContent = text;
}

function updateSubmitState() {
  const hasStudent = state.selectedStudent || (state.config && state.config.allow_manual_name && elements.studentInput.value.trim().length > 0);
  elements.submitButton.disabled = !hasStudent || !state.challenge || state.submissionInProgress;
}

function collectResponseFields() {
  const payload = {};
  const responseFields = elements.responseForm.querySelectorAll('[data-field-id]');
  responseFields.forEach(input => {
    const id = input.dataset.fieldId;
    const type = input.dataset.fieldType;
    const required = input.dataset.fieldRequired === 'true';
    const minLength = Number(input.dataset.fieldMinLength || 0);
    let value = null;

    if (type === 'single_choice') {
      if (input.checked) value = input.value;
    } else {
      value = input.value.trim();
    }

    if (!payload[id]) {
      payload[id] = {
        type,
        value: value || '',
        required,
        minLength,
      };
    } else {
      if (type === 'single_choice' && input.checked) {
        payload[id].value = value;
      }
    }
  });
  return payload;
}

function validateResponseFields() {
  const responseFields = elements.responseForm.querySelectorAll('[data-field-id]');
  const errors = [];

  const studentName = elements.studentInput.value.trim();
  const validStudent = state.selectedStudent || (state.config.allow_manual_name && studentName.length > 0);
  if (!validStudent) {
    errors.push('Please select a listed student or enter your name manually.');
  }

  const grouped = {};
  responseFields.forEach(input => {
    const id = input.dataset.fieldId;
    const type = input.dataset.fieldType;
    const required = input.dataset.fieldRequired === 'true';
    const minLength = Number(input.dataset.fieldMinLength || 0);

    if (!grouped[id]) grouped[id] = { type, required, minLength, value: '' };

    if (type === 'single_choice') {
      if (input.checked) grouped[id].value = input.value;
    } else {
      grouped[id].value = input.value.trim();
    }
  });

  Object.values(grouped).forEach(field => {
    if (field.required && !field.value) {
      errors.push('Please complete all required response fields.');
    }
    if (field.value && field.minLength && field.value.length < field.minLength) {
      errors.push(`A response field requires at least ${field.minLength} characters.`);
    }
  });

  return Array.from(new Set(errors));
}

async function handleSubmit(event) {
  event.preventDefault();
  if (state.submissionInProgress) return;

  const errors = validateResponseFields();
  if (errors.length > 0) {
    showMessage(errors[0], 'error');
    return;
  }

  const startTime = Date.now();
  state.submissionInProgress = true;
  elements.submitButton.disabled = true;
  elements.submitButton.textContent = 'Submitting...';
  showMessage('Submitting your response...', 'info');

  const studentName = elements.studentInput.value.trim();
  const submission = {
    challenge_id: state.challenge.challenge_id,
    challenge_version: state.challenge.version,
    student_display_name: studentName,
    student_source: state.selectedStudent ? 'listed' : 'manual',
    student_id: state.selectedStudent ? state.selectedStudent.student_id : '',
    response_json: flattenResponsePayload(),
    frontend_version: FRONTEND_VERSION,
    elapsed_seconds: Math.round((Date.now() - startTime) / 1000),
  };

  const feedbackPayload = evaluateFeedback(state.challenge, submission.response_json);
  submission.feedback_json = feedbackPayload.feedback_json;

  try {
    const result = await fetchJson('submitResponse', 'POST', submission);
    if (!result || result.success !== true) {
      throw new Error(result && result.error ? result.error : 'Unknown backend response');
    }
    renderFeedback(feedbackPayload.rendered);
    renderAfterSubmission(state.challenge.after_submission || []);
    showMessage('Submission received. See feedback below.', 'info');
  } catch (error) {
    console.error(error);
    showMessage('Submission failed: ' + error.message, 'error');
  } finally {
    state.submissionInProgress = false;
    elements.submitButton.textContent = 'Submit';
    updateSubmitState();
  }
}

function flattenResponsePayload() {
  const responseFields = elements.responseForm.querySelectorAll('[data-field-id]');
  const flattened = {};

  responseFields.forEach(input => {
    const id = input.dataset.fieldId;
    const type = input.dataset.fieldType;
    let value = '';
    if (type === 'single_choice') {
      if (input.checked) value = input.value;
    } else {
      value = input.value.trim();
    }

    if (flattened[id]) {
      if (flattened[id].type === 'single_choice' && value) {
        flattened[id].value = value;
      }
    } else {
      flattened[id] = { type, value };
    }
  });

  return flattened;
}

function evaluateFeedback(challenge, responseJson) {
  const feedback = challenge.feedback || {};
  const rendered = [];
  const feedbackJson = { mode: feedback.mode || 'static', details: [] };

  if (feedback.mode === 'answer-key' || feedback.mode === 'hybrid') {
    const config = feedback.choice_feedback || feedback.answer_key || feedback;
    const choiceFieldId = config.field_id;
    const selected = responseJson[choiceFieldId] ? responseJson[choiceFieldId].value : null;
    const correct = Array.isArray(config.correct_options)
      ? config.correct_options.includes(selected)
      : selected === config.correct_option;

    const message = correct ? config.messages?.correct : config.messages?.incorrect;
    const text = message || (correct ? 'Correct.' : 'Incorrect.');
    rendered.push(text);
    feedbackJson.details.push({ type: 'answer-key', field: choiceFieldId, selected, correct, message: text });
  }

  if (feedback.mode === 'rule-based' || feedback.mode === 'hybrid') {
    const rules = feedback.explanation_rules || feedback.rules || [];
    let ruleMatched = false;
    const explanationValues = Object.values(responseJson)
      .filter(field => field.type === 'open_text')
      .map(field => field.value.toLowerCase())
      .join(' ');

    rules.forEach(rule => {
      if (rule.condition && rule.condition.type === 'contains_any' && Array.isArray(rule.condition.terms)) {
        const found = rule.condition.terms.some(term => explanationValues.includes(term.toLowerCase()));
        if (found) {
          rendered.push(rule.message);
          feedbackJson.details.push({ type: 'rule', id: rule.id, matched: true, message: rule.message });
          ruleMatched = true;
        }
      }
    });

    if (!ruleMatched && feedback.default_message) {
      rendered.push(feedback.default_message);
      feedbackJson.details.push({ type: 'rule', matched: false, message: feedback.default_message });
    }
  }

  if (feedback.mode === 'static' || rendered.length === 0) {
    const message = feedback.message || feedback.static_message || 'Thank you for your submission.';
    rendered.push(message);
    feedbackJson.details.push({ type: 'static', message });
  }

  return { rendered, feedback_json: feedbackJson };
}

function renderFeedback(messages) {
  elements.feedbackSection.hidden = false;
  elements.feedbackContent.innerHTML = '';
  const list = createElement('ul', { className: 'feedback-list' });
  messages.forEach(message => {
    list.appendChild(createElement('li', {}, message));
  });
  elements.feedbackContent.appendChild(list);
}

function renderAfterSubmission(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    elements.afterSubmissionSection.hidden = true;
    return;
  }

  elements.afterSubmissionSection.hidden = false;
  elements.afterSubmissionContent.innerHTML = '';
  blocks.forEach(block => {
    const node = renderBlock(block);
    if (node) elements.afterSubmissionContent.appendChild(node);
  });
}
