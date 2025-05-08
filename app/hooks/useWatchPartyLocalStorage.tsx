import useSessionStorage from "@/hooks/useSessionStorage";

interface WatchPartyStorage<T> {
  value: T;
  set: (newVal: T) => void;
  clear: () => void;
}

export default function useWatchPartyLocalStorage<T>(
  key: 'id' | 'token',
  defaultValue: T
): WatchPartyStorage<T> {
  const storageKey = key === "id" ? "userId" : key;
  const [value, setValue] = useSessionStorage<T>(storageKey, defaultValue);

  const clear = () => {
    try {
      sessionStorage.removeItem(storageKey);
      localStorage.removeItem(storageKey);
    } catch {}
    setValue(defaultValue);
  };

  return { value, set: setValue, clear };
}
