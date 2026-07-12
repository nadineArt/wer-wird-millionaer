import { AVATARS } from '../../utils/avatarData.js';
import { loadAvatarOverrides, uploadAvatarOverride, resetAvatarOverride, getCachedAvatarSrc } from '../../services/avatarService.js';
import { showToast } from '../../utils/toast.js';

export async function mountAvatarManagerView(container) {
  container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;padding:3rem;"><div class="spinner"></div></div>`;

  await loadAvatarOverrides();
  render();

  function render() {
    container.innerHTML = `
      <div class="admin-view-content">
        <div class="admin-view-header">
          <h2 class="admin-view-title">Avatare verwalten</h2>
          <p class="admin-view-subtitle">Eigene Bilder hochladen — werden für alle Geräte gespeichert (max. 512 KB pro Avatar).</p>
        </div>
        <div class="avatar-manager-grid" id="avatar-manager-grid"></div>
      </div>
    `;

    const grid = container.querySelector('#avatar-manager-grid');

    AVATARS.forEach(avatar => {
      const src = getCachedAvatarSrc(avatar.id, avatar.file);
      const hasOverride = !src.startsWith('assets/');

      const card = document.createElement('div');
      card.className = 'avatar-manager-card';
      card.innerHTML = `
        <div class="avatar-manager-card__preview">
          <img id="img-${avatar.id}" src="${src}" alt="${avatar.name}" />
          ${hasOverride ? '<div class="avatar-manager-card__badge">Benutzerdefiniert</div>' : ''}
        </div>
        <div class="avatar-manager-card__name">${avatar.name}</div>
        <div class="avatar-manager-card__actions">
          <label class="btn btn--primary btn--sm avatar-upload-label">
            Bild tauschen
            <input type="file" accept="image/*" data-avatar-id="${avatar.id}" style="display:none;" />
          </label>
          ${hasOverride ? `<button class="btn btn--danger btn--sm" data-reset="${avatar.id}">Zurücksetzen</button>` : ''}
        </div>
      `;

      const fileInput = card.querySelector('input[type="file"]');
      fileInput.addEventListener('change', e => handleUpload(e, avatar));

      const resetBtn = card.querySelector('[data-reset]');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => handleReset(avatar));
      }

      grid.appendChild(card);
    });
  }

  async function handleUpload(e, avatar) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 512 * 1024) {
      showToast('Datei zu groß — maximal 512 KB erlaubt.', 'error');
      return;
    }

    const label = e.target.closest('label');
    label.textContent = '…';
    label.style.pointerEvents = 'none';

    try {
      await uploadAvatarOverride(avatar.id, file);
      showToast(`${avatar.name} aktualisiert ✓`, 'success');
      render();
    } catch (err) {
      showToast('Upload fehlgeschlagen: ' + err.message, 'error');
      render();
    }
  }

  async function handleReset(avatar) {
    try {
      await resetAvatarOverride(avatar.id);
      showToast(`${avatar.name} auf Original zurückgesetzt.`, 'default');
      render();
    } catch (err) {
      showToast('Fehler: ' + err.message, 'error');
    }
  }
}
