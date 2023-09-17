import {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
  lazy,
  Suspense,
} from 'react';
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { nanoid } from 'nanoid';
import cx from 'classnames';
import produce from 'immer';

import PumpkinImage from 'src/assets/images/pumpkin_plain.svg';
import SnowmanImage from 'src/assets/images/snowman_plain.svg';
import { JeopardyWheel, canvasWidth } from 'src/wheel/JeopardyWheel';
import { ToastContext } from 'src/context/Toast';
import { useLocalStorage } from 'src/hooks';
import { playAudio, settings } from 'src/audio';
import { MAX_RECENT_ITEMS } from 'src/constants';
import { celebrateSpecial, celebrateResults } from 'src/confetti';
import { Button } from '../Button';
import { SpinButton } from '../SpinButton';
import { Input } from '../Input';
import { ResultsToast, SpecialToast } from '../Toasts';
import { ExplodingImage } from '../ExplodingImage';

import styles from './App.module.css';

const ChristmasLights = lazy(() => import('../ChristmasLights'));

const month = new Date().getMonth();
const isOctober = month === 10;
const isDecember = month === 12;

const wheel = new JeopardyWheel();
const canvasStyle = {
  minWidth: '300px',
  maxWidth: canvasWidth,
};

export const App = () => {
  const canvas = useRef();
  const [pendingDelete, setPendingDelete] = useState(false);
  const [lastChosen, setLastChosen] = useState(null);
  const [formError, setFormError] = useState('');
  const [storage, setStorage] = useLocalStorage(
    'jeopardy-wheel',
    {
      choices: [],
      history: [],
      muted: false,
    },
    (initialValue) => {
      // Synchronize the audio's muted variable with the storage value
      settings.muted = initialValue.muted;
    }
  );
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    wheel.init(canvas.current, storage.choices);
  }, []);

  // useCallback due to being in the dependency array
  const handleRemoveChoice = useCallback(
    (id) => {
      if (wheel.spinning) return;

      setStorage(
        produce((draft) => {
          // Filter out choices
          const value = draft.choices.filter((choice) => choice.id !== id);
          // Mutate choices
          draft.choices = value;
          // Sync wheel
          wheel.setChoices(value);
        })
      );
    },
    [setStorage]
  );

  useEffect(() => {
    // Subscribe to spin finish
    wheel.onFinishSpin((choice) => {
      setLastChosen(choice.label);

      // Play a special sound if the selection is special
      if (choice.special) {
        showToast(SpecialToast);
        playAudio('special');
        celebrateSpecial();
      } else {
        showToast(ResultsToast, {
          choice,
          onTimeout: () => {
            handleRemoveChoice(choice.id);
            setPendingDelete(false);
          },
          onCancel: () => setPendingDelete(false),
        });
        playAudio('success');
        celebrateResults();
        setPendingDelete(true);
      }
    });
  }, [handleRemoveChoice]);

  const addChoice = (label) => {
    if (wheel.spinning) return false;
    if (label.length === 0) return false;

    const isDuplicate = Boolean(
      storage.choices.find((choice) => choice.label === label)
    );

    if (isDuplicate) {
      setFormError('This choice has already been added');
      return false;
    } else {
      // Create the choice
      const nextChoice = { label, id: nanoid() };

      // Add the new choice
      setStorage(
        produce((draft) => {
          const value = draft.choices.concat(nextChoice);

          if (!draft.history) draft.history = [];

          const isHistoryDuplicate = Boolean(
            draft.history.find((value) => value.label === nextChoice.label)
          );

          // Append to the history
          if (!isHistoryDuplicate) {
            draft.history.unshift(nextChoice);

            draft.history = draft.history.slice(0, MAX_RECENT_ITEMS);
          }

          // Mutate choices
          draft.choices = value;
          // Sync wheel
          wheel.setChoices(value);
          // Reset form errors
          setFormError();
        })
      );
    }

    return true;
  };

  const handleMuteClick = () => {
    setStorage(
      produce((draft) => {
        const value = !draft.muted;
        draft.muted = value;
        settings.muted = value;
      })
    );
  };

  const handleChoiceSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const formObject = Object.fromEntries(formData);

    const label = formObject.choice.trim();

    if (addChoice(label)) {
      // Reset the form
      event.target.reset();
    }
  };

  const handleSpinClick = () => {
    if (!pendingDelete) {
      playAudio('spinClick');
      wheel.spin();
    }
  };

  const handleRecentDeleteClick = (event, id) => {
    event.stopPropagation();

    setStorage(
      produce((draft) => {
        draft.history = draft.history.filter((history) => history.id !== id);
      })
    );
  };

  const handleAddAllRecentClick = () => {
    if (wheel.spinning) return;

    const nonDuplicateItems = storage.history.filter(
      (history) =>
        !Boolean(storage.choices.find(({ label }) => label === history.label))
    );

    if (nonDuplicateItems.length > 0) {
      const newChoices = nonDuplicateItems.map(({ label }) => ({
        label,
        id: nanoid(),
      }));
      // Add the new choice
      setStorage(
        produce((draft) => {
          const value = draft.choices.concat(newChoices);
          // Mutate choices
          draft.choices = value;
          // Sync wheel
          wheel.setChoices(value);
          // Reset form errors
          setFormError();
        })
      );
    }
  };

  return (
    <main>
      <div className={styles.title}>
        <span>Jeopardy Wheel</span>
        {isOctober && (
          <ExplodingImage src={PumpkinImage} width={48} height={48} />
        )}
        {isDecember && (
          <ExplodingImage src={SnowmanImage} width={48} height={48} />
        )}
      </div>
      <div className="flex flex-col items-center 2xl:flex-row 2xl:items-start px-8 gap-8 mb-8">
        <div className="flex-2 flex flex-col justify-center items-center">
          <canvas ref={canvas} className="w-full" style={canvasStyle} />
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
          <div className="text-neutral-500 mb-2">Choices</div>
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
                  placeholder="Choice label"
                  autoComplete="off"
                />
              </div>
              <Button type="submit" variant="primaryOutline">
                <span>Add Choice</span>
              </Button>
            </div>
          </form>
          {formError && <div className="text-red-400 mb-4">{formError}</div>}
          <div className="text-neutral-500 mb-2">Recently added choices</div>
          <div className="mb-4 border border-neutral-600 rounded p-2">
            {storage.history.length === 0 ? (
              <div className="text-neutral-500">None</div>
            ) : (
              <>
                <div className="overflow-y-auto max-h-96 flex flex-wrap">
                  {storage.history.map(({ id, label }) => (
                    <div
                      key={id}
                      className="flex items-center gap-2 px-2 py-1 mb-2 mr-2 bg-sky-800 text-white rounded-full cursor-pointer hover:bg-sky-900 transition-colors"
                      onClick={() => addChoice(label)}
                    >
                      <span>{label}</span>
                      <Button
                        onClick={(event) => handleRecentDeleteClick(event, id)}
                      >
                        <XMarkIcon width={20} height={20} />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <Button
                    className="text-sky-500 hover:underline"
                    onClick={handleAddAllRecentClick}
                  >
                    Add all
                  </Button>
                </div>
              </>
            )}
          </div>
          <div className="text-neutral-500 mb-2">Last chosen</div>
          <div className="mb-4 border border-neutral-600 rounded p-2">
            {lastChosen ? (
              <div>{lastChosen}</div>
            ) : (
              <div className="text-neutral-500">None</div>
            )}
          </div>
        </div>
      </div>
      {isDecember && (
        <Suspense fallback={null}>
          <ChristmasLights />
        </Suspense>
      )}
    </main>
  );
};
