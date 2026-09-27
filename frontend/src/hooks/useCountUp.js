import { useEffect, useState } from "react";

// The figure counts up as the lap replays, easing out so it lands rather
// than stops. Reduced motion shows the final figure at once.
export function useCountUp(target, calm, ms = 1100) {
  const [value, setValue] = useState(calm ? target : 0);

  useEffect(() => {
    if (calm) {
      setValue(target);
      return undefined;
    }
    let frame;
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / ms);
      setValue(Math.round(target * (1 - Math.pow(1 - k, 4))));
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, calm, ms]);

  return value;
}
