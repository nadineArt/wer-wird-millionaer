import { loadUiTexts, saveUiTexts, TEXT_DEFAULTS } from '../../services/textService.js';
import { showToast } from '../../utils/toast.js';

const GROUPS = [
  {
    title: 'Passwort-Screen',
    fields: [
      { key: 'accessSubtitle', label: 'Untertitel' },
      { key: 'accessButton',   label: 'Login-Button' },
    ],
  },
  {
    title: 'Registrierung',
    fields: [
      { key: 'registerTitle',    label: 'Überschrift' },
      { key: 'registerSubtitle', label: 'Untertitel' },
      { key: 'registerButton',   label: 'Beitreten-Button' },
    ],
  },
  {
    title: 'Ausgeschieden-Screen',
    fields: [
      { key: 'eliminatedTitle',       label: 'Überschrift' },
      { key: 'eliminatedBody',        label: 'Fließtext' },
      { key: 'eliminatedWatchButton', label: 'Zuschauen-Button' },
    ],
  },
  {
    title: 'Gewinner-Screen',
    hint: '{themeWord} wird durch das konfigurierte Thema-Wort ersetzt.',
    fields: [
      { key: 'winnerSubtitle',     label: 'Untertitel' },
      { key: 'winnerCertificate',  label: 'Zertifizierungstext' },
    ],
  },
  {
    title: '50:50 Joker',
    fields: [
      { key: 'jokerFiftyTitle',   label: 'Titel' },
      { key: 'jokerFiftyBody',    label: 'Beschreibung' },
      { key: 'jokerFiftyConfirm', label: 'Bestätigen-Button' },
    ],
  },
  {
    title: 'Telefonjoker',
    fields: [
      { key: 'jokerPhoneTitle',   label: 'Titel' },
      { key: 'jokerPhoneBody',    label: 'Beschreibung' },
      { key: 'jokerPhoneConfirm', label: 'Bestätigen-Button' },
    ],
  },
  {
    title: 'Publikumsjoker',
    fields: [
      { key: 'jokerAudienceTitle',   label: 'Titel' },
      { key: 'jokerAudienceBody',    label: 'Beschreibung' },
      { key: 'jokerAudienceConfirm', label: 'Bestätigen-Button' },
    ],
  },
];

export async function mountTextEditorView(container) {
  container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;padding:3rem;"><div class="spinner"></div></div>`;

  const current = await loadUiTexts();

  container.innerHTML = `
    <div style="max-width:680px;">
      <div class="admin-view-header" style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:var(--space-5);">
        <div>
          <h2 class="admin-view-title">Texte bearbeiten</h2>
          <p class="admin-view-subtitle">Alle Änderungen wirken sich nach dem nächsten Laden der Spieler-Seite aus.</p>
        </div>
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
          <button class="btn btn--secondary" id="reset-all-btn">Alle zurücksetzen</button>
          <button class="btn btn--primary" id="save-all-btn">Alle speichern</button>
        </div>
      </div>

      <div id="text-editor-groups"></div>
    </div>
  `;

  const groupsEl = container.querySelector('#text-editor-groups');
  const inputs = {};

  GROUPS.forEach(group => {
    const card = document.createElement('div');
    card.className = 'admin-card';
    card.style.marginBottom = 'var(--space-4)';
    card.innerHTML = `
      <div style="font-size:0.85rem;font-weight:700;margin-bottom:${group.hint ? 'var(--space-1)' : 'var(--space-4)'};color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.06em;">
        ${group.title}
      </div>
      ${group.hint ? `<p style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:var(--space-4);">${group.hint}</p>` : ''}
      <div class="text-editor-fields" data-group="${group.title}"></div>
    `;

    const fieldsEl = card.querySelector('.text-editor-fields');

    group.fields.forEach(field => {
      const isLong = TEXT_DEFAULTS[field.key].length > 60;
      const defaultVal = current[field.key] ?? TEXT_DEFAULTS[field.key];
      const isDirty = defaultVal !== TEXT_DEFAULTS[field.key];

      const row = document.createElement('div');
      row.className = 'text-editor-row';
      row.innerHTML = `
        <div class="text-editor-row__label">
          <span>${field.label}</span>
          <span class="text-editor-default" data-reset-key="${field.key}" title="Standard: ${escHtml(TEXT_DEFAULTS[field.key])}">Standard</span>
        </div>
        ${isLong
          ? `<textarea class="input-field text-editor-input" data-key="${field.key}" rows="3" style="resize:vertical;"></textarea>`
          : `<input class="input-field text-editor-input" type="text" data-key="${field.key}" value="${escHtml(defaultVal)}" />`
        }
        <div class="text-editor-row__preview" id="preview-${field.key}"></div>
      `;

      const inputEl = row.querySelector(`input[data-key="${field.key}"], textarea[data-key="${field.key}"]`);
      if (isLong) inputEl.value = defaultVal;
      inputs[field.key] = inputEl;

      if (isDirty) row.classList.add('text-editor-row--dirty');

      inputEl.addEventListener('input', () => {
        const isDirtyNow = inputEl.value !== TEXT_DEFAULTS[field.key];
        row.classList.toggle('text-editor-row--dirty', isDirtyNow);
        updatePreview(field.key, inputEl.value);
      });

      row.querySelector('[data-reset-key]').addEventListener('click', () => {
        inputEl.value = TEXT_DEFAULTS[field.key];
        row.classList.remove('text-editor-row--dirty');
        updatePreview(field.key, TEXT_DEFAULTS[field.key]);
      });

      updatePreview(field.key, defaultVal, row.querySelector(`#preview-${field.key}`));
      fieldsEl.appendChild(row);
    });

    groupsEl.appendChild(card);
  });

  function updatePreview(key, value, el) {
    const previewEl = el || container.querySelector(`#preview-${key}`);
    if (!previewEl) return;
    if (value === TEXT_DEFAULTS[key]) {
      previewEl.innerHTML = '';
      return;
    }
    previewEl.innerHTML = `<span class="text-editor-preview-label">Vorschau:</span> <span class="text-editor-preview-text">${escHtml(value)}</span>`;
  }

  container.querySelector('#save-all-btn').addEventListener('click', async () => {
    const updates = {};
    for (const [key, el] of Object.entries(inputs)) {
      updates[key] = el.value.trim() || TEXT_DEFAULTS[key];
    }
    try {
      await saveUiTexts(updates);
      showToast('Texte gespeichert!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  container.querySelector('#reset-all-btn').addEventListener('click', async () => {
    if (!confirm('Alle Texte auf die Standardwerte zurücksetzen?')) return;
    try {
      await saveUiTexts({ ...TEXT_DEFAULTS });
      showToast('Alle Texte zurückgesetzt.', 'default');
      mountTextEditorView(container);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
