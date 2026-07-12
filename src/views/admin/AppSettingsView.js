import { updatePasswords } from '../../auth/adminAuth.js';
import { showToast } from '../../utils/toast.js';

export function mountAppSettingsView(container) {
  container.innerHTML = `
    <div>
      <div class="admin-page-header">
        <h2 class="admin-page-title">Einstellungen</h2>
      </div>
      <div class="admin-card" style="max-width:480px;">
        <div style="font-size:0.85rem;font-weight:700;margin-bottom:1rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.06em;">
          Passwörter ändern
        </div>
        <div class="form-group">
          <label class="form-label">Spieler-Passwort (aktuell: "WWM")</label>
          <input class="input-field" type="text" id="new-player-pw" placeholder="Neues Spieler-Passwort" autocomplete="off" />
        </div>
        <div class="form-group">
          <label class="form-label">Admin-Passwort (aktuell: "admin")</label>
          <input class="input-field" type="text" id="new-admin-pw" placeholder="Neues Admin-Passwort" autocomplete="off" />
        </div>
        <button class="btn btn--primary" id="save-pw-btn" style="margin-top:0.5rem;">Speichern</button>
        <p style="font-size:0.75rem;color:var(--color-text-muted);margin-top:1rem;line-height:1.5;">
          ⚠️ Nach dem Ändern musst du dich neu einloggen. Teile das neue Spielerpasswort mit deinen Gästen.
        </p>
      </div>
    </div>
  `;

  container.querySelector('#save-pw-btn').addEventListener('click', async () => {
    const playerPw = container.querySelector('#new-player-pw').value.trim();
    const adminPw = container.querySelector('#new-admin-pw').value.trim();

    if (!playerPw && !adminPw) {
      showToast('Mindestens ein Passwort eingeben.', 'error');
      return;
    }

    try {
      await updatePasswords({ playerPassword: playerPw || null, adminPassword: adminPw || null });
      showToast('Passwörter gespeichert!', 'success');
      container.querySelector('#new-player-pw').value = '';
      container.querySelector('#new-admin-pw').value = '';
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
