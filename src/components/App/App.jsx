import { useEffect, useRef, useState } from 'react';
import {
  LockClosedIcon,
  LockOpenIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { nanoid } from 'nanoid';

import { Button } from '../Button';
import { Input } from '../Input';
import { JeopardyWheel } from 'src/classes/JeopardyWheel';
import { useLocalStorage } from 'src/hooks';

import styles from './App.module.css';

const wheel = new JeopardyWheel();

export const App = () => {
  const canvasRef = useRef();
  const [formError, setFormError] = useState('');
  const [choices, _setChoices] = useLocalStorage('jeopardy-items', []);
  const [lastTarget, setLastTarget] = useState(null);

  useEffect(() => {
    // initialize the wheel
    wheel.init(canvasRef.current, choices);
    // subscribe to target changes
    wheel.onTargetChange((id) => setLastTarget(id));
  }, []);

  const setChoices = (value) => {
    _setChoices(value);
    wheel.syncChoices(value);
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
    wheel.spin();
  };

  const handleDeleteClick = () => {
    if (lastTarget) {
      handleRemoveChoice(lastTarget);
    }
  };

  return (
    <div className="flex flex-col items-center 2xl:flex-row 2xl:items-start p-8 gap-8">
      <div className="flex-1 flex flex-col justify-center">
        <canvas ref={canvasRef} className="mb-4 border-b border-gray-600" />
        <div className="flex justify-center">
          <div className="flex gap-4">
            <Button variant="primary" onClick={handleSpinClick}>
              Spin the Wheel
            </Button>
            <Button
              className="flex items-center"
              variant="secondaryOutline"
              onClick={handleDeleteClick}
              disabled={!lastTarget}
            >
              <TrashIcon width={16} height={16} className="mr-2" />
              <span>Delete Current Choice</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1">
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
