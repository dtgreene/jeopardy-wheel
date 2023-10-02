const WHEEL_COLORS_DEFAULT = [
  '#188399',
  '#D44359',
  '#E8A36A',
  '#4C38A8',
  '#9C3161',
];
const WHEEL_COLORS_OCTOBER = [
  '#37303B',
  '#862FE0',
  '#88E032',
  '#FB702D',
  '#FFC341',
];
const WHEEL_COLORS_DECEMBER = [
  '#FF0000',
  '#FF7878',
  '#FFFFFF',
  '#74D680',
  '#378b29',
];

function getWheelColors() {
  switch (new Date().getMonth()) {
    case 9: {
      return WHEEL_COLORS_OCTOBER;
    }
    case 11: {
      return WHEEL_COLORS_DECEMBER;
    }
    default: {
      return WHEEL_COLORS_DEFAULT;
    }
  }
}
export const WHEEL_COLORS = getWheelColors();
export const MAX_RECENT_ITEMS = 30;
export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 768;
