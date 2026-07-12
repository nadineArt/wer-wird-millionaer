import { getStoredPlayerId, getStoredSessionId, getPlayer, setWatching } from '../../services/playerService.js';
import { watchSession } from '../../services/sessionService.js';
import { SESSION_STATUS } from '../../utils/constants.js';
import { getStageName } from '../../utils/stageDefaults.js';
import { navigate } from '../../router/playerRouter.js';

export async function mountEliminatedView(container) {
  const sessionId = getStoredSessionId();
  const playerId = getStoredPlayerId();
  if (!sessionId || !playerId) { navigate('register'); return; }

  const player = await getPlayer(sessionId, playerId);
  if (!player) { navigate('register'); return; }

  let session = null;
  try {
    const { getOpenSession } = await import('../../services/sessionService.js');
    const { getDoc, doc } = await import('firebase/firestore');
    const { db } = await import('../../firebase/config.js');
    const { COLLECTIONS } = await import('../../utils/constants.js');
    const snap = await getDoc(doc(db, COLLECTIONS.SESSIONS, sessionId));
    if (snap.exists()) session = snap.data();
  } catch {}

  const stageLabels = session?.stageLabels || [];
  const safeStage = player.eliminatedAtStage ?? 0;
  const stageName = safeStage > 0 ? getStageName(safeStage, stageLabels) : 'Fremder';

  container.innerHTML = `
    <div class="eliminated-screen anim-fade-in">
      <div class="eliminated-screen__icon">💔</div>
      <div class="eliminated-screen__title">Oops. Das war wohl nichts.</div>
      <div class="eliminated-screen__stage">
        Du hast gesichert:
        <strong>${safeStage > 0 ? stageName : 'Gar nichts. Zurück auf Los.'}</strong>
      </div>
      <p style="font-size:0.85rem;color:var(--color-text-muted);max-width:280px;text-align:center;line-height:1.6;">
        Vielleicht kennst du ihn doch nicht so gut wie du dachtest. Aber hey — du warst dabei. 🌹
      </p>
      <button class="eliminated-screen__watch-btn" id="watch-btn">
        Trotzdem zuschauen
      </button>
    </div>
  `;

  container.querySelector('#watch-btn').addEventListener('click', async () => {
    await setWatching(sessionId, playerId, true);
    mountWatcherView(container, sessionId, stageLabels);
  });
}

function mountWatcherView(container, sessionId, stageLabels) {
  container.innerHTML = `
    <div class="lobby-screen anim-fade-in">
      <div class="lobby-screen__header">
        <div class="lobby-screen__title">Zuschauer-Modus 👀</div>
        <div class="lobby-screen__game-name">Die anderen kämpfen noch…</div>
      </div>
      <div class="lobby-screen__status" id="watcher-status">
        <span>🎭</span><span>Wartet auf nächste Frage…</span>
      </div>
      <div id="watcher-question-card" style="display:none;" class="game-screen__question-card anim-scale-in">
        <div class="game-screen__question-num" id="watcher-q-num"></div>
        <div class="game-screen__question-text" id="watcher-q-text"></div>
      </div>
    </div>
  `;

  watchSession(sessionId, (session) => {
    if (session.status === SESSION_STATUS.FINISHED) {
      container.querySelector('#watcher-status').innerHTML = '<span>🏁</span><span>Spiel beendet!</span>';
      return;
    }

    const qIndex = session.currentQuestionIndex;
    const question = session.questionsSnapshot?.[qIndex];
    const statusEl = container.querySelector('#watcher-status');
    const cardEl = container.querySelector('#watcher-question-card');

    if (question && statusEl) {
      statusEl.innerHTML = `<span>❓</span><span>Frage ${qIndex + 1} läuft</span>`;
      cardEl.style.display = 'block';
      container.querySelector('#watcher-q-num').textContent = `Frage ${qIndex + 1} — ${getStageName(qIndex + 1, stageLabels)}`;
      container.querySelector('#watcher-q-text').textContent = question.text;
    }
  });
}
