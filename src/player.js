import './styles/base.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/views-player.css';

import { initRouter, register, start } from './router/playerRouter.js';
import { mountAccessView } from './views/player/AccessView.js';
import { mountRegisterView } from './views/player/RegisterView.js';
import { mountWaitingRoomView } from './views/player/WaitingRoomView.js';
import { mountGameView } from './views/player/GameView.js';
import { mountEliminatedView } from './views/player/EliminatedView.js';
import { mountWinnerView } from './views/player/WinnerView.js';
import { initAppConfig } from './auth/adminAuth.js';

const app = document.getElementById('app');
initRouter(app);

register('access',   (el) => mountAccessView(el));
register('register', (el) => mountRegisterView(el));
register('lobby',    (el) => mountWaitingRoomView(el));
register('game',     (el) => mountGameView(el));
register('out',      (el) => mountEliminatedView(el));
register('winner',   (el) => mountWinnerView(el));

initAppConfig().catch(console.error);
start();
