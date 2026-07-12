import { getStoredPlayerId, getStoredSessionId, getPlayer } from '../../services/playerService.js';
import { getFullAppConfig } from '../../auth/adminAuth.js';
import { navigate } from '../../router/playerRouter.js';
import { getAvatarSrc } from '../../utils/avatarData.js';
import { getStageName } from '../../utils/stageDefaults.js';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { COLLECTIONS } from '../../utils/constants.js';

export async function mountWinnerView(container) {
  const sessionId = getStoredSessionId();
  const playerId = getStoredPlayerId();
  if (!sessionId || !playerId) { navigate('register'); return; }

  const player = await getPlayer(sessionId, playerId);
  if (!player) { navigate('register'); return; }

  const { themeWord } = await getFullAppConfig().catch(() => ({ themeWord: 'Maximilianismus' }));

  let stageName = 'Seelenmensch';
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.SESSIONS, sessionId));
    if (snap.exists()) {
      const session = snap.data();
      const stageLabels = session.stageLabels || [];
      const lastStage = session.questionsSnapshot?.length ?? 15;
      stageName = getStageName(lastStage, stageLabels);
    }
  } catch {}

  container.innerHTML = `
    <div class="winner-screen anim-fade-in">
      <div class="winner-screen__crown anim-avatar-in">👑</div>
      <img src="${getAvatarSrc(player.avatar)}" alt="${player.name}" class="avatar avatar--xl anim-scale-in" style="animation-delay:200ms;" />
      <div class="winner-screen__title">
        ${player.name}!
      </div>
      <div class="winner-screen__subtitle">
        Herzlichen Glückwunsch — du bist der ultimative ${themeWord}-Experte. Das ist einmalig.
      </div>
      <div class="winner-screen__stage">${stageName}</div>
      <p style="font-size:0.8rem;color:var(--color-text-muted);margin-top:0.5rem;">
        Du bist offiziell zertifiziert im ${themeWord}. 🌟
      </p>
    </div>
  `;

  startConfetti(container);
}

function startConfetti(container) {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  canvas.style.display = 'block';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const ctx = canvas.getContext('2d');
  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    vx: (Math.random() - 0.5) * 3,
    vy: 2 + Math.random() * 4,
    color: ['#f5a623', '#3dd68c', '#e8445a', '#fff', '#a78bfa'][Math.floor(Math.random() * 5)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 6,
  }));

  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
      ctx.restore();
    });
    frame = requestAnimationFrame(draw);
  }
  draw();

  setTimeout(() => {
    cancelAnimationFrame(frame);
    canvas.style.display = 'none';
  }, 8000);
}
