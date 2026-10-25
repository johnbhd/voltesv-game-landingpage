type RotationClockOptions = {
  now: () => number;
  schedule: (callback: () => void, delay: number) => number;
  cancel: (timer: number) => void;
  advance: () => void;
};

export function createRotationClock(options: RotationClockOptions) {
  const interval = 5000;
  let remaining = interval;
  let startedAt = 0;
  let timer: number | undefined;
  let disposed = false;

  function scheduleNext() {
    startedAt = options.now();
    timer = options.schedule(() => {
      timer = undefined;
      remaining = interval;
      options.advance();
      if (!disposed) {
        scheduleNext();
      }
    }, remaining);
  }

  function setRunning(running: boolean) {
    if (disposed) {
      return;
    }
    if (running && timer === undefined) {
      scheduleNext();
    } else if (!running && timer !== undefined) {
      remaining = Math.max(0, remaining - (options.now() - startedAt));
      options.cancel(timer);
      timer = undefined;
    }
  }

  function dispose() {
    setRunning(false);
    disposed = true;
  }

  return { setRunning, dispose };
}
