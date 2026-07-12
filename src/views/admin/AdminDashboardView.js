import { getAllGames } from '../../services/gameService.js';
import { getOpenSession } from '../../services/sessionService.js';
import { navigateAdmin } from '../../router/adminRouter.js';

export async function mountAdminDashboardView(container) {
  const [games, openSession] = await Promise.all([getAllGames(), getOpenSession()]);

  container.innerHTML = `
    <div>
      <div class="admin-page-header">
        <h2 class="admin-page-title">Dashboard</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-bottom:2rem;">
        <div class="admin-card" style="display:flex;flex-direction:column;gap:0.5rem;">
          <div style="font-size:2rem;font-weight:900;color:var(--color-accent);">${games.length}</div>
          <div style="font-size:0.85rem;color:var(--color-text-muted);font-weight:600;">Spiele angelegt</div>
          <button class="btn btn--secondary" onclick="window.location.hash='games'" style="margin-top:0.5rem;">Verwalten →</button>
        </div>
        <div class="admin-card" style="display:flex;flex-direction:column;gap:0.5rem;">
          <div style="font-size:2rem;font-weight:900;color:${openSession ? 'var(--color-correct)' : 'var(--color-text-muted)'};">
            ${openSession ? '🟢' : '⚫'}
          </div>
          <div style="font-size:0.85rem;color:var(--color-text-muted);font-weight:600;">
            ${openSession ? `Session aktiv: ${openSession.gameTitle}` : 'Keine Session offen'}
          </div>
          <button class="btn btn--primary" onclick="window.location.hash='control'" style="margin-top:0.5rem;">
            ${openSession ? 'Session steuern →' : 'Session starten →'}
          </button>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0.75rem;">
        <button class="admin-card" style="cursor:pointer;text-align:left;transition:background 150ms ease;" onclick="window.location.hash='control'">
          <div style="font-size:1.5rem;margin-bottom:0.5rem;">🎮</div>
          <div style="font-weight:700;">Spielsteuerung</div>
          <div style="font-size:0.8rem;color:var(--color-text-muted);">Session starten &amp; live steuern</div>
        </button>
        <button class="admin-card" style="cursor:pointer;text-align:left;transition:background 150ms ease;" onclick="window.location.hash='games'">
          <div style="font-size:1.5rem;margin-bottom:0.5rem;">🗂️</div>
          <div style="font-weight:700;">Spiele</div>
          <div style="font-size:0.8rem;color:var(--color-text-muted);">Anlegen, aktivieren, löschen</div>
        </button>
        <button class="admin-card" style="cursor:pointer;text-align:left;transition:background 150ms ease;" onclick="window.location.hash='questions'">
          <div style="font-size:1.5rem;margin-bottom:0.5rem;">❓</div>
          <div style="font-weight:700;">Fragen</div>
          <div style="font-size:0.8rem;color:var(--color-text-muted);">Fragen bearbeiten &amp; sortieren</div>
        </button>
        <button class="admin-card" style="cursor:pointer;text-align:left;transition:background 150ms ease;" onclick="window.location.hash='settings'">
          <div style="font-size:1.5rem;margin-bottom:0.5rem;">⚙️</div>
          <div style="font-weight:700;">Einstellungen</div>
          <div style="font-size:0.8rem;color:var(--color-text-muted);">Passwörter &amp; App-Config</div>
        </button>
      </div>
    </div>
  `;
}
