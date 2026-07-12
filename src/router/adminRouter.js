const routes = new Map();
let contentEl = null;

export function initAdminRouter(el) {
  contentEl = el;
  window.addEventListener('hashchange', handleRoute);
}

export function registerAdmin(hash, mountFn) {
  routes.set(hash, mountFn);
}

export function navigateAdmin(hash) {
  window.location.hash = hash;
}

function handleRoute() {
  const hash = window.location.hash.replace('#', '') || 'dashboard';

  if (!contentEl) return;

  const mount = routes.get(hash);
  if (mount) {
    contentEl.innerHTML = '';
    mount(contentEl);
  }
}

export function startAdmin() {
  handleRoute();
}
