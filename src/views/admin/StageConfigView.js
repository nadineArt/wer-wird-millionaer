import { getGame, updateStageLabels } from '../../services/gameService.js';
import { DEFAULT_STAGE_LABELS } from '../../utils/stageDefaults.js';
import { showToast } from '../../utils/toast.js';
import { navigateAdmin } from '../../router/adminRouter.js';

export async function mountStageConfigView(container) {
  const gameId = sessionStorage.getItem('editGameId');
  if (!gameId) { navigateAdmin('games'); return; }

  const game = await getGame(gameId);
  if (!game) { navigateAdmin('games'); return; }

  const stages = game.stageLabels?.length === 15 ? game.stageLabels : DEFAULT_STAGE_LABELS;

  container.innerHTML = `
    <div>
      <div class="admin-page-header">
        <div>
          <button class="btn btn--secondary" style="margin-bottom:0.5rem;" onclick="window.location.hash='questions'">← Zurück zu Fragen</button>
          <h2 class="admin-page-title">Stufenbezeichnungen</h2>
          <div style="font-size:0.8rem;color:var(--color-text-muted);">${game.title}</div>
        </div>
        <button class="btn btn--primary" id="save-stages-btn">Speichern</button>
      </div>
      <div class="admin-card" style="padding:0;overflow:hidden;">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width:3.5rem;">Stufe</th>
              <th>Bezeichnung</th>
              <th style="width:8rem;text-align:center;">Gesichert (Safe)</th>
            </tr>
          </thead>
          <tbody id="stages-tbody">
            ${stages.map(s => `
              <tr>
                <td style="font-weight:800;color:var(--color-accent);">${s.level}</td>
                <td>
                  <input class="input-field" type="text" data-level="${s.level}" id="stage-label-${s.level}"
                    value="${s.label}" style="padding:0.4rem 0.75rem;font-size:0.9rem;" />
                </td>
                <td style="text-align:center;">
                  <input type="checkbox" id="stage-safe-${s.level}" ${s.isSafe ? 'checked' : ''}
                    style="width:1.2rem;height:1.2rem;accent-color:var(--color-correct);cursor:pointer;" />
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.querySelector('#save-stages-btn').addEventListener('click', async () => {
    const updated = Array.from({ length: 15 }, (_, i) => {
      const level = i + 1;
      return {
        level,
        label: container.querySelector(`#stage-label-${level}`)?.value.trim() || `Stufe ${level}`,
        isSafe: container.querySelector(`#stage-safe-${level}`)?.checked ?? false,
      };
    });

    try {
      await updateStageLabels(gameId, updated);
      showToast('Stufen gespeichert! 🎯', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
