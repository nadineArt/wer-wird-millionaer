// Generates stylized SVG pop star avatars directly into public/assets/avatars/
// Run with: node scripts/generate_avatars_svg.js

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'assets', 'avatars');
mkdirSync(OUT, { recursive: true });

// Hair style path sets (back layer + crown overlay)
// Coordinate space: 200x200, head ellipse at (100,112) rx=36 ry=40
const HAIR = {
  long_wavy: (c) => `
    <path d="M 56 84 C 16 95 10 168 24 200 L 176 200 C 190 168 184 95 144 84 C 126 72 112 68 100 68 C 88 68 74 72 56 84 Z" fill="${c}"/>
    <path d="M 24 140 C 10 126 8 148 18 160 C 12 150 14 138 24 140 Z" fill="${c}" opacity="0.8"/>
    <path d="M 176 140 C 190 126 192 148 182 160 C 188 150 186 138 176 140 Z" fill="${c}" opacity="0.8"/>`,

  long_straight: (c) => `
    <path d="M 62 82 L 28 200 L 172 200 L 138 82 C 122 73 108 69 100 69 C 92 69 78 73 62 82 Z" fill="${c}"/>`,

  voluminous: (c) => `
    <path d="M 48 96 C 4 74 4 148 20 200 L 180 200 C 196 148 196 74 152 96 C 128 72 100 62 100 62 C 100 62 72 72 48 96 Z" fill="${c}"/>
    <path d="M 48 96 C 26 84 14 106 20 118 C 18 104 30 94 48 96 Z" fill="${c}" opacity="0.9"/>
    <path d="M 152 96 C 174 84 186 106 180 118 C 182 104 170 94 152 96 Z" fill="${c}" opacity="0.9"/>`,

  high_ponytail: (c) => `
    <path d="M 82 86 L 70 200 L 130 200 L 118 86 Q 108 70 100 68 Q 92 70 82 86 Z" fill="${c}"/>
    <path d="M 95 73 L 90 18 Q 100 8 110 18 L 105 73 Z" fill="${c}"/>
    <ellipse cx="100" cy="18" rx="10" ry="7" fill="${c}"/>`,

  messy_blonde: (c) => `
    <path d="M 56 92 C 28 78 26 142 38 200 L 162 200 C 174 142 172 78 144 92 C 122 70 100 62 100 62 C 100 62 78 70 56 92 Z" fill="${c}"/>
    <path d="M 68 82 L 58 52 L 72 70 L 82 44 L 92 67 L 100 40 L 108 67 L 118 44 L 128 70 L 142 52 L 132 82 C 118 68 100 62 82 82 Z" fill="${c}"/>`,

  curly_long: (c) => `
    <path d="M 46 90 C 6 96 4 166 18 200 L 182 200 C 196 166 194 96 154 90 C 134 70 100 60 100 60 C 100 60 66 70 46 90 Z" fill="${c}"/>
    <path d="M 18 132 C 4 118 4 142 14 155 C 8 145 10 131 18 132 Z" fill="${c}" opacity="0.9"/>
    <path d="M 182 132 C 196 118 196 142 186 155 C 192 145 190 131 182 132 Z" fill="${c}" opacity="0.9"/>
    <path d="M 28 110 C 14 100 12 118 20 126 Z" fill="${c}" opacity="0.7"/>
    <path d="M 172 110 C 186 100 188 118 180 126 Z" fill="${c}" opacity="0.7"/>`,

  sleek_dark: (c) => `
    <path d="M 64 83 L 32 200 L 168 200 L 136 83 C 120 74 108 70 100 70 C 92 70 80 74 64 83 Z" fill="${c}"/>
    <path d="M 136 83 C 148 90 162 88 170 76 C 162 66 148 68 136 83 Z" fill="${c}" opacity="0.85"/>`,

  dramatic: (c) => `
    <path d="M 46 90 C 14 72 12 148 26 200 L 174 200 C 188 148 186 72 154 90 C 162 100 178 92 184 78 C 178 58 156 54 148 70 C 126 68 100 58 100 58 C 100 58 74 68 46 90 Z" fill="${c}"/>`,

  bob_y2k: (c) => `
    <path d="M 60 86 C 36 90 30 138 36 200 L 164 200 C 170 138 164 90 140 86 C 124 75 110 70 100 70 C 90 70 76 75 60 86 Z" fill="${c}"/>
    <path d="M 60 86 C 50 72 100 58 140 86 Q 118 68 100 68 Q 82 68 60 86 Z" fill="${c}" opacity="0.7"/>`,

  retro_waves: (c) => `
    <path d="M 54 86 C 18 94 12 162 26 200 L 174 200 C 188 162 182 94 146 86 C 130 72 114 68 100 68 C 86 68 70 72 54 86 Z" fill="${c}"/>
    <path d="M 54 86 C 44 70 60 52 80 64 C 70 56 52 64 54 86 Z" fill="${c}" opacity="0.8"/>
    <path d="M 146 86 C 156 70 140 52 120 64 C 130 56 148 64 146 86 Z" fill="${c}" opacity="0.8"/>`,
};

