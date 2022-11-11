import { useEffect, useRef, useState } from 'react';
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { nanoid } from 'nanoid';
import { Howl, Howler } from 'howler';
import cx from 'classnames';

import { Button } from '../Button';
import { SpinButton } from '../SpinButton';
import { Input } from '../Input';
import { JeopardyWheel, canvasWidth } from 'src/classes/JeopardyWheel';
import { useLocalStorage } from 'src/hooks';
import SpinClickSoundSrc from 'src/assets/ClickyButton3b.wav';

import styles from './App.module.css';

const wheel = new JeopardyWheel();
const canvasStyle = {
  minWidth: '300px',
  maxWidth: canvasWidth,
};
let spinClickSound = null;

export const App = () => {
  const canvasRef = useRef();
  const [formError, setFormError] = useState('');
  const [choices, _setChoices] = useLocalStorage('jeopardy-items', []);
  const [lastTarget, setLastTarget] = useState(null);
  const [muted, setMuted] = useLocalStorage('jeopardy-muted', false);

  useEffect(() => {
    // initialize the wheel
    wheel.init(canvasRef.current, choices);
    // subscribe to target changes
    wheel.onTargetChange((id) => setLastTarget(id));
  }, []);

  const setChoices = (value) => {
    _setChoices(value);
    wheel.setChoices(value);
  };

  const handleMuteClick = () => {
    setMuted(!muted);
    // global howler mute
    Howler.mute(!muted);
  };

  const handleChoiceSubmit = (event) => {
    event.preventDefault();

    if (wheel.spinning) return;

    const formData = new FormData(event.target);
    const formObject = Object.fromEntries(formData);

    const choiceLabel = formObject.choice.trim();
    const duplicate = !!choices.find(({ label }) => label === choiceLabel);

    if (choiceLabel.length === 0) {
      return;
    } else if (duplicate) {
      setFormError('This choice has already been added');
      return;
    } else {
      // add the new choice
      setChoices(
        choices.concat({
          label: choiceLabel,
          id: nanoid(),
        })
      );
      // reset the form
      event.target.reset();
      // reset form errors
      setFormError();
    }
  };

  const handleRemoveChoice = (id) => {
    if (wheel.spinning) return;

    setChoices(choices.filter((choice) => choice.id !== id));
  };

  const handleSpinClick = () => {
    // create the click sound in response to a user gesture
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

  const handleDeleteClick = () => {
    if (lastTarget) {
      handleRemoveChoice(lastTarget);
    }
  };

  return (
    <div className="flex flex-col items-center 2xl:flex-row 2xl:items-start p-8 gap-8">
      <div className="w-full flex flex-col justify-center items-center">
        <canvas ref={canvasRef} className="w-full" style={canvasStyle} />
        <div className="w-full flex justify-center items-center relative border-t pt-6 border-gray-600">
          <SpinButton onClick={handleSpinClick}>Spin the Wheel</SpinButton>
          <div className="absolute right-0 flex items-center gap-2">
            <Button
              variant="secondaryOutline"
              onClick={handleDeleteClick}
              disabled={!lastTarget}
            >
              <TrashIcon width={20} height={20} />
            </Button>
            <Button variant="secondaryOutline" onClick={handleMuteClick}>
              <div
                className={cx('transition-colors', {
                  'text-red-500': muted,
                })}
              >
                {muted ? (
                  <SpeakerXMarkIcon width={20} height={20} />
                ) : (
                  <SpeakerWaveIcon width={20} height={20} />
                )}
              </div>
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="mb-4 border-b border-gray-600">Choices</div>
        <div className="mb-4 border border-gray-600 rounded overflow-y-auto max-h-96">
          {choices.length === 0 && (
            <div className="px-2 py-1 text-gray-500">
              No choices have been added
            </div>
          )}
          {choices.map(({ id, label }) => (
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
