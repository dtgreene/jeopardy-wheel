import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import confetti from 'canvas-confetti';

import { ModalStates } from 'src/context/modal';
import { Button } from 'src/components/Button';
import { randomInRange } from 'src/utils';
import styles from './ResultsModal.module.css';

import SuccessSoundSrc from 'src/assets/success.wav';

const fireworkDuration = 3000;
const fireworkDefaults = {
  startVelocity: 30,
  spread: 360,
  ticks: 60,
  useWorker: true,
};
let successSound = null;
let fireworkEnd = 0;
let fireworkInterval = null;

export const ResultsModal = ({ modalState, close, onDelete, choice }) => {
  useEffect(() => {
    // delay until the modal transition is finished
    setTimeout(() => {
      fireworkEnd = Date.now() + fireworkDuration;
      fireworkInterval = setInterval(() => {
        let timeLeft = fireworkEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(fireworkInterval);
        }
        const particleCount = 50 * (timeLeft / fireworkDuration);
        // since particles fall down, start a bit higher than random
        confetti(
          Object.assign({}, fireworkDefaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          })
        );
        confetti(
          Object.assign({}, fireworkDefaults, {
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          })
        );
      }, 250);

      // create the sound in response to a user gesture
      // otherwise get an annoying warning
      if (!successSound) {
        successSound = new Howl({
          src: [SuccessSoundSrc],
          volume: 0.6,
          autoplay: true,
        });
      } else {
        successSound.play();
      }
    }, 150);

    return () => {
      if (fireworkInterval) {
        clearInterval(fireworkInterval);
        fireworkInterval = null;
      }
    };
  }, []);

  const handleDelete = () => {
    onDelete(choice.id);
    close();
  };

  const show = modalState === ModalStates.MOUNTED_AND_VISIBLE;

  return (
    <Transition
      appear
      show={show}
      enter="transition-opacity duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      as={Fragment}
    >
      <Dialog onClose={close} className="relative z-10">
        <div className="fixed inset-0 bg-neutral-900/75 transition-opacity" />
        <div className="fixed inset-0 z-10 flex justify-center items-center">
          <Dialog.Panel className={styles.panel}>
            <div className="mb-2">
              <Dialog.Title className="text-lg font-bold mb-2">
                Results
              </Dialog.Title>
              <Dialog.Description className="text-8xl text-center p-12">
                {choice?.label}
              </Dialog.Description>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={handleDelete} variant="primaryOutline">
                Delete
              </Button>
              <Button onClick={close} variant="primary">
                Dismiss
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};
