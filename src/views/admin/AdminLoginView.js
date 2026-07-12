import { loginAdmin } from '../../auth/adminAuth.js';
import { navigateAdmin } from '../../router/adminRouter.js';
import { showToast } from '../../utils/toast.js';

export function mountAdminLoginView(container) {
  container.innerHTML = `
    <div class="admin-login">
      <div class="admin-login__card anim-scale-in">
        <div style="font-size:2.5rem;margin-bottom:1rem;">🎛️</div>
        <div class="admin-login__title">Spielmaster</div>
        <p class="admin-login__sub">Nur für Eingeweihte. Du weißt was du tust.</p>
        <form class="admin-login__form" id="admin-login-form">
          <input
            class="input-field"
            type="password"
            id="admin-pw"
            placeholder="Admin-Passwort"
            autocomplete="current-password"
            autofocus
          />
          <button type="submit" class="submit-btn">Einloggen</button>
        </form>
      </div>
    </div>
  `;

  container.querySelector('#admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = container.querySelector('#admin-pw').value;
    const btn = container.querySelector('.submit-btn');
    btn.disabled = true;
    btn.textContent = '…';

    try {
      const ok = await loginAdmin(pw);
      if (ok) {
        navigateAdmin('dashboard');
      } else {
        showToast('Falsches Passwort.', 'error');
        container.querySelector('#admin-pw').classList.add('input-field--error');
        setTimeout(() => container.querySelector('#admin-pw')?.classList.remove('input-field--error'), 2000);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Einloggen';
    }
  });
}
