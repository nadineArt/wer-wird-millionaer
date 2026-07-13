import { loadUiTexts, saveUiTexts, TEXT_DEFAULTS } from '../../services/textService.js';
import { getFullAppConfig, updateAppConfig } from '../../auth/adminAuth.js';
import { showToast } from '../../utils/toast.js';

const APP_CONFIG_DEFAULTS = {
  appTitle:  'Das ultimative Quiz zum Maximilianismus',
  themeWord: 'Maximilianismus',
};

// Combined defaults for dirty-check and isLong calculation
const ALL_DEFAULTS = { ...APP_CONFIG_DEFAULTS, ...TEXT_DEFAULTS };

const GROUPS = [
  {
    title: 'App-Titel & Thema-Wort',
    hint: 'Beamer-Wartescreen, Spieler-Logo und alle Texte mit {themeWord}. Der Beamer aktualisiert sich sofort nach dem Speichern.',
    isAppConfig: true,
    fields: [
      { key: 'appTitle',  label: 'App-Titel (Beamer-Wartescreen & Spieler-Logo)' },
      { key: 'themeWord', label: 'Thema-Wort (ersetzt {themeWord} in allen Fließtexten)' },
    ],
  },
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
    hint: '{themeWord} wird live durch das Thema-Wort oben ersetzt.',
    fields: [
      { key: 'winnerSubtitle',    label: 'Untertitel' },
      { key: 'winnerCertificate', label: 'Zertifizierungstext' },
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

  const [uiTexts, appConfig] = await Promise.all([loadUiTexts(), getFullAppConfig()]);
  const currentAll = { ...appConfig, ...uiTexts };

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

  // Pass 1: build DOM + populate inputs dict
  GROUPS.forEach(group => {
    const card = document.createElement('div');
    card.className = 'admin-card';
    card.style.marginBottom = 'var(--space-4)';
    card.innerHTML = `
      <div style="font-size:0.85rem;font-weight:700;margin-bottom:${group.hint ? 'var(--space-1)' : 'var(--space-4)'};color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.06em;">
        ${group.title}
      </div>
      ${group.hint ? `<p style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:var(--space-4);">${escHtml(group.hint)}</p>` : ''}
      <div class="text-editor-fields"></div>
    `;

    const fieldsEl = card.querySelector('.text-editor-fields');

    group.fields.forEach(field => {
      const defaultVal = currentAll[field.key] ?? ALL_DEFAULTS[field.key] ?? '';
      const isLong = (ALL_DEFAULTS[field.key] || '').length > 60;

      const row = document.createElement('div');
      row.className = 'text-editor-row';
      if (defaultVal !== ALL_DEFAULTS[field.key]) row.classList.add('text-editor-row--dirty');

      row.innerHTML = `
        <div class="text-editor-row__label">
          <span>${escHtml(field.label)}</span>
          <span class="text-editor-default" data-reset-key="${field.key}"
                title="Standard: ${escHtml(ALL_DEFAULTS[field.key] || '')}">Standard</span>
        </div>
        ${isLong
          ? `<textarea class="input-field text-editor-input" data-key="${field.key}" rows="3" style="resize:vertical;"></textarea>`
          : `<input class="input-field text-editor-input" type="text" data-key="${field.key}" value="${escHtml(defaultVal)}" />`
        }
        <div class="text-editor-row__preview" id="preview-${field.key}"></div>
      `;

      const inputEl = row.querySelector(`input[data-key], textarea[data-key]`);
      if (isLong) inputEl.value = defaultVal;
      inputs[field.key] = inputEl;

      fieldsEl.appendChild(row);
    });

    groupsEl.appendChild(card);
  });

  // Pass 2: event listeners + initial previews (all inputs now exist)
  GROUPS.forEach(group => {
    group.fields.forEach(field => {
      const inputEl = inputs[field.key];
      const row = inputEl.closest('.text-editor-row');

      inputEl.addEventListener('input', () => {
        row.classList.toggle('text-editor-row--dirty', inputEl.value !== ALL_DEFAULTS[field.key]);
        updatePreview(field.key, inputEl.value);
        // When themeWord changes, re-render winner previews live
        if (field.key === 'themeWord') {
          ['winnerSubtitle', 'winnerCertificate'].forEach(k => {
            if (inputs[k]) updatePreview(k, inputs[k].value);
          });
        }
      });

      row.querySelector('[data-reset-key]').addEventListener('click', () => {
        inputEl.value = ALL_DEFAULTS[field.key] ?? '';
        row.classList.remove('text-editor-row--dirty');
        updatePreview(field.key, inputEl.value);
        if (field.key === 'themeWord') {
          ['winnerSubtitle', 'winnerCertificate'].forEach(k => {
            if (inputs[k]) updatePreview(k, inputs[k].value);
          });
        }
      });

      updatePreview(field.key, inputEl.value);
    });
  });

  function updatePreview(key, value) {
    const previewEl = container.querySelector(`#preview-${key}`);
    if (!previewEl) return;
    if (value === ALL_DEFAULTS[key]) {
      previewEl.innerHTML = '';
      return;
    }
    // Substitute {themeWord} with the live themeWord input value
    const liveTheme = inputs.themeWord?.value || APP_CONFIG_DEFAULTS.themeWord;
    const rendered = value.replaceAll('{themeWord}', liveTheme);
    previewEl.innerHTML = `<span class="text-editor-preview-label">Vorschau:</span> <span class="text-editor-preview-text">${escHtml(rendered)}</span>`;
  }

  container.querySelector('#save-all-btn').addEventListener('click', async () => {
    const appConfigUpdates = {};
    const uiTextUpdates = {};
    for (const [key, el] of Object.entries(inputs)) {
      const val = el.value.trim() || ALL_DEFAULTS[key] || '';
      if (key in APP_CONFIG_DEFAULTS) {
        appConfigUpdates[key] = val;
      } else {
        uiTextUpdates[key] = val;
      }
    }
    try {
      await Promise.all([
        Object.keys(appConfigUpdates).length ? updateAppConfig(appConfigUpdates) : Promise.resolve(),
        Object.keys(uiTextUpdates).length    ? saveUiTexts(uiTextUpdates)        : Promise.resolve(),
      ]);
      showToast('Texte gespeichert!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  container.querySelector('#reset-all-btn').addEventListener('click', async () => {
    if (!confirm('Alle Texte auf die Standardwerte zurücksetzen?')) return;
    try {
      await Promise.all([
        updateAppConfig({ ...APP_CONFIG_DEFAULTS }),
        saveUiTexts({ ...TEXT_DEFAULTS }),
      ]);
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
