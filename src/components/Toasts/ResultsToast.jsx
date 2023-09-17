import { useEffect, useRef, useState } from 'react';
import { Transition } from '@headlessui/react';

import styles from './ResultsToast.module.css';

const AUTO_REMOVE_TIME = 4_000;

export const ResultsToast = ({ choice, onTimeout, onCancel }) => {
  const removeTime = useRef(Date.now() + AUTO_REMOVE_TIME);
  const removeTimeout = useRef(null);
  const [removed, setRemoved] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (!cancelled) {
      // Cancel the current timeout
      if (removeTimeout.current) {
        clearTimeout(removeTimeout.current);
        removeTimeout.current = null;
      }

      // Only set the timeout if the user hasn't cancelled
      if (!cancelled) {
        const millis = Math.max(removeTime.current - Date.now(), 0);
        removeTimeout.current = setTimeout(() => {
          setRemoved(true);
          onTimeout();
        }, millis);
      }
    }

    // Could return a function to cancel the timeout when the user dismisses the
    // toast.
  }, [onTimeout]);

  const handleCancelClick = () => {
    if (!removed) {
      clearTimeout(removeTimeout.current);
      setCancelled(true);
      onCancel();
    }
  };

  return (
    <div>
      <div className={styles.choice}>{choice.label} was chosen!</div>
      {removed ? (
        <div className="text-gray-400">Choice was removed.</div>
      ) : (
        <>
          <div className="mb-2">This choice will be automatically removed.</div>
          {cancelled ? (
            <div>Auto-removal cancelled</div>
          ) : (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <Transition
                  appear
                  show
                  // Duration must match AUTO_REMOVE_TIME
                  enter="transition-all ease-linear duration-[4000ms]"
                  enterFrom="w-0"
                  enterTo="w-full"
                  className="w-0"
                >
                  <div className="bg-sky-600 h-2.5 w-full rounded-full"></div>
                </Transition>
              </div>
              <div
                className="text-sky-400 hover:underline cursor-pointer"
                onClick={handleCancelClick}
              >
                Click here to cancel
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
