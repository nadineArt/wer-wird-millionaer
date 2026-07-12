import { getAllGames } from '../../services/gameService.js';
import {
  createSession, getOpenSession, startGame, revealAnswer,
  nextQuestion, finishSession, watchSession, watchPlayers,
} from '../../services/sessionService.js';
import { SESSION_STATUS, QUESTION_STATE, PLAYER_STATUS, ANSWERS } from '../../utils/constants.js';
import { getStageName } from '../../utils/stageDefaults.js';
import { getAvatarSrc } from '../../utils/avatarData.js';
import { showToast } from '../../utils/toast.js';

export async function mountGameControlView(container) {
  const games = await getAllGames();
  const openSession = await getOpenSession();

  if (openSession) {
    mountLiveControl(container, openSession);
  } else {
    mountSessionStarter(container, games);
  }
}

function mountSessionStarter(container, games) {
  const activeGames = games.filter(g => g.active);

  container.innerHTML = `
    <div>
      <div class="admin-page-header">
        <h2 class="admin-page-title">Neue Session starten</h2>
      </div>
      ${activeGames.length === 0
        ? `<div class="admin-card" style="text-align:center;color:var(--color-text-muted);padding:2rem;">
             Kein aktives Spiel vorhanden. Erst ein Spiel aktivieren.
           </div>`
        : `<div class="admin-card">
             <div class="form-group">
               <label class="form-label">Spiel auswählen</label>
               <select class="form-select" id="game-select">
                 ${activeGames.map(g => `<option value="${g.id}">${g.title}</option>`).join('')}
               </select>
             </div>
             <button class="btn btn--primary" id="start-session-btn" style="margin-top:1rem;">
               🚀 Session eröffnen &amp; QR-Code generieren
             </button>
           </div>`
      }
    </div>
  `;

  container.querySelector('#start-session-btn')?.addEventListener('click', async () => {
    const gameId = container.querySelector('#game-select').value;
    const btn = container.querySelector('#start-session-btn');
    btn.disabled = true;
    btn.textContent = '…';

    try {
      const baseUrl = window.location.origin + window.location.pathname.replace('admin.html', 'index.html').replace(/\/[^/]*$/, '/');
      const { id: sessionId, joinUrl } = await createSession(gameId, 'admin', baseUrl);
      showToast('Session eröffnet! QR-Code bereit.', 'success');
      const session = await getOpenSession();
      mountLiveControl(container, session);
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = '🚀 Session eröffnen & QR-Code generieren';
    }
  });
}

