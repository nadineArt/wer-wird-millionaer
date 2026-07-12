import { AVATARS } from '../../utils/avatarData.js';
import { registerPlayer } from '../../services/playerService.js';
import { getOpenSession } from '../../services/sessionService.js';
import { showToast } from '../../utils/toast.js';
import { navigate } from '../../router/playerRouter.js';

export async function mountRegisterView(container) {
  let session = null;
  try {
    session = await getOpenSession();
  } catch (err) {
    console.error('getOpenSession error:', err);
  }

  if (!session) {
    container.innerHTML = `
      <div class="access-screen anim-fade-in">
        <div style="font-size:3rem;">🎂</div>
        <div class="access-screen__logo" style="font-size:1.6rem;">Noch keine Runde offen</div>
        <p class="access-screen__subtitle">Der Spielmaster eröffnet gleich die Runde. Bleib cool.</p>
        <button class="submit-btn" style="max-width:280px;" onclick="location.reload()">Nochmal prüfen</button>
      </div>
    `;
    return;
  }

  let selectedAvatar = null;

  container.innerHTML = `
    <div class="register-screen anim-fade-slide-up" style="width:100%;max-width:480px;margin:0 auto;padding:1.5rem 1rem 2rem;">
      <div style="text-align:center;margin-bottom:1.5rem;">
        <div class="register-screen__title">Wähle deinen Look</div>
        <p class="register-screen__sub">Wer bist du heute Abend?</p>
      </div>

      <div class="avatar-picker" id="avatar-grid"></div>

      <div style="margin-top:1.5rem;display:flex;flex-direction:column;gap:0.75rem;">
        <input
          class="input-field"
          type="text"
          id="name-input"
          placeholder="Dein Name (wie du genannt werden willst)"
          maxlength="30"
          autocomplete="off"
        />
        <button class="submit-btn" id="join-btn" disabled>
          Ich bin dabei 🎉
        </button>
      </div>
    </div>
  `;

  const grid = container.querySelector('#avatar-grid');
  const nameInput = container.querySelector('#name-input');
  const joinBtn = container.querySelector('#join-btn');

  AVATARS.forEach(avatar => {
    const el = document.createElement('div');
    el.className = 'avatar-option anim-avatar-in';
    el.dataset.id = avatar.id;
    el.innerHTML = `
      <img src="assets/avatars/${avatar.file}" alt="${avatar.name}" loading="lazy"
           onerror="this.style.background='#f5a623';this.alt='${avatar.name[0]}'" />
      <span class="avatar-option__name">${avatar.name}</span>
    `;
    el.addEventListener('click', () => {
      grid.querySelectorAll('.avatar-option').forEach(a => a.classList.remove('avatar-option--selected'));
      el.classList.add('avatar-option--selected');
      selectedAvatar = avatar.id;
      updateBtn();
    });
    grid.appendChild(el);
  });

  nameInput.addEventListener('input', updateBtn);

  function updateBtn() {
    joinBtn.disabled = !selectedAvatar || !nameInput.value.trim();
  }

  joinBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    if (!name || !selectedAvatar) return;

    joinBtn.disabled = true;
    joinBtn.textContent = '…';

    try {
      const currentSession = await getOpenSession();
      if (!currentSession) {
        showToast('Keine offene Session gefunden. Nochmal laden?', 'error');
        return;
      }
      await registerPlayer(currentSession.id, { name, avatar: selectedAvatar });
      navigate('lobby');
    } catch (err) {
      showToast(err.message, 'error');
      nameInput.classList.add('input-field--error');
      setTimeout(() => nameInput.classList.remove('input-field--error'), 2000);
    } finally {
      joinBtn.disabled = false;
      joinBtn.textContent = 'Ich bin dabei 🎉';
    }
  });
}
