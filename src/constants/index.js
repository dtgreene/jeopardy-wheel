const WHEEL_COLORS_DEFAULT = [
  '#188399',
  '#D44359',
  '#E8A36A',
  '#4C38A8',
  '#9C3161',
];
const WHEEL_COLORS_DECEMBER = [
  '#FF0000',
  '#FF7878',
  '#FFFFFF',
  '#74D680',
  '#378b29',
];

export const THEMES = {
  halloween: 'halloween',
  christmas: 'christmas',
  default: 'default',
};
export const CURRENT_THEME = getTheme();
export const WHEEL_COLORS = getWheelColors(CURRENT_THEME);
export const MAX_RECENT_ITEMS = 30;
export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 768;

function getWheelColors(theme) {
  switch (theme) {
    case THEMES.christmas: {
      return WHEEL_COLORS_DECEMBER;
    }
    default: {
      return WHEEL_COLORS_DEFAULT;
    }
  }
}
function getTheme() {
  return THEMES.christmas;

  // const month = new Date().getMonth();

  // switch (month) {
  //   case 9: {
  //     return THEMES.halloween;
  //   }
  //   case 11: {
  //     return THEMES.christmas;
  //   }
  //   default: {
  //     return THEMES.default;
  //   }
  // }
}
