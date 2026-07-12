export const AVATARS = [
  { id: 'beyonce',       name: 'Beyoncé',          file: 'beyonce.svg' },
  { id: 'ladygaga',      name: 'Lady Gaga',        file: 'ladygaga.svg' },
  { id: 'madonna',       name: 'Madonna',          file: 'madonna.svg' },
  { id: 'britney',       name: 'Britney',          file: 'britney.svg' },
  { id: 'cher',          name: 'Cher',             file: 'cher.svg' },
  { id: 'tovelo',        name: 'Tove Lo',          file: 'tovelo.svg' },
  { id: 'rihanna',       name: 'Rihanna',          file: 'rihanna.svg' },
  { id: 'kylie',         name: 'Kylie',            file: 'kylie.svg' },
  { id: 'mariah',        name: 'Mariah',           file: 'mariah.svg' },
  { id: 'ariana',        name: 'Ariana',           file: 'ariana.svg' },
  { id: 'taylor',        name: 'Taylor',           file: 'taylor.svg' },
  { id: 'dualipa',       name: 'Dua Lipa',         file: 'dualipa.svg' },
  { id: 'miley',         name: 'Miley',            file: 'miley.svg' },
  { id: 'christina',     name: 'Christina',        file: 'christina.svg' },
  { id: 'shakira',       name: 'Shakira',          file: 'shakira.svg' },
  { id: 'janet',         name: 'Janet',            file: 'janet.svg' },
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
