import { useEffect, useState } from "react";

interface WatchPartyLocalStorage<T> {
  value: T;
  set: (newVal: T) => void;
  clear: () => void;
}

/**
 * Modular local storage hook for Watch Party feature.
 * Ensures independent management of Watch Party-related data.
 *
 * @param key - The key in localStorage, generic type T.
 * @param defaultValue - Default value if no localStorage entry exists.
 * @returns An object containing:
 *  - value: Current state (synced with localStorage).
 *  - set: Updates both React state & localStorage.
 *  - clear: Resets state to defaultValue and deletes localStorage key.
 */
export default function useWatchPartyLocalStorage<T>(
  key: string,
  defaultValue: T
): WatchPartyLocalStorage<T> {
  const [value, setValue] = useState<T>(defaultValue);

  // On mount, read stored Watch Party data
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR safeguard
    try {
      let stored = globalThis.localStorage.getItem(key); // Check for the key directly
      if (!stored && key === "id") {
        // Fallback: check for 'userId' if 'id' is missing
        stored = globalThis.localStorage.getItem("userId");
        console.log(`Fallback triggered: Retrieved "userId" for key "id".`);
      }
      if (stored) {
        console.log(`Found Watch Party storage value for "${key}":`, stored);
        setValue(JSON.parse(stored) as T);
      } else {
        console.log(`No Watch Party data found for key "${key}".`);
      }
    } catch (error) {
      console.error(
        `Error reading Watch Party localStorage key "${key}":`,
        error
      );
    }
  }, [key]);

  // Function to update both state and local storage
  const set = (newVal: T) => {
    console.log(`Saving Watch Party data - Key: "${key}", Value: "${newVal}"`);
    setValue(newVal);
    if (typeof window !== "undefined") {
      try {
        globalThis.localStorage.setItem(key, JSON.stringify(newVal));
      } catch (error) {
        console.error(`Error saving Watch Party data for key "${key}":`, error);
      }
    }
  };

  // Function to clear Watch Party storage
  const clear = () => {
    console.log(`Clearing Watch Party localStorage for key "${key}"`);
    setValue(defaultValue);
    if (typeof window !== "undefined") {
      try {
        globalThis.localStorage.removeItem(key);
      } catch (error) {
        console.error(
          `Error clearing Watch Party data for key "${key}":`,
          error
        );
      }
    }
  };

  return { value, set, clear };
}
