import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Elapsed seconds for the in-progress activity UI, with pause/resume that freezes the clock.
 */
export function useActivitySessionTimer() {
  const carrySec = useRef(0);
  const segmentStartMs = useRef(Date.now());
  const [paused, setPaused] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (paused) {
      return undefined;
    }
    const tick = () => {
      const sec =
        carrySec.current + Math.floor((Date.now() - segmentStartMs.current) / 1000);
      setElapsedSec(sec);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [paused]);

  const togglePause = useCallback(() => {
    if (paused) {
      segmentStartMs.current = Date.now();
      setPaused(false);
    } else {
      carrySec.current += Math.floor((Date.now() - segmentStartMs.current) / 1000);
      setPaused(true);
    }
  }, [paused]);

  return { elapsedSec, paused, togglePause };
}

export function formatActivityElapsedLabel(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
