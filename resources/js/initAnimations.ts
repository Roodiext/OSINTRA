export interface InitResult {
  locomotive?: unknown;
  gsap?: unknown;
  ScrollTrigger?: unknown;
  scrollReveal?: unknown;
}

let _locomotiveInstance: unknown = null;
let _gsap: unknown = null;
let _ScrollTrigger: unknown = null;
let _scrollReveal: unknown = null;

export async function initAnimations(containerSelector?: string): Promise<InitResult> {
  const result: InitResult = {};

  // Locomotive Scroll (optional)
  try {
    const LocomotiveModule = await import('locomotive-scroll');
    const Locomotive = LocomotiveModule?.default ?? LocomotiveModule;
    const el = document.querySelector(containerSelector || '[data-scroll-container]') || document.scrollingElement || document.documentElement;
    _locomotiveInstance = new Locomotive({ el, smooth: true, lerp: 0.08 });
    result.locomotive = _locomotiveInstance;
  } catch {
    // Not fatal — library may be absent or environment not suitable
    // console.debug('Locomotive Scroll not initialized:', err);
  }

  // GSAP + ScrollTrigger (optional)
  try {
    const gsapModule = await import('gsap');
    _gsap = gsapModule?.default ?? gsapModule;

    // dynamic import of ScrollTrigger plugin
    try {
      const st = await import('gsap/ScrollTrigger');
      _ScrollTrigger = st?.ScrollTrigger ?? st?.default ?? st;
      if (_gsap && _ScrollTrigger) {
        _gsap.registerPlugin(_ScrollTrigger);
        _gsap.defaults({ ease: 'power2.out' });
        result.gsap = _gsap;
        result.ScrollTrigger = _ScrollTrigger;
      }
    } catch {
      // plugin not available — continue without it
      // console.debug('GSAP ScrollTrigger not available:', innerErr);
    }
  } catch {
    // console.debug('GSAP not initialized:', err);
  }

  // ScrollReveal (optional)
  try {
    const srModule = await import('scrollreveal');
    const sr = srModule?.default ?? srModule;
    _scrollReveal = sr();
    _scrollReveal.reveal('.sr', {
      distance: '24px',
      origin: 'bottom',
      duration: 700,
      interval: 80,
      scale: 1,
      opacity: 0,
      easing: 'cubic-bezier(.2,.8,.2,1)'
    });
    result.scrollReveal = _scrollReveal;
  } catch {
    // console.debug('ScrollReveal not initialized:', err);
  }

  return result;
}

export async function destroyAnimations(): Promise<void> {
  try {
    if (_locomotiveInstance && typeof _locomotiveInstance.destroy === 'function') {
      _locomotiveInstance.destroy();
      _locomotiveInstance = null;
    }
  } catch {
    // ignore
  }

  try {
    if (_scrollReveal && typeof _scrollReveal.destroy === 'function') {
      _scrollReveal.destroy();
      _scrollReveal = null;
    }
  } catch {
    // ignore
  }

  try {
    if (_gsap && _ScrollTrigger) {
      // attempt to kill ScrollTrigger instances
      try {
        if (_ScrollTrigger && typeof (_ScrollTrigger as { getAll?: () => unknown[] }).getAll === 'function') {
          ((_ScrollTrigger as { getAll: () => unknown[] }).getAll() || []).forEach((t: unknown) => {
            if (t && typeof (t as { kill?: () => void }).kill === 'function') {
              (t as { kill: () => void }).kill();
            }
          });
        }
      } catch { /* ignore */ }
      _gsap = null;
      _ScrollTrigger = null;
    }
  } catch {
    // ignore
  }
}
