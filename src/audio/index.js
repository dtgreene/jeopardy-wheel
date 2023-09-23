import { Howl } from 'howler';

import SpinSrc from 'src/assets/audio/GenericButton3.wav';
import ButtonClickSrc from 'src/assets/audio/ButtonClick.wav';
import SpecialResultsSrc from 'src/assets/audio/SpecialResults.mp3';
import ResultsSrc from 'src/assets/audio/Results.wav';

export const settings = {
  muted: false,
};

const audioSources = {
  spin: {
    src: [SpinSrc],
    volume: 0.4,
  },
  buttonClick: {
    src: [ButtonClickSrc],
    volume: 0.6,
  },
  specialResults: {
    src: [SpecialResultsSrc],
    volume: 0.6,
  },
  results: {
    src: [ResultsSrc],
    volume: 0.6,
  },
};
const howls = {};

export function playAudio(key) {
  if (settings.muted) return;

  if (audioSources[key] !== undefined) {
    const { src, volume } = audioSources[key];
    if (howls[key] === undefined) {
      howls[key] = new Howl({ src, volume });
    }
    howls[key].play();
  } else {
    console.warn(`Tried to play unknown audio key: ${key}`);
  }
}
