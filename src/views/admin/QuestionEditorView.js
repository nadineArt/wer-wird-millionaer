import {
  getGame, getQuestions, createQuestion, updateQuestion,
  deleteQuestion, reorderQuestions,
} from '../../services/gameService.js';
import { showToast } from '../../utils/toast.js';
import { navigateAdmin } from '../../router/adminRouter.js';
import { ANSWERS } from '../../utils/constants.js';

export async function mountQuestionEditorView(container) {
  const gameId = sessionStorage.getItem('editGameId');
  if (!gameId) { navigateAdmin('games'); return; }

  const [game, questions] = await Promise.all([getGame(gameId), getQuestions(gameId)]);
  if (!game) { navigateAdmin('games'); return; }

  renderEditor(container, game, questions, gameId);
}

function renderEditor(container, game, questions, gameId) {
  container.innerHTML = `
    <div>
      <div class="admin-page-header">
        <div>
          <button class="btn btn--secondary" style="margin-bottom:0.5rem;" onclick="window.location.hash='games'">← Zurück</button>
          <h2 class="admin-page-title">${game.title} — Fragen</h2>
          <div style="font-size:0.8rem;color:var(--color-text-muted);">${questions.length} / 15 Fragen</div>
        </div>
        <div style="display:flex;gap:0.75rem;align-items:center;">
          <button class="btn btn--secondary" id="stage-config-btn">⚙️ Stufen</button>
          <button class="btn btn--primary" id="add-question-btn">+ Frage hinzufügen</button>
        </div>
      </div>

      ${questions.length === 0
        ? `<div class="admin-card" style="text-align:center;color:var(--color-text-muted);padding:2.5rem;">
             Noch keine Fragen. Fang an!
           </div>`
        : `<div class="admin-card" style="padding:0;overflow:hidden;">
             <table class="admin-table">
               <thead>
                 <tr>
                   <th style="width:2rem;">#</th>
                   <th>Frage</th>
                   <th>Stufe</th>
                   <th></th>
                 </tr>
               </thead>
               <tbody id="questions-tbody">
                 ${questions.map((q, i) => `
                   <tr data-id="${q.id}" data-index="${i}">
                     <td style="color:var(--color-text-muted);font-weight:700;">${q.order}</td>
                     <td style="max-width:400px;">
                       <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${q.text}</div>
                       <div style="font-size:0.75rem;color:var(--color-text-muted);margin-top:2px;">
                         Richtig: <span style="color:var(--color-correct);">${q.options[q.correctAnswer]}</span>
                       </div>
                     </td>
                     <td><span class="badge badge--accent">Stufe ${q.stage}</span></td>
                     <td>
                       <div style="display:flex;gap:0.4rem;justify-content:flex-end;">
                         <button class="btn-icon btn-up" title="Hoch" data-id="${q.id}">↑</button>
                         <button class="btn-icon btn-down" title="Runter" data-id="${q.id}">↓</button>
                         <button class="btn-icon btn-edit-q" title="Bearbeiten" data-id="${q.id}">✏️</button>
                         <button class="btn-icon btn-icon--danger btn-del-q" title="Löschen" data-id="${q.id}">🗑️</button>
                       </div>
                     </td>
                   </tr>
                 `).join('')}
               </tbody>
             </table>
           </div>`
      }
    </div>
  `;

  container.querySelector('#add-question-btn').addEventListener('click', () => {
    showQuestionForm(container, gameId, null, questions, game);
  });

  container.querySelector('#stage-config-btn').addEventListener('click', () => {
    sessionStorage.setItem('editGameId', gameId);
    navigateAdmin('stages');
  });

  container.querySelectorAll('.btn-edit-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = questions.find(q => q.id === btn.dataset.id);
      if (q) showQuestionForm(container, gameId, q, questions, game);
    });
  });

  container.querySelectorAll('.btn-del-q').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Frage löschen?')) return;
      await deleteQuestion(gameId, btn.dataset.id);
      showToast('Frage gelöscht.', 'default');
      const [freshGame, freshQs] = await Promise.all([getGame(gameId), getQuestions(gameId)]);
      renderEditor(container, freshGame, freshQs, gameId);
    });
  });

  container.querySelectorAll('.btn-up').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = questions.findIndex(q => q.id === btn.dataset.id);
      if (idx <= 0) return;
      const reordered = [...questions];
      [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
      await reorderQuestions(gameId, reordered.map(q => q.id));
      const freshQs = await getQuestions(gameId);
      renderEditor(container, game, freshQs, gameId);
    });
  });

  container.querySelectorAll('.btn-down').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = questions.findIndex(q => q.id === btn.dataset.id);
      if (idx >= questions.length - 1) return;
      const reordered = [...questions];
      [reordered[idx], reordered[idx + 1]] = [reordered[idx + 1], reordered[idx]];
      await reorderQuestions(gameId, reordered.map(q => q.id));
      const freshQs = await getQuestions(gameId);
      renderEditor(container, game, freshQs, gameId);
    });
  });
}

