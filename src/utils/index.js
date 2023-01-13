import { SeasonThemes } from "../constants";

export function noop() {}

export function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function getSeasonTheme() {
  switch(new Date().getMonth()) {
    case 11: {
      return SeasonThemes.CHRISTMAS;
    }
    default: return SeasonThemes.NONE;
  }
}