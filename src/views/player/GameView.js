import { watchSession, watchPlayers, watchAudienceVotes } from '../../services/sessionService.js';
import { watchOwnPlayer, submitAnswer, getStoredPlayerId, getStoredSessionId } from '../../services/playerService.js';
import { useFiftyFifty, usePhoneJoker, useAudienceJoker, canUseJoker, JOKER_META } from '../../services/jokerService.js';
import { navigate } from '../../router/playerRouter.js';
import { SESSION_STATUS, QUESTION_STATE, PLAYER_STATUS, JOKER_TYPES, ANSWERS } from '../../utils/constants.js';
import { getStageName } from '../../utils/stageDefaults.js';
import { showToast } from '../../utils/toast.js';

export function mountGameView(container) {
  const sessionId = getStoredSessionId();
  const playerId = getStoredPlayerId();
  if (!sessionId || !playerId) { navigate('register'); return; }

  let state = {
    session: null,
    player: null,
    selectedAnswer: null,
    submittedAnswer: null,
    hiddenOptions: [],
    showAudience: false,
    audienceVotes: null,
    audienceUnsub: null,
    revealed: false,
    correctAnswer: null,
  };

  const unsubs = [];

  function render() {
    if (!state.session || !state.player) return;
    const { session, player } = state;
    const questions = session.questionsSnapshot || [];
    const qIndex = session.currentQuestionIndex;
    const question = questions[qIndex];

    if (!question) return;

    const stageLabels = session.stageLabels || [];
    const stageName = getStageName(qIndex + 1, stageLabels);

    container.innerHTML = `
      <div class="game-screen">
        <div class="game-screen__header">
          <div class="game-screen__stage">Stufe ${qIndex + 1} — ${stageName}</div>
          <div class="game-screen__jokers" id="joker-row"></div>
        </div>

        <div class="game-screen__question-card anim-scale-in">
          <div class="game-screen__question-num">Frage ${qIndex + 1} von ${questions.length}</div>
          <div class="game-screen__question-text">${question.text}</div>
        </div>

        ${state.showAudience ? `<div class="game-screen__audience-overlay" id="audience-chart"></div>` : ''}

        <div class="game-screen__answers" id="answers"></div>

        <div class="game-screen__footer">
          ${!state.submittedAnswer && !state.revealed
            ? `<button class="submit-btn" id="submit-btn" ${!state.selectedAnswer ? 'disabled' : ''}>
                Einloggen ✓
              </button>`
            : state.submittedAnswer && !state.revealed
            ? `<div style="text-align:center;font-size:0.85rem;color:var(--color-text-muted);font-weight:600;padding:0.75rem;">
                Antwort eingeloggt — warte auf Auflösung ✓
              </div>`
            : ''
          }
        </div>
      </div>
    `;

    renderAnswers(question);
    renderJokers(player, question);
    if (state.showAudience) renderAudienceChart();
    attachFooterHandler(question, session);
  }

  function renderAnswers(question) {
    const answersEl = container.querySelector('#answers');
    if (!answersEl) return;
    answersEl.innerHTML = '';

    ANSWERS.forEach(letter => {
      if (state.hiddenOptions.includes(letter)) {
        const btn = document.createElement('button');
        btn.className = 'answer-btn answer-btn--hidden';
        btn.innerHTML = `<span class="answer-btn__letter">${letter}</span><span class="answer-btn__text">${question.options[letter]}</span>`;
        answersEl.appendChild(btn);
        return;
      }

      const btn = document.createElement('button');
      let cls = 'answer-btn';
      if (state.revealed) {
        if (letter === state.correctAnswer) cls += ' answer-btn--correct';
        else if (letter === state.submittedAnswer) cls += ' answer-btn--wrong';
        btn.disabled = true;
      } else {
        if (letter === state.selectedAnswer) cls += ' answer-btn--selected';
        if (state.submittedAnswer) btn.disabled = true;
      }
      btn.className = cls;
      btn.innerHTML = `<span class="answer-btn__letter">${letter}</span><span class="answer-btn__text">${question.options[letter]}</span>`;

      if (!state.submittedAnswer && !state.revealed) {
        btn.addEventListener('click', () => {
          state.selectedAnswer = letter;
          renderAnswers(question);
          const submitBtn = container.querySelector('#submit-btn');
          if (submitBtn) submitBtn.disabled = false;
        });
      }
      answersEl.appendChild(btn);
    });
  }

  function renderJokers(player, question) {
    const row = container.querySelector('#joker-row');
    if (!row) return;

    [JOKER_TYPES.FIFTY, JOKER_TYPES.PHONE, JOKER_TYPES.AUDIENCE].forEach(type => {
      const meta = JOKER_META[type];
      const used = player.jokersUsed?.[type];
      const btn = document.createElement('button');
      btn.className = `joker-btn${used ? ' joker-btn--used' : ''}`;
      btn.disabled = used || state.revealed;
      btn.innerHTML = `<span class="joker-btn__icon">${meta.icon}</span><span>${meta.label}</span>`;
      btn.addEventListener('click', () => showJokerConfirm(type, player, question));
      row.appendChild(btn);
    });
  }

  function renderAudienceChart(el) {
    if (!el) el = container.querySelector('#audience-chart');
    if (!el || !state.audienceVotes) return;

    const votes = state.audienceVotes.votes || { A: 0, B: 0, C: 0, D: 0 };
    const total = Object.values(votes).reduce((a, b) => a + b, 0) || 1;

    el.innerHTML = `
      <div style="font-size:0.75rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.5rem;text-align:center;">
        Publikum tippt gerade…
      </div>
      <div class="audience-chart">
        ${ANSWERS.map(letter => {
          const count = votes[letter] || 0;
          const pct = Math.round((count / total) * 100);
          return `
            <div class="audience-bar">
              <div class="audience-bar__track">
                <div class="audience-bar__fill" style="height:${Math.max(pct, 2)}%;"></div>
              </div>
              <div class="audience-bar__label">${letter}</div>
              <div class="audience-bar__pct">${pct}%</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function showJokerConfirm(type, player, question) {
    if (!canUseJoker(player, type)) return;
    const meta = JOKER_META[type];

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal__icon">${meta.icon}</div>
        <div class="modal__title">${meta.title}</div>
        <div class="modal__body">${meta.description}</div>
        <div class="modal__actions">
          <button class="btn-secondary" id="joker-cancel">Abbrechen</button>
          <button class="btn-primary" id="joker-confirm">${meta.confirmLabel}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#joker-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#joker-confirm').addEventListener('click', async () => {
      overlay.remove();
      await activateJoker(type, player, question);
    });
  }

  async function activateJoker(type, player, question) {
    if (type === JOKER_TYPES.FIFTY) {
      const hidden = await useFiftyFifty(sessionId, playerId, question, state.selectedAnswer);
      state.hiddenOptions = hidden;
      render();
    } else if (type === JOKER_TYPES.PHONE) {
      await usePhoneJoker(sessionId, playerId);
      showToast('📞 Joker eingelöst — ruf jemanden an!', 'default', 5000);
    } else if (type === JOKER_TYPES.AUDIENCE) {
      const qId = state.session.currentQuestionId;
      await useAudienceJoker(sessionId, playerId, qId);
      state.showAudience = true;
      if (state.audienceUnsub) state.audienceUnsub();
      state.audienceUnsub = watchAudienceVotes(sessionId, qId, (data) => {
        state.audienceVotes = data;
        // Only update chart in-place — avoid full re-render which rebuilds
        // the DOM and causes the listener to reference a stale element
        const chartEl = container.querySelector('#audience-chart');
        if (chartEl) {
          renderAudienceChart(chartEl);
        } else {
          render();
        }
      });
      render();
    }
  }

  function attachFooterHandler(question, session) {
    const submitBtn = container.querySelector('#submit-btn');
    if (!submitBtn) return;

    submitBtn.addEventListener('click', async () => {
      if (!state.selectedAnswer) return;
      submitBtn.disabled = true;
      submitBtn.textContent = '…';
      try {
        await submitAnswer(sessionId, playerId, session.currentQuestionId, state.selectedAnswer, session);
        state.submittedAnswer = state.selectedAnswer;
        render();
      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Einloggen ✓';
      }
    });
  }

  unsubs.push(watchSession(sessionId, (session) => {
    const prevQId = state.session?.currentQuestionId;
    state.session = session;

    if (session.status === SESSION_STATUS.FINISHED) {
      unsubs.forEach(u => u());
      if (state.audienceUnsub) state.audienceUnsub();
      return;
    }

    if (session.currentQuestionId && session.currentQuestionId !== prevQId) {
      state.selectedAnswer = null;
      state.submittedAnswer = null;
      state.hiddenOptions = [];
      state.showAudience = false;
      state.revealed = false;
      state.correctAnswer = null;
      if (state.audienceUnsub) { state.audienceUnsub(); state.audienceUnsub = null; }
    }

    if (session.currentQuestionState === QUESTION_STATE.REVEALED) {
      const qIndex = session.currentQuestionIndex;
      const question = session.questionsSnapshot?.[qIndex];
      state.revealed = true;
      state.correctAnswer = question?.correctAnswer || null;
    } else {
      state.revealed = false;
    }

    render();
  }));

  unsubs.push(watchOwnPlayer(sessionId, playerId, (player) => {
    state.player = player;

    if (player.status === PLAYER_STATUS.ELIMINATED) {
      unsubs.forEach(u => u());
      if (state.audienceUnsub) state.audienceUnsub();
      navigate('out');
      return;
    }
    if (player.status === PLAYER_STATUS.WINNER) {
      unsubs.forEach(u => u());
      if (state.audienceUnsub) state.audienceUnsub();
      navigate('winner');
      return;
    }

    const currentQId = state.session?.currentQuestionId;
    if (currentQId) {
      state.submittedAnswer = player.answers?.[currentQId]?.submitted ?? null;
    }
    render();
  }));
}
