const routes = new Map();
let currentRoute = null;
let appEl = null;

export function initRouter(rootEl) {
  appEl = rootEl;
  window.addEventListener('hashchange', handleRoute);
}

export function register(hash, mountFn) {
  routes.set(hash, mountFn);
}

export function navigate(hash) {
  window.location.hash = hash;
}

export function getCurrentRoute() {
  return currentRoute;
}

function handleRoute() {
  const hash = window.location.hash.replace('#', '') || 'access';
  currentRoute = hash;

  if (!appEl) return;

  const mount = routes.get(hash);
  if (mount) {
    appEl.innerHTML = '';
    mount(appEl);
  } else {
    appEl.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;">Route nicht gefunden: #${hash}</div>`;
  }
}

export function start() {
  handleRoute();
}
