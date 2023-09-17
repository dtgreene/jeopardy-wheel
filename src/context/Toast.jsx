import { createContext, useEffect, useState, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { nanoid } from 'nanoid';
import { Transition } from '@headlessui/react';

import { Button } from 'src/components/Button';
import { useMixedState } from 'src/hooks';

const AUTO_DISMISS_TIME = 8_000;

const Toast = ({ toast, onClose }) => {
  const { Component, props, id } = toast;
  const dismissTimeout = useRef(null);
  const closeTimeout = useRef(null);
  // Calculate the absolute closing time when the toast opens. Since the timeout
  // may need to be set multiple times (as onClose changes), this keeps the
  // total time it's open fixed.
  const closeTime = useRef(Date.now() + AUTO_DISMISS_TIME);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (dismissTimeout.current) {
      clearTimeout(dismissTimeout.current);
    }
    const millis = Math.max(closeTime.current - Date.now(), 0);
    dismissTimeout.current = setTimeout(() => {
      // The component needs to stay visible (show=true) for the fade out
      // transition to happen. This creates that delay
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current);
      }
      // Duration must match the transition time
      closeTimeout.current = setTimeout(() => onClose(id), 150);
      setShow(false);
    }, millis);
  }, [toast, onClose]);

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
      className="bg-gray-800 border border-gray-700 rounded px-4 py-3 pointer-events-auto w-[500px] relative"
    >
      <Component id={id} {...props} />
      <div className="absolute right-4 top-3">
        <Button onClick={() => onClose(id)}>
          <XMarkIcon width={20} height={20} />
        </Button>
      </div>
    </Transition>
  );
};

export const ToastContext = createContext({});
export const ToastProvider = ({ children }) => {
  const [toasts, toastsRef, setToasts] = useMixedState([]);

  const showToast = (Component, props) => {
    setToasts(toastsRef.current.concat({ Component, props, id: nanoid() }));
  };

  const closeToast = (id) => {
    setToasts(toastsRef.current.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, closeToast }}>
      <div className="fixed h-full w-full p-4 overflow-hidden flex flex-col items-end justify-start gap-4 z-10 pointer-events-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={closeToast} />
        ))}
      </div>
      {children}
    </ToastContext.Provider>
  );
};
