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

import BatsImage from 'src/assets/images/bats.svg';
import SpiderWebImage from 'src/assets/images/spider_web.svg';
import SpiderImage from 'src/assets/images/spider.svg';
import PumpkinImage from 'src/assets/images/pumpkin_plain.svg';
import SnowmanImage from 'src/assets/images/snowman_plain.svg';
import { JeopardyWheel } from 'src/wheel/JeopardyWheel';
import { ToastContext } from 'src/context/Toast';
import { useLocalStorage } from 'src/hooks';
import { playAudio, settings } from 'src/audio';
import {
  MAX_RECENT_ITEMS,
  CANVAS_WIDTH,
  CURRENT_THEME,
  THEMES,
} from 'src/constants';
import { celebrateSpecial, celebrateResults } from 'src/confetti';
import { Button } from '../Button';
import { SpinButton } from '../SpinButton';
import { Input } from '../Input';
import { ResultsToast, SpecialToast } from '../Toasts';
import { ExplodingImage } from '../ExplodingImage';
import { LoadingPlaceholder } from '../LoadingPlaceholder';

import styles from './App.module.css';

const ChristmasLights = lazy(() => import('../ChristmasLights'));

const wheel = new JeopardyWheel();

export const App = () => {
  const canvasContainer = useRef();
  const [pendingDelete, setPendingDelete] = useState(false);
  const [lastChosen, setLastChosen] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [ready, setReady] = useState(false);
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
    wheel
      .init(canvasContainer.current, setIsSpinning, storage.choices)
      .then(() => {
        setReady(true);
      })
      .catch((error) => {
        console.error(`There was an error during initialization: ${error}`);
      });
  }, []);

  // useCallback due to being in the dependency array
  const handleRemoveChoice = useCallback(
    (id) => {
      if (isSpinning) return;

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

  const addChoice = (label) => {
    if (isSpinning) return false;
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
      playAudio('buttonClick');

      wheel.spin((choice) => {
        setLastChosen(choice.label);

        // Play a special sound if the selection is special
        if (choice.special) {
          showToast(SpecialToast);
          playAudio('specialResults');
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
          playAudio('results');
          celebrateResults();
          setPendingDelete(true);
        }
      });
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
    if (isSpinning) return;

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

  const spinDisabled =
    isSpinning || pendingDelete || storage.choices.length === 0;

  return (
    <main>
      {!ready && <LoadingPlaceholder />}
      <div
        className={cx('opacity-0 transition-opacity duration-500', {
          'opacity-100': ready,
        })}
      >
        {CURRENT_THEME === THEMES.halloween && (
          <>
            <div className="flex fixed top-0 left-0 opacity-10 -z-10">
              <img src={SpiderWebImage} className="w-[500px] h-[500px]" />
            </div>
            <div className="flex fixed top-0 left-[320px] opacity-10 -z-10">
              <img src={SpiderImage} className="w-[300px] h-[300px]" />
            </div>
            <div className="flex fixed bottom-0 right-0 opacity-10 -z-10">
              <img src={BatsImage} className="w-[300px] h-[300px]" />
            </div>
          </>
        )}
        <div className={styles.title}>
          <span>Jeopardy Wheel</span>
          {CURRENT_THEME === THEMES.halloween && (
            <ExplodingImage src={PumpkinImage} width={48} height={48} />
          )}
          {CURRENT_THEME === THEMES.christmas && (
            <ExplodingImage src={SnowmanImage} width={48} height={48} />
          )}
        </div>
        <div className="flex flex-col items-center 2xl:flex-row 2xl:items-start px-8 gap-8 mb-8">
          <div className="flex-2 flex flex-col justify-center items-center">
            <div
              ref={canvasContainer}
              className={`w-full max-w-[${CANVAS_WIDTH}px]`}
            />
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
              <SpinButton onClick={handleSpinClick} disabled={spinDisabled}>
                Spin the Wheel
              </SpinButton>
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
                    disabled={isSpinning}
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
                    disabled={isSpinning}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primaryOutline"
                  disabled={isSpinning}
                >
                  Add Choice
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
                        className={cx(styles.recentBadge, {
                          [styles.disabled]: isSpinning,
                        })}
                        onClick={() => addChoice(label)}
                      >
                        <span>{label}</span>
                        <Button
                          onClick={(event) =>
                            handleRecentDeleteClick(event, id)
                          }
                          disabled={isSpinning}
                        >
                          <XMarkIcon width={20} height={20} />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="text-right">
                    <Button
                      className={styles.linkButton}
                      onClick={handleAddAllRecentClick}
                      disabled={isSpinning}
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
        {CURRENT_THEME === THEMES.christmas && (
          <Suspense fallback={null}>
            <ChristmasLights />
          </Suspense>
        )}
      </div>
    </main>
  );
};
