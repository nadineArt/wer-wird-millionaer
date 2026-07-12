import { getAllGames, createGame, updateGame, deleteGame } from '../../services/gameService.js';
import { navigateAdmin } from '../../router/adminRouter.js';
import { showToast } from '../../utils/toast.js';

export async function mountGameManagerView(container) {
  await renderGameList(container);
}

async function renderGameList(container) {
  const games = await getAllGames();

  container.innerHTML = `
    <div>
      <div class="admin-page-header">
        <h2 class="admin-page-title">Spiele</h2>
        <button class="btn btn--primary" id="new-game-btn">+ Neues Spiel</button>
      </div>

      ${games.length === 0
        ? `<div class="admin-card" style="text-align:center;color:var(--color-text-muted);padding:2rem;">
             Noch kein Spiel angelegt. Los geht's!
           </div>`
        : `<div class="admin-card" style="padding:0;overflow:hidden;">
             <table class="admin-table">
               <thead>
                 <tr>
                   <th>Name</th>
                   <th>Fragen</th>
                   <th>Status</th>
                   <th></th>
                 </tr>
               </thead>
               <tbody id="games-tbody">
                 ${games.map(g => `
                   <tr data-id="${g.id}">
                     <td style="font-weight:700;">${g.title}</td>
                     <td>${g.questionsCount ?? '—'}</td>
                     <td>
                       <span class="badge ${g.active ? 'badge--success' : 'badge--accent'}">
                         ${g.active ? 'Aktiv' : 'Inaktiv'}
                       </span>
                     </td>
                     <td>
                       <div style="display:flex;gap:0.5rem;justify-content:flex-end;">
                         <button class="btn btn--secondary btn-edit" title="Fragen bearbeiten" data-id="${g.id}">✏️ Fragen</button>
                         <button class="btn btn--secondary btn-toggle" data-id="${g.id}" data-active="${g.active}">
                           ${g.active ? 'Deaktivieren' : 'Aktivieren'}
                         </button>
                         <button class="btn btn--danger btn-delete" data-id="${g.id}">🗑️</button>
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

  container.querySelector('#new-game-btn').addEventListener('click', () => {
    showCreateForm(container);
  });

  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      sessionStorage.setItem('editGameId', btn.dataset.id);
      navigateAdmin('questions');
    });
  });

  container.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', async () => {
      const isActive = btn.dataset.active === 'true';
      await updateGame(btn.dataset.id, { active: !isActive });
      showToast(isActive ? 'Spiel deaktiviert.' : 'Spiel aktiviert.', 'success');
      await renderGameList(container);
    });
  });

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Spiel wirklich löschen? Alle Fragen werden auch gelöscht.')) return;
      await deleteGame(btn.dataset.id);
      showToast('Spiel gelöscht.', 'default');
      await renderGameList(container);
    });
  });
}

function showCreateForm(container) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal__title">Neues Spiel</div>
      <div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1.5rem;">
        <input class="input-field" type="text" id="game-title" placeholder="Titel (z.B. Nadines Geburtstagsquiz)" />
        <input class="input-field" type="text" id="game-desc" placeholder="Kurze Beschreibung (optional)" />
      </div>
      <div class="modal__actions">
        <button class="btn-secondary" id="cancel-create">Abbrechen</button>
        <button class="btn-primary" id="confirm-create">Erstellen</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#cancel-create').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#confirm-create').addEventListener('click', async () => {
    const title = overlay.querySelector('#game-title').value.trim();
    if (!title) { showToast('Name vergessen?', 'error'); return; }
    const desc = overlay.querySelector('#game-desc').value.trim();
    try {
      const gameId = await createGame({ title, description: desc });
      overlay.remove();
      showToast('Spiel erstellt!', 'success');
      sessionStorage.setItem('editGameId', gameId);
      navigateAdmin('questions');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
