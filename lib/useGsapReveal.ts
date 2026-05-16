'use client';
import { useEffect, useRef, RefObject } from 'react';

export function useGsapReveal<T extends HTMLElement = HTMLElement>(): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;

    const init = async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      if (!ref.current) return;
      const el = ref.current;

      const items = el.querySelectorAll<HTMLElement>('[data-gsap]');
      if (items.length === 0) return;

      ctx = gsap.context(() => {
        items.forEach((item) => {
          const type = item.dataset.gsap || 'fade';
          const delay = parseFloat(item.dataset.gsapDelay || '0');
          const stagger = parseFloat(item.dataset.gsapStagger || '0');
          const duration = parseFloat(item.dataset.gsapDuration || '0.7');

          const fromVars: gsap.TweenVars = { opacity: 0, duration, ease: 'power3.out', delay };
          if (type === 'up') { fromVars.y = 40; }
          if (type === 'left') { fromVars.x = -40; }
          if (type === 'right') { fromVars.x = 40; }
          if (type === 'scale') { fromVars.scale = 0.85; }

          if (stagger > 0) {
            const children = Array.from(item.children) as HTMLElement[];
            gsap.from(children, {
              ...fromVars,
              stagger,
              scrollTrigger: {
                trigger: item,
                start: 'top 88%',
                once: true,
              },
            });
          } else {
            gsap.from(item, {
              ...fromVars,
              scrollTrigger: {
                trigger: item,
                start: 'top 88%',
                once: true,
              },
            });
          }
        });
      }, el);
    };

    init();
    return () => ctx?.revert();
  }, []);

  return ref;
}