function mountLiveControl(container, initialSession) {
  let session = initialSession;
  let players = [];
  const unsubs = [];

  function render() {
    if (!session) return;

    const isWaiting = session.status === SESSION_STATUS.WAITING;
    const isActive = session.status === SESSION_STATUS.ACTIVE;
    const isFinished = session.status === SESSION_STATUS.FINISHED;
    const qIndex = session.currentQuestionIndex;
    const question = session.questionsSnapshot?.[qIndex];
    const stageLabels = session.stageLabels || [];

    const activePlayers = players.filter(p => p.status === PLAYER_STATUS.ACTIVE);
    const answeredPlayers = question
      ? activePlayers.filter(p => p.answers?.[session.currentQuestionId]?.submitted)
      : [];
    const waitingPlayers = question
      ? activePlayers.filter(p => !p.answers?.[session.currentQuestionId]?.submitted)
      : activePlayers;

    container.innerHTML = `
      <div class="game-control">
        <div class="game-control__main">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
            <div>
              <h2 class="admin-page-title">${session.gameTitle}</h2>
              <div style="font-size:0.8rem;color:var(--color-text-muted);">
                ${isWaiting ? 'Wartezimmer offen' : isActive ? `Frage ${qIndex + 1} / ${session.questionsSnapshot?.length ?? 15}` : 'Spiel beendet'}
              </div>
            </div>
            <div class="control-actions">
              ${isWaiting
                ? `<button class="btn btn--success" id="start-game-btn" ${players.length === 0 ? 'disabled' : ''}>
                     ▶ Spiel starten (${players.length} Spieler)
                   </button>`
                : ''}
              ${isActive && session.currentQuestionState === QUESTION_STATE.WAITING
                ? `<button class="btn btn--primary" id="reveal-btn">🔓 Auflösen</button>`
                : ''}
              ${isActive && session.currentQuestionState === QUESTION_STATE.REVEALED && !isFinished
                ? `<button class="btn btn--primary" id="next-btn">Nächste Frage →</button>`
                : ''}
              ${!isFinished
                ? `<button class="btn btn--danger" id="finish-btn">⏹ Beenden</button>`
                : `<button class="btn btn--secondary" id="new-session-btn">Neue Session</button>`}
            </div>
          </div>

          ${isActive && question ? `
            <div class="control-question-card">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
                <span class="badge badge--accent">Stufe ${qIndex + 1} — ${getStageName(qIndex + 1, stageLabels)}</span>
                <span style="font-size:0.8rem;color:var(--color-text-muted);">
                  ${answeredPlayers.length}/${activePlayers.length} haben geantwortet
                </span>
              </div>
              <div class="control-question-text">${question.text}</div>
              <div class="control-answers">
                ${ANSWERS.map(l => `
                  <div class="control-answer ${session.currentQuestionState === QUESTION_STATE.REVEALED && l === question.correctAnswer ? 'control-answer--correct' : ''}">
                    <strong>${l}:</strong> ${question.options[l]}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div class="admin-card" style="padding:1rem;">
            <div style="font-size:0.8rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.75rem;">
              Spieler (${players.length})
            </div>
            <div class="player-answer-list" id="player-list">
              ${players.map(p => {
                const submitted = question ? p.answers?.[session.currentQuestionId]?.submitted : null;
                const isElim = p.status === PLAYER_STATUS.ELIMINATED;
                return `
                  <div class="player-answer-row ${submitted ? 'player-answer-row--submitted' : 'player-answer-row--waiting'}">
                    <div class="player-answer-row__name">
                      <img src="${getAvatarSrc(p.avatar)}" class="avatar avatar--sm" alt="${p.name}" />
                      <span>${p.name}</span>
                      ${isElim ? '<span class="badge badge--danger">Out</span>' : ''}
                    </div>
                    <div class="player-answer-row__status">
                      ${isElim ? '—'
                        : submitted
                          ? (session.currentQuestionState === QUESTION_STATE.REVEALED
                            ? submitted
                            : '✓')
                          : '⏳ wartet'}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="game-control__sidebar">
          <div class="qr-box">
            <canvas id="qr-canvas" class="qr-box__canvas" width="180" height="180"></canvas>
            <div class="qr-box__label">Einladungs-QR</div>
            <div class="qr-box__url">${session.joinUrl || ''}</div>
          </div>

          <div class="admin-card">
            <div style="font-size:0.75rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.75rem;">
              Gewinnleiter
            </div>
            <div class="progress-ladder" id="ladder">
              ${stageLabels.slice().reverse().map(s => `
                <div class="ladder-step ${s.level === qIndex + 1 ? 'ladder-step--active' : ''} ${s.isSafe ? 'ladder-step--safe' : ''}">
                  <span class="ladder-step__num">${s.level}</span>
                  <span>${s.label}</span>
                  ${s.isSafe ? '<span style="font-size:0.65rem;opacity:0.7;">✓</span>' : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    attachHandlers();
    renderQR(session.joinUrl);
  }

  function attachHandlers() {
    container.querySelector('#start-game-btn')?.addEventListener('click', async () => {
      try {
        await startGame(session.id);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    container.querySelector('#reveal-btn')?.addEventListener('click', async () => {
      try {
        await revealAnswer(session.id);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    container.querySelector('#next-btn')?.addEventListener('click', async () => {
      try {
        await nextQuestion(session.id);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    container.querySelector('#finish-btn')?.addEventListener('click', async () => {
      if (!confirm('Spiel wirklich beenden?')) return;
      await finishSession(session.id);
      unsubs.forEach(u => u());
      showToast('Session beendet.', 'default');
    });

    container.querySelector('#new-session-btn')?.addEventListener('click', async () => {
      unsubs.forEach(u => u());
      const games = await getAllGames();
      mountSessionStarter(container, games);
    });
  }

  async function renderQR(url) {
    if (!url) return;
    try {
      const QRCode = (await import('qrcode')).default;
      const canvas = container.querySelector('#qr-canvas');
      if (canvas) {
        await QRCode.toCanvas(canvas, url, {
          width: 180,
          color: { dark: '#000000', light: '#ffffff' },
        });
      }
    } catch {}
  }

  unsubs.push(watchSession(initialSession.id, (s) => {
    session = s;
    render();
  }));

  unsubs.push(watchPlayers(initialSession.id, (ps) => {
    players = ps;
    render();
  }));

  render();
}
