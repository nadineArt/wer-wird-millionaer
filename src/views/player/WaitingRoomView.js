import { watchSession, watchPlayers } from '../../services/sessionService.js';
import { getStoredPlayerId, getStoredSessionId } from '../../services/playerService.js';
import { navigate } from '../../router/playerRouter.js';
import { SESSION_STATUS } from '../../utils/constants.js';
import { getAvatarSrc } from '../../utils/avatarData.js';

export function mountWaitingRoomView(container) {
  const sessionId = getStoredSessionId();
  const myPlayerId = getStoredPlayerId();

  if (!sessionId || !myPlayerId) {
    navigate('register');
    return;
  }

  container.innerHTML = `
    <div class="lobby-screen anim-fade-in">
      <div class="lobby-screen__header">
        <div class="lobby-screen__title">Wartezimmer 🎭</div>
        <div class="lobby-screen__game-name" id="game-name">Lade…</div>
      </div>

      <div class="lobby-screen__status pulse-glow" id="status-msg">
        <span>⏳</span>
        <span>Warte auf den Spielmaster…</span>
      </div>

      <div>
        <div style="font-size:0.75rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.75rem;">
          Dabei sind schon
        </div>
        <div class="lobby-screen__players" id="player-list"></div>
      </div>

      <div class="lobby-screen__my-card anim-scale-in" id="my-card" style="display:none;">
        <img id="my-avatar" class="avatar avatar--lg" src="" alt="" />
        <div class="lobby-screen__my-name" id="my-name"></div>
        <div class="badge badge--accent">Das bist du</div>
      </div>
    </div>
  `;

  const unsubs = [];

  unsubs.push(watchSession(sessionId, (session) => {
    container.querySelector('#game-name').textContent = session.gameTitle || '';

    if (session.status === SESSION_STATUS.ACTIVE) {
      unsubs.forEach(u => u());
      navigate('game');
    }
  }));

  unsubs.push(watchPlayers(sessionId, (players) => {
    const list = container.querySelector('#player-list');
    if (!list) return;

    list.innerHTML = '';
    const me = players.find(p => p.id === myPlayerId);

    if (me) {
      const myCard = container.querySelector('#my-card');
      const myAvatar = container.querySelector('#my-avatar');
      const myName = container.querySelector('#my-name');
      myCard.style.display = 'flex';
      myAvatar.src = getAvatarSrc(me.avatar);
      myAvatar.alt = me.name;
      myName.textContent = me.name;
    }

    players
      .filter(p => p.id !== myPlayerId)
      .forEach(p => {
        const chip = document.createElement('div');
        chip.className = 'player-chip anim-avatar-in';
        chip.innerHTML = `
          <img src="${getAvatarSrc(p.avatar)}" alt="${p.name}" class="avatar avatar--sm" />
          <span>${p.name}</span>
        `;
        list.appendChild(chip);
      });

    const count = players.length;
    const statusMsg = container.querySelector('#status-msg');
    if (statusMsg) {
      statusMsg.innerHTML = `<span>⏳</span><span>${count} ${count === 1 ? 'Person' : 'Personen'} bereit — warte auf den Spielmaster</span>`;
    }
  }));
}
