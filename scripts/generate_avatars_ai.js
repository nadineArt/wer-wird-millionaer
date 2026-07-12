// Downloads AI-generated portrait images from pollinations.ai (free, no API key)
// Run with: node scripts/generate_avatars_ai.js

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'assets', 'avatars');
mkdirSync(OUT, { recursive: true });

const AVATARS = [
  {
    file: 'beyonce.jpg',
    prompt: 'glamorous female pop star inspired by Beyonce, golden stage lighting, long wavy hair, sparkling gold performance outfit, confident expression, studio portrait, photorealistic, high detail, dark background',
  },
  {
    file: 'ladygaga.jpg',
    prompt: 'avant-garde female pop star inspired by Lady Gaga, platinum blonde hair, dramatic theatrical makeup, futuristic fashion outfit, neon purple lighting, editorial portrait, photorealistic, high detail',
  },
  {
    file: 'madonna.jpg',
    prompt: 'iconic female pop queen inspired by Madonna, blonde hair, powerful fashion pose, black and silver outfit, dramatic studio lighting, 80s pop glamour meets modern elegance, photorealistic portrait',
  },
  {
    file: 'britney.jpg',
    prompt: 'female pop star inspired by Britney Spears, blonde hair, Y2K aesthetic, sparkling pink stage outfit, playful energetic expression, pink and blue lighting, photorealistic portrait',
  },
  {
    file: 'cher.jpg',
    prompt: 'legendary diva inspired by Cher, very long straight dark hair, dramatic glamour, sparkling black outfit, powerful pose, retro disco atmosphere, photorealistic portrait, dark moody lighting',
  },
  {
    file: 'tovelo.jpg',
    prompt: 'Scandinavian indie pop artist inspired by Tove Lo, messy blonde hair, edgy club aesthetic, dark outfit, neon light background, rebellious cool expression, photorealistic portrait',
  },
  {
    file: 'rihanna.jpg',
    prompt: 'stylish pop and RnB star inspired by Rihanna, sleek dark hair, luxury street fashion outfit, confident gaze, red and gold light accents, high-end editorial portrait, photorealistic',
  },
  {
    file: 'taylor.jpg',
    prompt: 'female singer-songwriter pop star inspired by Taylor Swift, blonde hair, red lipstick, elegant stage look, warm pastel colors, dreamy soft lighting, photorealistic portrait',
  },
  {
    file: 'ariana.jpg',
    prompt: 'modern pop singer inspired by Ariana Grande, long high ponytail, glamorous makeup, feminine stage outfit, pink and lavender background, soft studio lighting, photorealistic portrait',
  },
  {
    file: 'dualipa.jpg',
    prompt: 'dance pop star inspired by Dua Lipa, sleek dark brown hair, futuristic disco outfit, confident pose, neon blue club lights, modern glamorous portrait, photorealistic',
  },
  {
    file: 'miley.jpg',
    prompt: 'bold pop rock star inspired by Miley Cyrus, textured blonde hair, smoky eye makeup, edgy leather outfit, rebellious attitude, purple and silver lighting, photorealistic portrait',
  },
  {
    file: 'christina.jpg',
    prompt: 'powerhouse pop vocalist inspired by Christina Aguilera, platinum blonde hair, dramatic eye makeup, sparkling diva outfit, Hollywood glamour lighting, confident expression, photorealistic portrait',
  },
  {
    file: 'kylie.jpg',
    prompt: 'elegant dance pop diva inspired by Kylie Minogue, blonde hair, glittering silver disco outfit, elegant pose, silver and gold light reflections, luxury portrait, photorealistic',
  },
  {
    file: 'shakira.jpg',
    prompt: 'Latin pop star inspired by Shakira, long curly blonde hair, energetic expression, warm golden stage lighting, vibrant performance energy, photorealistic portrait',
  },
  {
    file: 'janet.jpg',
    prompt: 'legendary pop and RnB star inspired by Janet Jackson, dark hair, iconic black stage outfit, confident powerful expression, dramatic blue and purple lighting, photorealistic portrait',
  },
  {
    file: 'mariah.jpg',
    prompt: 'glamorous pop diva inspired by Mariah Carey, long wavy hair, elegant sparkling gown, warm golden lighting, luxury stage atmosphere, soft polished portrait, photorealistic',
  },
];

async function downloadImage(prompt, outPath) {
  const encoded = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&model=flux`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${outPath}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(outPath, buffer);
}

let done = 0;
for (const avatar of AVATARS) {
  const outPath = join(OUT, avatar.file);
  process.stdout.write(`[${done + 1}/${AVATARS.length}] ${avatar.file} … `);
  try {
    await downloadImage(avatar.prompt, outPath);
    console.log('✓');
  } catch (err) {
    console.log(`✗ (${err.message})`);
  }
  done++;
  // small pause to avoid hammering the API
  await new Promise(r => setTimeout(r, 800));
}

console.log(`\nFertig! Bilder in public/assets/avatars/`);