// Each avatar definition
const AVATARS = [
  {
    file: 'beyonce.svg',
    bg1: '#c8860a', bg2: '#5c2d00',
    hair: '#2a1200', hairStyle: 'long_wavy',
    skin: '#c68642', lips: '#cc2200',
    extra: '', // crown detail
  },
  {
    file: 'ladygaga.svg',
    bg1: '#9b2fff', bg2: '#1a0038',
    hair: '#e8e0d0', hairStyle: 'dramatic',
    skin: '#f0d5b8', lips: '#cc0044',
    extra: `<ellipse cx="88" cy="106" rx="6" ry="4" fill="#cc0044" opacity="0.7"/>
            <ellipse cx="112" cy="106" rx="6" ry="4" fill="#cc0044" opacity="0.7"/>`,
  },
  {
    file: 'madonna.svg',
    bg1: '#888', bg2: '#1a1a1a',
    hair: '#deb84a', hairStyle: 'voluminous',
    skin: '#f0d0b0', lips: '#dd1111',
    extra: '',
  },
  {
    file: 'britney.svg',
    bg1: '#ff79b0', bg2: '#2244aa',
    hair: '#e8d060', hairStyle: 'bob_y2k',
    skin: '#f5dcbc', lips: '#ff5588',
    extra: '',
  },
  {
    file: 'cher.svg',
    bg1: '#6600aa', bg2: '#0d0014',
    hair: '#0a0a0a', hairStyle: 'long_straight',
    skin: '#c8906a', lips: '#cc2255',
    extra: '',
  },
  {
    file: 'tovelo.svg',
    bg1: '#00ccaa', bg2: '#040f22',
    hair: '#ddd8a0', hairStyle: 'messy_blonde',
    skin: '#f0d0b8', lips: '#dd4488',
    extra: '',
  },
  {
    file: 'rihanna.svg',
    bg1: '#cc1111', bg2: '#2a0a00',
    hair: '#180808', hairStyle: 'sleek_dark',
    skin: '#8b5e3c', lips: '#cc1100',
    extra: '',
  },
  {
    file: 'taylor.svg',
    bg1: '#e8a0c0', bg2: '#3a1155',
    hair: '#d4b060', hairStyle: 'long_wavy',
    skin: '#f5dcbc', lips: '#cc1122',
    extra: '',
  },
  {
    file: 'ariana.svg',
    bg1: '#dd88cc', bg2: '#2a0050',
    hair: '#2a1808', hairStyle: 'high_ponytail',
    skin: '#f0d0b0', lips: '#dd6699',
    extra: '',
  },
  {
    file: 'dualipa.svg',
    bg1: '#2255ff', bg2: '#0a0030',
    hair: '#180a18', hairStyle: 'sleek_dark',
    skin: '#d4aa88', lips: '#cc3366',
    extra: '',
  },
  {
    file: 'miley.svg',
    bg1: '#8833cc', bg2: '#111133',
    hair: '#d0b840', hairStyle: 'messy_blonde',
    skin: '#f0d0b0', lips: '#cc3355',
    extra: '',
  },
  {
    file: 'christina.svg',
    bg1: '#e8c840', bg2: '#1a0808',
    hair: '#f0e8c0', hairStyle: 'voluminous',
    skin: '#f5dcbc', lips: '#dd1133',
    extra: '',
  },
  {
    file: 'kylie.svg',
    bg1: '#88ccff', bg2: '#0a1a44',
    hair: '#e0d890', hairStyle: 'bob_y2k',
    skin: '#f5dcbc', lips: '#cc4488',
    extra: '',
  },
  {
    file: 'shakira.svg',
    bg1: '#e8880a', bg2: '#3a0a00',
    hair: '#c8a020', hairStyle: 'curly_long',
    skin: '#c89060', lips: '#dd2200',
    extra: '',
  },
  {
    file: 'janet.svg',
    bg1: '#113388', bg2: '#040410',
    hair: '#0c0808', hairStyle: 'retro_waves',
    skin: '#7a4828', lips: '#cc2244',
    extra: '',
  },
  {
    file: 'mariah.svg',
    bg1: '#f0d0a0', bg2: '#6a2a00',
    hair: '#c8a858', hairStyle: 'long_wavy',
    skin: '#e8c8a0', lips: '#cc3344',
    extra: '',
  },
];

