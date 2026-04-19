import { useState, useEffect } from 'react';

export function useCountdown() {
  const secsToMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
  };

  const [secs, setSecs] = useState(secsToMidnight);

  useEffect(() => {
    const id = setInterval(() => setSecs(secsToMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
