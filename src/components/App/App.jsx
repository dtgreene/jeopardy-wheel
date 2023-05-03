import { useEffect, useRef, useState, useContext, useCallback } from 'react';
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { nanoid } from 'nanoid';
import { Howl, Howler } from 'howler';
import cx from 'classnames';
import produce from 'immer';
import confetti from 'canvas-confetti';

import SnowflakesImage from 'src/assets/snowflakes.png';
import { JeopardyWheel, canvasWidth } from 'src/classes/JeopardyWheel';
import { ModalContext } from 'src/context/Modal';
import { useLocalStorage } from 'src/hooks';
import { getSeasonTheme } from 'src/utils';
import { SeasonThemes, MAX_HISTORY_ITEMS } from 'src/constants';
import { Button } from '../Button';
import { SpinButton } from '../SpinButton';
import { Input } from '../Input';
import { ResultsModal } from '../ResultsModal';
import { ChristmasLights } from '../ChristmasLights';

import SpinClickSoundSrc from 'src/assets/ClickyButton3b.wav';
import AirhornSoundSrc from 'src/assets/airhorn.ogg';

import styles from './App.module.css';

const theme = getSeasonTheme();

const starSettings = {
  spread: 360,
  ticks: 50,
  gravity: 0,
  decay: 0.94,
  startVelocity: 30,
  shapes: ['star'],
  colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
  useWorker: true,
};