function buildSVG(a) {
  const hairSvg = HAIR[a.hairStyle]?.(a.hair) ?? HAIR.long_wavy(a.hair);

  // Simple eye shapes
  const eyeL = `<ellipse cx="87" cy="109" rx="5" ry="4" fill="#1a0808"/>
                <circle cx="88.5" cy="107.5" r="1.2" fill="white" opacity="0.7"/>`;
  const eyeR = `<ellipse cx="113" cy="109" rx="5" ry="4" fill="#1a0808"/>
                <circle cx="114.5" cy="107.5" r="1.2" fill="white" opacity="0.7"/>`;
  const brow  = `<path d="M 81 102 Q 87 99 93 102" fill="none" stroke="#1a0808" stroke-width="2" stroke-linecap="round"/>
                 <path d="M 107 102 Q 113 99 119 102" fill="none" stroke="#1a0808" stroke-width="2" stroke-linecap="round"/>`;
  const nose  = `<ellipse cx="100" cy="120" rx="3" ry="2" fill="${a.skin}" stroke="#00000020" stroke-width="1"/>`;
  const lips  = `<path d="M 89 130 Q 100 137 111 130 Q 100 140 89 130 Z" fill="${a.lips}"/>
                 <path d="M 89 130 Q 100 127 111 130" fill="none" stroke="${a.lips}" stroke-width="1.5"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="bg" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${a.bg1}"/>
      <stop offset="100%" stop-color="${a.bg2}"/>
    </radialGradient>
    <radialGradient id="face" cx="45%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${lighten(a.skin)}"/>
      <stop offset="100%" stop-color="${a.skin}"/>
    </radialGradient>
    <clipPath id="circle"><circle cx="100" cy="100" r="99"/></clipPath>
  </defs>

  <g clip-path="url(#circle)">
    <!-- background -->
    <rect width="200" height="200" fill="url(#bg)"/>

    <!-- hair back layer -->
    ${hairSvg}

    <!-- shoulders -->
    <ellipse cx="100" cy="208" rx="72" ry="52" fill="${darken(a.skin)}"/>

    <!-- neck -->
    <rect x="88" y="140" width="24" height="38" rx="6" fill="url(#face)"/>

    <!-- head -->
    <ellipse cx="100" cy="112" rx="36" ry="40" fill="url(#face)"/>

    <!-- hair crown (over top of head) -->
    <path d="M 64 82 Q 100 ${a.hairStyle === 'high_ponytail' ? 74 : 65} 136 82 Q 120 72 100 70 Q 80 72 64 82 Z" fill="${a.hair}" opacity="0.85"/>

    <!-- features -->
    ${brow}
    ${eyeL}
    ${eyeR}
    ${nose}
    ${lips}
    ${a.extra}
  </g>

  <!-- gold border -->
  <circle cx="100" cy="100" r="96" fill="none" stroke="#f5a623" stroke-width="5" opacity="0.85"/>
  <circle cx="100" cy="100" r="93" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.15"/>
</svg>`;
}

function lighten(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  const f = (v) => Math.min(255, v + 28).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
}

function darken(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  const f = (v) => Math.max(0, v - 30).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
}

for (const avatar of AVATARS) {
  const svg = buildSVG(avatar);
  const outPath = join(OUT, avatar.file);
  writeFileSync(outPath, svg, 'utf8');
  console.log(`✓ ${avatar.file}`);
}

console.log(`\nDone! ${AVATARS.length} avatars written to public/assets/avatars/`);
