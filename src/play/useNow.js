import { useEffect, useState } from "react";

/** The current time, refreshed every `intervalMs` while `active`; frozen otherwise. */
export function useNow(active, intervalMs = 200) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    if (!active) return undefined;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
  return now;
}
