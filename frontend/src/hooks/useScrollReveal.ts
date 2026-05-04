import { useEffect, useRef, type RefObject } from 'react';

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(): RefObject<T> {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const root = containerRef.current ?? document.body;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px 80px 0px' }
    );

    const observeAll = () => {
      root.querySelectorAll<HTMLElement>(
        '.reveal, .reveal-left, .reveal-right, .reveal-scale'
      ).forEach((el) => {
        if (!el.classList.contains('active')) observer.observe(el);
      });
    };

    observeAll();

    // Pick up elements that render after data loads (e.g. featured properties from API)
    const mutObs = new MutationObserver(observeAll);
    mutObs.observe(root, { childList: true, subtree: true });

    return () => { observer.disconnect(); mutObs.disconnect(); };
  }, []);

  return containerRef;
}
