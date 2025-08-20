import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delayTime: number): T {
  const [debounceValue, setDebounceValue] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebounceValue(value);
    }, delayTime);

    return () => {
      clearTimeout(handle);
    };
  }, [value, delayTime]);
  return debounceValue;
}
