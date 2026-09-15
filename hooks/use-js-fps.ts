import { useEffect, useRef, useState } from 'react';

// Self-measured JS-thread FPS via requestAnimationFrame — rAF callbacks run
// on the JS thread, so when something blocks it synchronously (see
// blockJsThreadFor), this reading drops or freezes right along with it. A
// second, always-on witness alongside the dev-menu Perf Monitor's JS row —
// it cannot see the UI thread, which is exactly the point being drilled.
export function useJsFps(): number {
  const [fps, setFps] = useState(60);
  const frames = useRef(0);
  const windowStart = useRef(0);

  useEffect(() => {
    windowStart.current = Date.now();
    let raf: number;
    const tick = () => {
      frames.current += 1;
      const elapsed = Date.now() - windowStart.current;
      if (elapsed >= 500) {
        setFps(Math.round((frames.current * 1000) / elapsed));
        frames.current = 0;
        windowStart.current = Date.now();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return fps;
}