const wheel = new JeopardyWheel();
const canvasStyle = {
  minWidth: '300px',
  maxWidth: canvasWidth,
};
let spinClickSound = null;
let airhornSound = null;
export const App = () => {
  const canvasRef = useRef();
  const [formError, setFormError] = useState('');
  const [storage, setStorage] = useLocalStorage('jeopardy-wheel', {
    choices: [],
    history: [],
    muted: false,
  });
  const { open } = useContext(ModalContext);

  useEffect(() => {
    // initialize the wheel
    wheel.init(canvasRef.current, storage.choices);
    // mute
    if (storage.muted) {
      Howler.mute(storage.mute);
    }
  }, []);

  // useCallback due to being in the dependency array
  const handleRemoveChoice = useCallback(
    (id) => {
      if (wheel.spinning) return;

      setStorage(
        produce((draft) => {
          // filter out choices
          const value = draft.choices.filter((choice) => choice.id !== id);
          // mutate choices
          draft.choices = value;
          // sync wheel
          wheel.setChoices(value);
        })
      );
    },
    [setStorage]
  );

  useEffect(() => {
    // subscribe to spin finish
    wheel.onFinishSpin((choice) => {
      // play a special sound if the selection is special
      if (choice.special) {
        // create the sound in response to a user gesture
        // otherwise get an annoying warning
        if (!airhornSound) {
          airhornSound = new Howl({
            src: [AirhornSoundSrc],
            volume: 0.6,
            autoplay: true,
          });
        } else {
          airhornSound.play();
        }

        // stars
        for (let i = 0; i < 10; i++) {
          setTimeout(shootStars, i * 100);
        }
      } else {
        open(ResultsModal, { onDelete: handleRemoveChoice, choice });
      }
    });
  }, [handleRemoveChoice]);

  const addChoice = (label) => {
    if (wheel.spinning) return false;
    if (label.length === 0) return false;

    const isDuplicate = !!storage.choices.find(
      (choice) => choice.label === label
    );

    if (isDuplicate) {
      setFormError('This choice has already been added');
      return false;
    } else {
      // create the choice
      const nextChoice = { label, id: nanoid() };

      // add the new choice
      setStorage(
        produce((draft) => {
          const value = draft.choices.concat(nextChoice);

          if (!draft.history) draft.history = [];

          const isHistoryDuplicate = Boolean(
            draft.history.find((value) => value.label === nextChoice.label)
          );

          // append to the history
          if (!isHistoryDuplicate) {
            draft.history.unshift(nextChoice);

            draft.history = draft.history.slice(0, MAX_HISTORY_ITEMS);
          }

          // mutate choices
          draft.choices = value;
          // sync wheel
          wheel.setChoices(value);
          // reset form errors
          setFormError();
        })
      );
    }

    return true;
  };

  const handleMuteClick = () => {
    setStorage(
      produce((draft) => {
        draft.muted = !draft.muted;
      })
    );
    // global howler mute
    Howler.mute(!storage.muted);
  };

  const handleChoiceSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const formObject = Object.fromEntries(formData);

    const label = formObject.choice.trim();

    if (addChoice(label)) {
      // reset the form
      event.target.reset();
    }
  };

  const handleSpinClick = () => {
    // create the sound in response to a user gesture
    // otherwise get an annoying warning
    if (!spinClickSound) {
      spinClickSound = new Howl({
        src: [SpinClickSoundSrc],
        volume: 0.6,
        autoplay: false,
      });
    }
    spinClickSound.play();

    wheel.spin();
  };

  const handleRecentClick = (label) => {
    addChoice(label);
  };

  const handleRecentDeleteClick = (event, id) => {
    event.stopPropagation();

    setStorage(
      produce((draft) => {
        draft.history = draft.history.filter((history) => history.id !== id);
      })
    );
  };

  return (
    <main>
      <div className="flex flex-col items-center 2xl:flex-row 2xl:items-start p-8 gap-8 my-8">
        <div className="flex-2 flex flex-col justify-center items-center">
          <canvas ref={canvasRef} className="w-full" style={canvasStyle} />
          <div className="w-full flex justify-center items-center relative border-t pt-6 border-neutral-600">
            <div className="absolute left-0 flex justify-end w-full">
              <Button variant="secondaryOutline" onClick={handleMuteClick}>
                <div
                  className={cx('transition-colors', {
                    'text-red-500': storage.muted,
                  })}
                >
                  {storage.muted ? (
                    <SpeakerXMarkIcon width={20} height={20} />
                  ) : (
                    <SpeakerWaveIcon width={20} height={20} />
                  )}
                </div>
              </Button>
            </div>
            <SpinButton onClick={handleSpinClick}>Spin the Wheel</SpinButton>
          </div>
        </div>
        <div className="flex-1 w-full 2xl:w-auto">
          <div className="mb-4 border-b border-neutral-600">Choices</div>
          <div className="mb-4 border border-neutral-600 rounded overflow-y-auto max-h-96">
            {storage.choices.length === 0 && (
              <div className="px-2 py-1 text-neutral-500">
                No choices have been added
              </div>
            )}
            {storage.choices.map(({ id, label }) => (
              <div key={id} className={styles.listItem}>
                <span>{label}</span>
                <Button
                  className={styles.deleteButton}
                  onClick={() => handleRemoveChoice(id)}
                >
                  <XMarkIcon width={20} height={20} />
                </Button>
              </div>
            ))}
          </div>
          <form onSubmit={handleChoiceSubmit}>
            <div className="mb-4 flex justify-between items-center gap-4">
              <div className="flex-1">
                <Input
                  name="choice"
                  type="text"
                  placeholder="Enter an choice"
                  autoComplete="off"
                />
              </div>
              <Button type="submit" variant="primaryOutline">
                <span>Add Choice</span>
              </Button>
            </div>
          </form>
          <div className="mb-4 flex">
            <div className="text-neutral-500">Recently added options</div>
          </div>
          <div className="mb-4 border border-neutral-600 rounded overflow-y-auto max-h-96 flex flex-wrap pt-2 pl-2">
            {storage.history.length === 0 && (
              <div className="mb-2 mr-2 text-neutral-500">None</div>
            )}
            {storage.history.map(({ id, label }) => (
              <div
                key={id}
                className="flex items-center gap-2 px-2 py-1 mb-2 mr-2 bg-slate-800 text-gray-400 rounded-full cursor-pointer hover:bg-slate-700 transition-colors"
                onClick={() => handleRecentClick(label)}
              >
                <span>{label}</span>
                <Button onClick={(event) => handleRecentDeleteClick(event, id)}>
                  <XMarkIcon width={20} height={20} />
                </Button>
              </div>
            ))}
          </div>
          {formError && <div className="text-sm text-red-400">{formError}</div>}
          {theme === SeasonThemes.CHRISTMAS && (
            <div className="flex justify-end mt-24 relative">
              <img src={SnowflakesImage} />
            </div>
          )}
        </div>
      </div>
      {theme === SeasonThemes.CHRISTMAS && <ChristmasLights />}
    </main>
  );
};

function shootStars() {
  confetti({
    ...starSettings,
    particleCount: 40,
    scalar: 1.2,
    shapes: ['star'],
  });
  confetti({
    ...starSettings,
    particleCount: 10,
    scalar: 0.75,
    shapes: ['circle'],
  });
}
