import { gsap, ScrollTrigger, SplitText, reduceMotion } from './motion';

// Animaciones genéricas: [data-reveal] (up | pop) y titulares [data-split]
if (!reduceMotion) {
  document.fonts.ready.then(() => {
    gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
      // Sin máscara: así no se recortan las tildes de las mayúsculas (Ó, Á…)
      const split = new SplitText(el, { type: 'chars' });
      gsap.from(split.chars, {
        yPercent: 70,
        opacity: 0,
        rotate: 8,
        duration: 0.9,
        stagger: 0.025,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });
    ScrollTrigger.refresh();
  });

  const reveal = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  reveal.forEach((el) => {
    const kind = el.dataset.reveal;
    const from = kind === 'pop' ? { scale: 0.4, rotate: -12 } : { y: 60 };
    gsap.fromTo(
      el,
      { opacity: 0, ...from },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: 0,
        duration: kind === 'pop' ? 1 : 0.9,
        ease: kind === 'pop' ? 'back.out(2)' : 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      },
    );
  });
} else {
  document.documentElement.classList.remove('js-anim');
}
