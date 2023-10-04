export const THEMES = {
  halloween: 'halloween',
  christmas: 'christmas',
  default: 'default',
};
export const CURRENT_THEME = getTheme();
export const WHEEL_PALETTE = [
  { background: '#188399', color1: '#000', color2: '#fff' },
  { background: '#D44359', color1: '#000', color2: '#fff' },
  { background: '#E8A36A', color1: '#000', color2: '#fff' },
  { background: '#4C38A8', color1: '#000', color2: '#fff' },
  { background: '#9C3161', color1: '#000', color2: '#fff' },
];
export const MAX_RECENT_ITEMS = 30;
export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 768;

function getTheme() {
  const month = new Date().getMonth();

  switch (month) {
    case 9: {
      return THEMES.halloween;
    }
    case 11: {
      return THEMES.christmas;
    }
    default: {
      return THEMES.default;
    }
  }
}
