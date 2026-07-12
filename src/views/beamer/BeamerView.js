import { watchSession, watchPlayers, watchAudienceVotes } from '../../services/sessionService.js';
import { SESSION_STATUS, QUESTION_STATE, PLAYER_STATUS, ANSWERS } from '../../utils/constants.js';
import { getStageName } from '../../utils/stageDefaults.js';
import { getAvatarSrc } from '../../utils/avatarData.js';

export function mountBeamerView(container) {
  let session = null;
  let players = [];
  let audienceVotes = null;
  let audienceUnsub = null;
  const unsubs = [];

  function render() {
    if (!session) {
      container.innerHTML = `
        <div class="beamer-waiting anim-fade-in">
          <div class="beamer-waiting__title">Wer kennt ihn<br/>am besten?</div>
          <div class="beamer-waiting__sub">Warte auf den Spielmaster…</div>
          <div style="width:3rem;height:3rem;border:4px solid rgba(255,255,255,0.1);border-top-color:#f5a623;border-radius:50%;animation:spin 700ms linear infinite;margin-top:2rem;"></div>
        </div>
      `;
      return;
    }

    if (session.status === SESSION_STATUS.WAITING) {
      const activePlayers = players.filter(p => p.status !== PLAYER_STATUS.ELIMINATED);
      const qrSize = Math.min(Math.round(window.innerWidth * 0.22), 300);
      const qrUrl = session.joinUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(session.joinUrl)}&bgcolor=ffffff&color=000000&margin=2`
        : '';

      container.innerHTML = `
        <div class="beamer-waiting anim-fade-in">
          <div class="beamer-waiting__title">Wer kennt ihn<br/>am besten?</div>
          <div class="beamer-waiting__sub">${session.gameTitle}</div>

          <div style="display:flex;align-items:center;gap:4vw;margin-top:3vh;flex-wrap:wrap;justify-content:center;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:1vh;">
              <img src="${qrUrl}" width="${qrSize}" height="${qrSize}"
                style="border-radius:1rem;background:#fff;display:block;" alt="QR Code" />
              <div style="font-size:clamp(0.7rem,1.2vw,1rem);color:var(--color-text-muted);">
                Smartphone scannen &amp; mitspielen
              </div>
              <div style="font-size:clamp(0.55rem,0.9vw,0.8rem);color:var(--color-accent);word-break:break-all;max-width:32vw;text-align:center;">
                ${session.joinUrl || ''}
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:1.5vh;align-items:flex-start;">
              ${activePlayers.length > 0 ? `
                <div style="font-size:clamp(0.8rem,1.4vw,1.1rem);color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">
                  ${activePlayers.length} dabei
                </div>
                <div style="display:flex;gap:1.5vw;flex-wrap:wrap;max-width:50vw;">
                  ${activePlayers.map(p => `
                    <div class="beamer-player-chip anim-avatar-in">
                      <img src="${getAvatarSrc(p.avatar)}" alt="${p.name}" />
                      <span>${p.name}</span>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div style="font-size:clamp(1rem,2vw,1.5rem);color:var(--color-text-muted);">
                  Noch niemand da… 👀
                </div>
              `}
            </div>
          </div>
        </div>
      `;
      return;
    }

    if (session.status === SESSION_STATUS.FINISHED) {
      const winners = players.filter(p => p.status === PLAYER_STATUS.WINNER);
      container.innerHTML = `
        <div class="beamer-waiting anim-fade-in">
          <div style="font-size:clamp(3rem,8vw,8rem);">👑</div>
          <div class="beamer-waiting__title">
            ${winners.length > 0 ? winners.map(w => w.name).join(' &amp; ') : 'Spiel beendet!'}
          </div>
          <div class="beamer-waiting__sub">
            ${winners.length > 0 ? 'kennt ihn am besten.' : 'Alle ausgeschieden — knapp!'}
          </div>
        </div>
      `;
      return;
    }

    const qIndex = session.currentQuestionIndex;
    const question = session.questionsSnapshot?.[qIndex];
    const stageLabels = session.stageLabels || [];
    const revealed = session.currentQuestionState === QUESTION_STATE.REVEALED;

    const activePlayers = players.filter(p => p.status === PLAYER_STATUS.ACTIVE);
    const answeredPlayers = question
      ? activePlayers.filter(p => p.answers?.[session.currentQuestionId]?.submitted)
      : [];

    container.innerHTML = `
      <div class="beamer-screen">
        <div class="beamer-header">
          <div class="beamer-logo">${session.gameTitle}</div>
          <div class="beamer-stage">
            Stufe ${qIndex + 1} — ${getStageName(qIndex + 1, stageLabels)}
          </div>
          <div style="font-size:clamp(0.7rem,1.2vw,1rem);color:var(--color-text-muted);font-weight:600;">
            ${answeredPlayers.length}/${activePlayers.length} geantwortet
          </div>
        </div>

        <div class="beamer-main">
          ${question ? `
            <div class="beamer-question anim-fade-slide-up">${question.text}</div>
            <div class="beamer-answers">
              ${ANSWERS.map(letter => {
                let cls = 'beamer-answer';
                if (revealed) {
                  if (letter === question.correctAnswer) cls += ' beamer-answer--correct';
                  else cls += ' beamer-answer--wrong';
                }
                return `
                  <div class="${cls}">
                    <div class="beamer-answer__letter">${letter}</div>
                    <div class="beamer-answer__text">${question.options[letter]}</div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}
        </div>

        <div class="beamer-footer">
          <div class="beamer-players">
            ${players.map(p => {
              const answered = question && p.answers?.[session.currentQuestionId]?.submitted;
              const isElim = p.status === PLAYER_STATUS.ELIMINATED;
              let cls = 'beamer-player-chip';
              if (answered) cls += ' beamer-player-chip--answered';
              if (isElim) cls += ' beamer-player-chip--eliminated';
              return `
                <div class="${cls}">
                  <img src="${getAvatarSrc(p.avatar)}" alt="${p.name}" />
                  <span>${p.name}</span>
                </div>
              `;
            }).join('')}
          </div>

          <div class="beamer-ladder" id="beamer-ladder">
            ${stageLabels.slice(Math.max(0, qIndex - 2), qIndex + 3).reverse().map(s => `
              <div class="beamer-ladder-step ${s.level === qIndex + 1 ? 'beamer-ladder-step--active' : ''} ${s.isSafe ? 'beamer-ladder-step--safe' : ''}">
                <span style="font-size:0.7em;opacity:0.5;margin-right:0.3em;">${s.level}</span>
                ${s.label}
                ${s.isSafe ? ' ✓' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  async function findAndWatchSession() {
    const { getOpenSession } = await import('../../services/sessionService.js');
    const { getDoc, doc } = await import('firebase/firestore');
    const { db } = await import('../../firebase/config.js');
    const { COLLECTIONS } = await import('../../utils/constants.js');

    const urlSession = new URLSearchParams(window.location.search).get('session');

    let targetSession = null;
    if (urlSession) {
      const snap = await getDoc(doc(db, COLLECTIONS.SESSIONS, urlSession));
      if (snap.exists()) targetSession = { id: snap.id, ...snap.data() };
    }
    if (!targetSession) {
      targetSession = await getOpenSession();
    }

    if (!targetSession) {
      render();
      setTimeout(findAndWatchSession, 5000);
      return;
    }

    unsubs.push(watchSession(targetSession.id, (s) => {
      const prevQId = session?.currentQuestionId;
      session = s;

      if (s.currentQuestionId && s.currentQuestionId !== prevQId) {
        if (audienceUnsub) { audienceUnsub(); audienceUnsub = null; }
        audienceVotes = null;
      }
      render();
    }));

    unsubs.push(watchPlayers(targetSession.id, (ps) => {
      players = ps;
      render();
    }));
  }

  render(); // show spinner immediately before async work begins
  findAndWatchSession().catch((err) => {
    console.error('BeamerView init error:', err);
    container.innerHTML = `<div class="beamer-waiting"><div class="beamer-waiting__title">Verbindungsfehler</div><div class="beamer-waiting__sub">${err.message}</div></div>`;
  });
}
