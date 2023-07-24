import { useEffect, useState } from "react";

export function useStorage(
  key,
  initialValue,
  mode = 'session'
) {
  const storage = mode === 'session' ? sessionStorage : localStorage;
  const val = JSON.parse(storage.getItem(key));
  const [value, setValue] = useState(val);

  const clearItem = () => {
    setValue(null);
    return storage.removeItem(key);
  };

  useEffect(() => {
    const val = storage.getItem(key);
    setValue(val);
  }, [key]);

  useEffect(() => {
    // 如果没有值就把初始值设置给它
    if (initialValue && !storage.getItem(key)) {
      setValue(initialValue);
      storage.setItem(key, JSON.stringify(initialValue));
    }
  }, [key]);

  useEffect(() => {
    if (value !== null) {
      storage.setItem(key, JSON.stringify(value));
    }
  }, [value]);
  return [value, setValue, clearItem];
}
