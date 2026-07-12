import { loginPlayer, isPlayerAccessGranted } from '../../auth/adminAuth.js';
import { showToast } from '../../utils/toast.js';
import { navigate } from '../../router/playerRouter.js';
import { getOpenSession } from '../../services/sessionService.js';
import { getStoredPlayerId, getStoredSessionId, getPlayer, clearPlayerIds } from '../../services/playerService.js';
import { PLAYER_STATUS, SESSION_STATUS } from '../../utils/constants.js';

export async function mountAccessView(container) {
  if (isPlayerAccessGranted()) {
    await tryReconnect();
    return;
  }

  container.innerHTML = `
    <div class="access-screen anim-fade-in">
      <div>
        <div class="access-screen__logo">Das ultimative Quiz<br/>zum Maximilianismus</div>
        <p class="access-screen__subtitle" style="margin-top:0.75rem;">Das Geburtstagsquiz für echte Freunde.</p>
      </div>
      <form class="access-screen__form" id="access-form">
        <input
          class="input-field"
          type="password"
          id="pw-input"
          placeholder="Passwort eingeben"
          autocomplete="current-password"
          autofocus
        />
        <button type="submit" class="submit-btn">Rein da ✨</button>
      </form>
    </div>
  `;

  container.querySelector('#access-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = container.querySelector('#pw-input').value;
    const btn = container.querySelector('.submit-btn');
    btn.disabled = true;
    btn.textContent = '…';

    try {
      const ok = await loginPlayer(pw);
      if (ok) {
        await tryReconnect();
      } else {
        showToast('Falsches Passwort. Versuch nochmal.', 'error');
        container.querySelector('#pw-input').classList.add('input-field--error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Rein da ✨';
    }
  });
}

async function tryReconnect() {
  const playerId = getStoredPlayerId();
  const sessionId = getStoredSessionId();

  if (playerId && sessionId) {
    try {
      const { getDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../../firebase/config.js');
      const { COLLECTIONS } = await import('../../utils/constants.js');

      const sessionSnap = await getDoc(doc(db, COLLECTIONS.SESSIONS, sessionId));
      if (sessionSnap.exists()) {
        const session = sessionSnap.data();
        if (session.status !== SESSION_STATUS.FINISHED) {
          const player = await getPlayer(sessionId, playerId);
          if (player) {
            if (player.status === PLAYER_STATUS.WINNER) {
              navigate('winner');
            } else if (player.status === PLAYER_STATUS.ELIMINATED) {
              navigate('out');
            } else if (session.status === SESSION_STATUS.ACTIVE) {
              navigate('game');
            } else {
              navigate('lobby');
            }
            return;
          }
        }
      }
    } catch {
      // Reconnect fehlgeschlagen
    }
    clearPlayerIds();
  }

  navigate('register');
}