function showQuestionForm(container, gameId, existing, allQuestions, game) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.alignItems = 'flex-start';
  overlay.style.overflowY = 'auto';
  overlay.style.padding = '2rem';

  const nextOrder = existing ? existing.order : (allQuestions.length + 1);
  const nextStage = existing ? existing.stage : Math.min(allQuestions.length + 1, 15);

  overlay.innerHTML = `
    <div class="modal" style="max-width:560px;width:100%;margin:auto;">
      <div class="modal__title">${existing ? 'Frage bearbeiten' : 'Neue Frage'}</div>
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <div class="form-group">
          <label class="form-label">Fragetext</label>
          <textarea class="input-field" id="q-text" rows="3" placeholder="Was ist…?" style="resize:vertical;">${existing?.text ?? ''}</textarea>
        </div>
        ${ANSWERS.map(letter => `
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Antwort ${letter}</label>
            <div class="answer-option-row">
              <div class="answer-option-row__letter">${letter}</div>
              <input class="input-field" type="text" id="opt-${letter}" placeholder="Antwort ${letter}"
                value="${existing?.options?.[letter] ?? ''}" style="flex:1;" />
              <label class="correct-radio">
                <input type="radio" name="correct" value="${letter}" ${existing?.correctAnswer === letter ? 'checked' : ''} />
                Richtig
              </label>
            </div>
          </div>
        `).join('')}
        <div class="form-group">
          <label class="form-label">Stufe (1–15)</label>
          <input class="input-field" type="number" id="q-stage" min="1" max="15" value="${nextStage}" />
        </div>
      </div>
      <div class="modal__actions" style="margin-top:1.5rem;">
        <button class="btn-secondary" id="q-cancel">Abbrechen</button>
        <button class="btn-primary" id="q-save">${existing ? 'Speichern' : 'Hinzufügen'}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#q-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#q-save').addEventListener('click', async () => {
    const text = overlay.querySelector('#q-text').value.trim();
    const correctAnswer = overlay.querySelector('input[name="correct"]:checked')?.value;
    const stage = parseInt(overlay.querySelector('#q-stage').value) || nextStage;

    if (!text) { showToast('Fragetext fehlt.', 'error'); return; }
    if (!correctAnswer) { showToast('Richtige Antwort markieren!', 'error'); return; }

    const options = {};
    let allFilled = true;
    ANSWERS.forEach(l => {
      const val = overlay.querySelector(`#opt-${l}`).value.trim();
      if (!val) allFilled = false;
      options[l] = val;
    });
    if (!allFilled) { showToast('Alle 4 Antworten ausfüllen.', 'error'); return; }

    try {
      if (existing) {
        await updateQuestion(gameId, existing.id, { text, options, correctAnswer, stage });
      } else {
        await createQuestion(gameId, { text, options, correctAnswer, stage, order: nextOrder });
      }
      overlay.remove();
      showToast(existing ? 'Frage gespeichert.' : 'Frage hinzugefügt!', 'success');
      const [freshGame, freshQs] = await Promise.all([getGame(gameId), getQuestions(gameId)]);
      renderEditor(container, freshGame, freshQs, gameId);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
