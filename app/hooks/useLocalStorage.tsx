import { useEffect, useState } from "react";

interface LocalStorage<T> {
  value: T;
  set: (newVal: T) => void;
  clear: () => void;
}

/**
 * This custom function/hook safely handles SSR by checking
 * for the window before accessing browser localStorage.
 * IMPORTANT: It has a local react state AND a localStorage state.
 * When initializing the state with a default value,
 * clearing will revert to this default value for the state and
 * the corresponding token gets deleted in the localStorage.
 *
 * @param key - The key from localStorage, generic type T.
 * @param defaultValue - The default value if nothing is in localStorage yet.
 * @returns An object containing:
 *  - value: The current value (synced with localStorage).
 *  - set: Updates both react state & localStorage.
 *  - clear: Resets state to defaultValue and deletes localStorage key.
 */
export default function useLocalStorage<T>(
  key: string,
  defaultValue: T
): LocalStorage<T> {
  const [value, setValue] = useState<T>(defaultValue);

  // On mount, try to read the stored value
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR safeguard
    try {
      const stored = globalThis.localStorage.getItem(key);
      if (stored) {
        console.log(`Found value in localStorage for key "${key}":`, stored); // Debug log
        setValue(JSON.parse(stored) as T);
      } else {
        console.log(`No value found in localStorage for key "${key}".`);
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Simple setter that updates both state and localStorage
  const set = (newVal: T) => {
    console.log(`Saving to localStorage - Key: "${key}", Value: "${newVal}"`);
    setValue(newVal);
    if (typeof window !== "undefined") {
      try {
        globalThis.localStorage.setItem(key, JSON.stringify(newVal));
      } catch (error) {
        console.error(`Error saving to localStorage key "${key}":`, error);
      }
    }
  };

  // Removes the key from localStorage and resets the state
  const clear = () => {
    console.log(`Clearing value in localStorage for key "${key}"`);
    setValue(defaultValue);
    if (typeof window !== "undefined") {
      try {
        globalThis.localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error clearing localStorage key "${key}":`, error);
      }
    }
  };

  return { value, set, clear };
}
