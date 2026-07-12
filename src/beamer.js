import './styles/base.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/views-beamer.css';

import { mountBeamerView } from './views/beamer/BeamerView.js';

document.body.classList.add('beamer-mode');
const beamerApp = document.getElementById('beamer-app');
mountBeamerView(beamerApp);
