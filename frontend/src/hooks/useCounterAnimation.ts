import { useEffect, useRef, type RefObject } from 'react';

export function useCounterAnimation(
  target: number,
  duration = 2000,
  decimals = 0
): RefObject<HTMLElement> {
  const ref = useRef<HTMLElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const increment = target / (duration / 16);
            let current = 0;

            const update = () => {
              current += increment;
              if (current < target) {
                el.textContent = decimals > 0
                  ? current.toFixed(decimals)
                  : Math.floor(current).toLocaleString();
                requestAnimationFrame(update);
              } else {
                el.textContent = decimals > 0
                  ? target.toFixed(decimals)
                  : target.toLocaleString();
              }
            };

            update();
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  return ref;
}
