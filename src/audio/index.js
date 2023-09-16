import { Howl } from 'howler';

import SpinSrc from 'src/assets/audio/GenericButton3.wav';
import SpinClickSrc from 'src/assets/audio/ClickyButton3b.wav';
import AirhornSrc from 'src/assets/audio/airhorn.ogg';
import SuccessSrc from 'src/assets/audio/success.wav';

export const settings = {
  muted: false,
};

const audioSources = {
  spin: {
    src: [SpinSrc],
    volume: 0.4,
  },
  spinClick: {
    src: [SpinClickSrc],
    volume: 0.6,
  },
  airhorn: {
    src: [AirhornSrc],
    volume: 0.6,
  },
  success: {
    src: [SuccessSrc],
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
