import { useEffect } from 'react';

export function usePrerenderReady(ready) {
  useEffect(() => {
    if (!ready || typeof document === 'undefined') {
      return undefined;
    }

    let timeoutId;
    const frame = window.requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => {
        document.dispatchEvent(new Event('render-event'));
      }, 450);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [ready]);
}
