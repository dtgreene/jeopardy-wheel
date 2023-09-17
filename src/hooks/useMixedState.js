import { useState, useRef } from 'react';

export const useMixedState = (initialValue) => {
  const [stateValue, setStateValue] = useState(initialValue);
  const refValue = useRef(initialValue);

  const setValue = (value) => {
    setStateValue(value);
    refValue.current = value;
  };

  return [stateValue, refValue, setValue];
};
