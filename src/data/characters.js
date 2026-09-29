export const CHARACTER_PORTRAITS = {
  Youssef: '/assets/characters/youssef.png',
  Yusef: '/assets/characters/youssef.png', // backend spelling variant seen in sample data
  Nadine: '/assets/characters/nadine.png',
  Tarek: '/assets/characters/tarek.png',
  'Tante Layla': '/assets/characters/tante-layla.png',
  Salma: '/assets/characters/salma.png',
  Mohamed: '/assets/characters/mohamed.png',
};

export const getPortrait = (characterName) =>
  CHARACTER_PORTRAITS[characterName] ?? '/assets/characters/default.png';