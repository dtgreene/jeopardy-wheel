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

import { JeopardyWheel, canvasWidth } from 'src/classes/JeopardyWheel';
import { ModalContext } from 'src/context/Modal';
import { useLocalStorage } from 'src/hooks';
import { Button } from '../Button';
import { SpinButton } from '../SpinButton';
import { Input } from '../Input';
import { Dropdown } from '../Dropdown';
import { ResultsModal } from '../ResultsModal';

import SpinClickSoundSrc from 'src/assets/ClickyButton3b.wav';
import AirhornSoundSrc from 'src/assets/airhorn.ogg';

import styles from './App.module.css';

const palettes = [
  ['#ee6055', '#60d394', '#aaf683', '#ffd97d', '#ff9b85'],
  ['#071e22', '#1d7874', '#679289', '#f4c095', '#ee2e31'],
  ['#93b5c6', '#ddedaa', '#f0cf65', '#d7816a', '#bd4f6c'],
  ['#0b132b', '#1c2541', '#3a506b', '#5bc0be', '#6fffe9'],
  ['#202c39', '#283845', '#b8b08d', '#f2d492', '#f29559'],
  ['#006ba6', '#0496ff', '#ffbc42', '#d81159', '#8f2d56'],
];

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

const wheel = new JeopardyWheel(palettes[0]);
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
    muted: false,
    paletteIndex: 0,
  });
  const { open } = useContext(ModalContext);

  useEffect(() => {
    // initialize the wheel
    wheel.init(
      canvasRef.current,
      storage.choices,
      palettes[storage.paletteIndex]
    );
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

  const handleColorClick = (index) => {
    setStorage(
      produce((draft) => {
        draft.paletteIndex = index;
      })
    );
    // sync the wheel
    wheel.setPalette(palettes[index]);
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

    if (wheel.spinning) return;

    const formData = new FormData(event.target);
    const formObject = Object.fromEntries(formData);

    const choiceLabel = formObject.choice.trim();
    const duplicate = !!storage.choices.find(
      ({ label }) => label === choiceLabel
    );

    if (choiceLabel.length === 0) {
      return;
    } else if (duplicate) {
      setFormError('This choice has already been added');
      return;
    } else {
      // add the new choice
      setStorage(
        produce((draft) => {
          const value = draft.choices.concat({
            label: choiceLabel,
            id: nanoid(),
          });
          // mutate choices
          draft.choices = value;
          // sync wheel
          wheel.setChoices(value);
        })
      );
      // reset the form
      event.target.reset();
      // reset form errors
      setFormError();
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

  return (
    <div className="flex flex-col items-center 2xl:flex-row 2xl:items-start p-8 gap-8">
      <div className="flex-2 flex flex-col justify-center items-center">
        <canvas ref={canvasRef} className="w-full" style={canvasStyle} />
        <div className="w-full flex justify-center items-center relative border-t pt-6 border-neutral-600">
          <div className="absolute left-0 flex justify-between w-full">
            <div>
              <Dropdown label="Colors">
                {palettes.map((palette, index) => (
                  <Dropdown.Button
                    key={index}
                    onClick={() => handleColorClick(index)}
                  >
                    <div className="flex py-1 select-none">
                      {palette.map((hex) => (
                        <div
                          style={{ background: hex }}
                          className="w-6 h-6"
                          key={hex}
                        ></div>
                      ))}
                    </div>
                  </Dropdown.Button>
                ))}
              </Dropdown>
            </div>
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
          <div className="flex justify-between items-center gap-4">
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
        {formError && <div className="text-sm text-red-400">{formError}</div>}
      </div>
    </div>
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
