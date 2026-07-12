export const AVATARS = [
  { id: 'beyonce',       name: 'Beyoncé',          file: 'beyonce.jpg' },
  { id: 'ladygaga',      name: 'Lady Gaga',        file: 'ladygaga.jpg' },
  { id: 'madonna',       name: 'Madonna',          file: 'madonna.jpg' },
  { id: 'britney',       name: 'Britney',          file: 'britney.jpg' },
  { id: 'cher',          name: 'Cher',             file: 'cher.jpg' },
  { id: 'tovelo',        name: 'Tove Lo',          file: 'tovelo.jpg' },
  { id: 'rihanna',       name: 'Rihanna',          file: 'rihanna.jpg' },
  { id: 'kylie',         name: 'Kylie',            file: 'kylie.jpg' },
  { id: 'mariah',        name: 'Mariah',           file: 'mariah.jpg' },
  { id: 'ariana',        name: 'Ariana',           file: 'ariana.jpg' },
  { id: 'taylor',        name: 'Taylor',           file: 'taylor.jpg' },
  { id: 'dualipa',       name: 'Dua Lipa',         file: 'dualipa.jpg' },
  { id: 'miley',         name: 'Miley',            file: 'miley.jpg' },
  { id: 'christina',     name: 'Christina',        file: 'christina.jpg' },
  { id: 'shakira',       name: 'Shakira',          file: 'shakira.jpg' },
  { id: 'janet',         name: 'Janet',            file: 'janet.jpg' },
];

export function getAvatarSrc(avatarId) {
  const avatar = AVATARS.find(a => a.id === avatarId);
  if (!avatar) return 'assets/avatars/placeholder.png';
  return `assets/avatars/${avatar.file}`;
}

export function getAvatarName(avatarId) {
  const avatar = AVATARS.find(a => a.id === avatarId);
  return avatar ? avatar.name : avatarId;
}
