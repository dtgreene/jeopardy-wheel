export const THEMES = {
  halloween: 'halloween',
  christmas: 'christmas',
  default: 'default',
};
export const CURRENT_THEME = getTheme();
export const WHEEL_COLORS = [
  '#188399',
  '#D44359',
  '#E8A36A',
  '#4C38A8',
  '#9C3161',
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
