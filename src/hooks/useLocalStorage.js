import { useState } from 'react';

export const useLocalStorage = (key, defaultValue, onInit) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    let initialState = defaultValue;
    try {
      // Get from local storage by key
      const storedItem = window.localStorage.getItem(key);

      if (storedItem) {
        // For the top-level only, compare the stored properties to the initial value
        // and define them if they are undefined.
        initialState = Object.entries(defaultValue).reduce(
          (result, [key, value]) => {
            if (result[key] === undefined) {
              result[key] = value;
            }

            return result;
          },
          JSON.parse(storedItem)
        );
      }
    } catch (error) {
      // If error also return defaultValue
      console.warn(`Could not parse stored value: ${error}`);
    }

    onInit(initialState);
    return initialState;
  });

  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.warn(`Could not save stored value: ${error}`);
    }
  };
  return [storedValue, setValue];
};
