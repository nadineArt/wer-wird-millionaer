import './styles/base.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/views-admin.css';

import { isAdminAuthenticated, logoutAdmin, initAppConfig } from './auth/adminAuth.js';
import { mountAdminLoginView } from './views/admin/AdminLoginView.js';
import { mountAdminDashboardView } from './views/admin/AdminDashboardView.js';
import { mountGameManagerView } from './views/admin/GameManagerView.js';
import { mountQuestionEditorView } from './views/admin/QuestionEditorView.js';
import { mountStageConfigView } from './views/admin/StageConfigView.js';
import { mountGameControlView } from './views/admin/GameControlView.js';
import { mountAppSettingsView } from './views/admin/AppSettingsView.js';

const adminApp = document.getElementById('admin-app');

async function init() {
  await initAppConfig();

  if (!isAdminAuthenticated()) {
    adminApp.innerHTML = '';
    mountAdminLoginView(adminApp);

    window.addEventListener('hashchange', () => {
      if (isAdminAuthenticated()) renderShell();
    });
    return;
  }

  renderShell();
}

function renderShell() {
  adminApp.innerHTML = `
    <div class="admin-shell">
      <div class="admin-topbar">
        <button class="admin-menu-btn" id="menu-btn" aria-label="Menü">☰</button>
        <div class="admin-topbar__logo">🎛️ WWM Admin</div>
        <div class="admin-topbar__actions">
          <a href="index.html" target="_blank" class="btn btn--secondary" style="font-size:0.8rem;">Spieler 🔗</a>
          <a href="beamer.html" target="_blank" class="btn btn--secondary" style="font-size:0.8rem;">Beamer 📺</a>
          <button class="btn btn--danger" id="logout-btn" style="font-size:0.8rem;">Ausloggen</button>
        </div>
      </div>
      <nav class="admin-sidebar" id="admin-sidebar">
        <div class="admin-nav__section">Spielbetrieb</div>
        <div class="admin-nav__item" data-route="control"><span class="admin-nav__icon">🎮</span>Spielsteuerung</div>
        <div class="admin-nav__section">Konfiguration</div>
        <div class="admin-nav__item" data-route="games"><span class="admin-nav__icon">🗂️</span>Spiele</div>
        <div class="admin-nav__item" data-route="questions"><span class="admin-nav__icon">❓</span>Fragen</div>
        <div class="admin-nav__item" data-route="stages"><span class="admin-nav__icon">🏆</span>Stufen</div>
        <div class="admin-nav__section">System</div>
        <div class="admin-nav__item" data-route="settings"><span class="admin-nav__icon">⚙️</span>Einstellungen</div>
        <div class="admin-nav__item" data-route="dashboard"><span class="admin-nav__icon">🏠</span>Dashboard</div>
      </nav>
      <main class="admin-content" id="admin-content"></main>
    </div>
  `;

  const contentEl = adminApp.querySelector('#admin-content');
  const sidebar = adminApp.querySelector('#admin-sidebar');
  const menuBtn = adminApp.querySelector('#menu-btn');

  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('admin-sidebar--open');
  });

  // Close sidebar when navigating on mobile
  function closeSidebar() {
    sidebar.classList.remove('admin-sidebar--open');
  }

  const routes = {
    dashboard: mountAdminDashboardView,
    control:   mountGameControlView,
    games:     mountGameManagerView,
    questions: mountQuestionEditorView,
    stages:    mountStageConfigView,
    settings:  mountAppSettingsView,
  };

  function navigate() {
    const route = window.location.hash.replace('#', '') || 'dashboard';
    const mount = routes[route] || routes.dashboard;

    adminApp.querySelectorAll('.admin-nav__item').forEach(el => {
      el.classList.toggle('admin-nav__item--active', el.dataset.route === route);
    });

    contentEl.innerHTML = '';
    mount(contentEl);
  }

  adminApp.querySelectorAll('.admin-nav__item').forEach(el => {
    el.addEventListener('click', () => {
      window.location.hash = el.dataset.route;
      closeSidebar();
    });
  });

  adminApp.querySelector('#logout-btn').addEventListener('click', () => {
    logoutAdmin();
    adminApp.innerHTML = '';
    mountAdminLoginView(adminApp);
  });

  window.addEventListener('hashchange', navigate);
  navigate();
}

init();
