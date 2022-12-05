import { useState, createContext, useContext, useRef } from 'react';

import { noop } from 'src/utils';

// should match the exit animation duration
const leaveTime = 150;

export const ModalStates = {
  UNMOUNTED: 0,
  MOUNTED_AND_HIDDEN: 1,
  MOUNTED_AND_VISIBLE: 2,
};

export const ModalContext = createContext({
  open: noop,
  close: noop,
  modalState: ModalStates.UNMOUNTED,
  ref: {
    current: null,
  },
});

export const ModalProvider = ({ children }) => {
  const ref = useRef(null);
  const [modalState, setModalState] = useState(ModalStates.UNMOUNTED);

  const open = (component, props) => {
    if (modalState === ModalStates.MOUNTED_AND_VISIBLE) {
      return Promise.reject('Another modal is already open');
    }
    if (modalState === ModalStates.MOUNTED_AND_HIDDEN) {
      return Promise.reject('Another modal is currently opening/closing');
    }

    // indicate a transition
    setModalState(ModalStates.MOUNTED_AND_VISIBLE);
    // return a promise the component can wait on
    return new Promise((res, rej) => {
      ref.current = { component, props, res, rej };
    });
  };

  const close = (result) => {
    if (modalState === ModalStates.UNMOUNTED) {
      return Promise.reject('No modal is open');
    }
    if (modalState === ModalStates.MOUNTED_AND_HIDDEN) {
      return Promise.reject('Another modal is currently opening/closing');
    }

    // indicate a transition
    setModalState(ModalStates.MOUNTED_AND_HIDDEN);
    // transit to unmounted
    setTimeout(() => setModalState(ModalStates.UNMOUNTED), leaveTime);
    // resolve the opening promise with the result
    if (ref.current) {
      ref.current.res(result);
    }
  };

  return (
    <ModalContext.Provider
      value={{
        ref,
        modalState,
        open,
        close,
      }}
      children={children}
    />
  );
};

export const ModalPlaceholder = () => {
  const { ref, modalState, close } = useContext(ModalContext);

  if (modalState === ModalStates.UNMOUNTED || !ref.current) return null;

  const { component: Component, props } = ref.current;
  const modalProps = { ...props, modalState, close };
  return <Component {...modalProps} />;
};
