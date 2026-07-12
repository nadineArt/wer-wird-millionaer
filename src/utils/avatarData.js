export const AVATARS = [
  { id: 'beyonce',       name: 'Beyoncé',         file: 'beyonce.png' },
  { id: 'ladygaga',      name: 'Lady Gaga',        file: 'ladygaga.png' },
  { id: 'madonna',       name: 'Madonna',          file: 'madonna.png' },
  { id: 'britney',       name: 'Britney',          file: 'britney.png' },
  { id: 'cher',          name: 'Cher',             file: 'cher.png' },
  { id: 'tovelo',        name: 'Tove Lo',          file: 'tovelo.png' },
  { id: 'rihanna',       name: 'Rihanna',          file: 'rihanna.png' },
  { id: 'kylie',         name: 'Kylie',            file: 'kylie.png' },
  { id: 'mariah',        name: 'Mariah',           file: 'mariah.png' },
  { id: 'whitney',       name: 'Whitney',          file: 'whitney.png' },
  { id: 'ariana',        name: 'Ariana',           file: 'ariana.png' },
  { id: 'taylor',        name: 'Taylor',           file: 'taylor.png' },
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
