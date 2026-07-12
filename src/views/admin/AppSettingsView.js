import { updatePasswords, getFullAppConfig, updateAppConfig } from '../../auth/adminAuth.js';
import { showToast } from '../../utils/toast.js';

export async function mountAppSettingsView(container) {
  const { appTitle: currentTitle, themeWord: currentTheme } = await getFullAppConfig();

  container.innerHTML = `
    <div style="max-width:520px;">
      <div class="admin-page-header">
        <h2 class="admin-page-title">Einstellungen</h2>
      </div>

      <div class="admin-card" style="margin-bottom:var(--space-4);">
        <div style="font-size:0.85rem;font-weight:700;margin-bottom:1rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.06em;">
          App-Texte
        </div>
        <div class="form-group">
          <label class="form-label">App-Titel <span style="font-weight:400;text-transform:none;letter-spacing:0;">(Beamer-Wartescreen &amp; Spieler-Logo)</span></label>
          <input class="input-field" type="text" id="app-title" value="${escHtml(currentTitle)}" maxlength="80" autocomplete="off" />
        </div>
        <div class="form-group">
          <label class="form-label">Thema-Wort <span style="font-weight:400;text-transform:none;letter-spacing:0;">(wird in Fließtexten eingesetzt)</span></label>
          <input class="input-field" type="text" id="theme-word" value="${escHtml(currentTheme)}" maxlength="40" autocomplete="off" />
        </div>
        <button class="btn btn--primary" id="save-texts-btn">Speichern</button>
        <p style="font-size:0.75rem;color:var(--color-text-muted);margin-top:1rem;line-height:1.5;">
          Beamer aktualisiert sich sofort. Spieler- und Gewinner-Screen beim nächsten Laden.
        </p>
      </div>

      <div class="admin-card settings-preview" id="preview-card" style="margin-bottom:var(--space-4);">
        <div style="font-size:0.85rem;font-weight:700;margin-bottom:1rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.06em;">
          Vorschau
        </div>
        <div id="preview-content"></div>
      </div>

      <div class="admin-card">
        <div style="font-size:0.85rem;font-weight:700;margin-bottom:1rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.06em;">
          Passwörter ändern
        </div>
        <div class="form-group">
          <label class="form-label">Spieler-Passwort</label>
          <input class="input-field" type="text" id="new-player-pw" placeholder="Neues Spieler-Passwort" autocomplete="off" />
        </div>
        <div class="form-group">
          <label class="form-label">Admin-Passwort</label>
          <input class="input-field" type="text" id="new-admin-pw" placeholder="Neues Admin-Passwort" autocomplete="off" />
        </div>
        <button class="btn btn--primary" id="save-pw-btn" style="margin-top:0.5rem;">Speichern</button>
        <p style="font-size:0.75rem;color:var(--color-text-muted);margin-top:1rem;line-height:1.5;">
          ⚠️ Nach dem Ändern musst du dich neu einloggen. Teile das neue Spielerpasswort mit deinen Gästen.
        </p>
      </div>
    </div>
  `;

  const titleInput = container.querySelector('#app-title');
  const themeInput = container.querySelector('#theme-word');
  const previewEl  = container.querySelector('#preview-content');

  function renderPreview() {
    const t = titleInput.value.trim() || '…';
    const w = themeInput.value.trim() || '…';
    previewEl.innerHTML = `
      <div class="settings-preview__list">
        ${row('Beamer-Wartescreen', `<span class="settings-preview__value">${escHtml(t)}</span>`)}
        ${row('Spieler-Logo', `<span class="settings-preview__value">${escHtml(t)}</span>`)}
        ${row('Gewinner-Subtitle', `Herzlichen Glückwunsch — du bist der ultimative <span class="settings-preview__value">${escHtml(w)}</span>-Experte. Das ist einmalig.`)}
        ${row('Gewinner-Zertifikat', `Du bist offiziell zertifiziert im <span class="settings-preview__value">${escHtml(w)}</span>. 🌟`)}
        ${row('Beamer-Finale', `ist echter <span class="settings-preview__value">${escHtml(w)}</span>-Experte! 🏆`)}
      </div>
    `;
  }

  function row(label, content) {
    return `
      <div class="settings-preview__row">
        <div class="settings-preview__label">${label}</div>
        <div class="settings-preview__text">${content}</div>
      </div>
    `;
  }

  titleInput.addEventListener('input', renderPreview);
  themeInput.addEventListener('input', renderPreview);
  renderPreview();

  container.querySelector('#save-texts-btn').addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const theme = themeInput.value.trim();
    if (!title || !theme) {
      showToast('Titel und Thema-Wort dürfen nicht leer sein.', 'error');
      return;
    }
    try {
      await updateAppConfig({ appTitle: title, themeWord: theme });
      showToast('Gespeichert! Beamer aktualisiert sich sofort.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  container.querySelector('#save-pw-btn').addEventListener('click', async () => {
    const playerPw = container.querySelector('#new-player-pw').value.trim();
    const adminPw  = container.querySelector('#new-admin-pw').value.trim();
    if (!playerPw && !adminPw) {
      showToast('Mindestens ein Passwort eingeben.', 'error');
      return;
    }
    try {
      await updatePasswords({ playerPassword: playerPw || null, adminPassword: adminPw || null });
      showToast('Passwörter gespeichert!', 'success');
      container.querySelector('#new-player-pw').value = '';
      container.querySelector('#new-admin-pw').value  = '';
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
