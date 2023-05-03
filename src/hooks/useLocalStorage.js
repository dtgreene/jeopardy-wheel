import { useState } from 'react';

export const useLocalStorage = (key, defaultValue) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    try {
      // Get from local storage by key
      const storedItem = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      const result = storedItem ? JSON.parse(storedItem) : defaultValue;

      // For the top-level only, compare the stored properties to the initial value
      // and define them if they are undefined.
      Object.entries(defaultValue).forEach(([key, value]) => {
        if (result[key] === undefined) {
          result[key] = value;
        }
      });

      return result;
    } catch (error) {
      // If error also return defaultValue
      console.log(`Could not get stored value: ${error}`);
      return defaultValue;
    }
  });
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
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
      console.log(error);
    }
  };
  return [storedValue, setValue];
};
