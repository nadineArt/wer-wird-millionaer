import './styles/base.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/views-beamer.css';

import { mountBeamerView } from './views/beamer/BeamerView.js';
import { loadAvatarOverrides } from './services/avatarService.js';

document.body.classList.add('beamer-mode');
const beamerApp = document.getElementById('beamer-app');
(async () => {
  await loadAvatarOverrides().catch(console.error);
  mountBeamerView(beamerApp);
})();
