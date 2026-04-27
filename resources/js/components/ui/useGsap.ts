import { useEffect } from 'react';

export default function useGsap(ref: React.RefObject<Element | null>, animation?: (gsap: unknown)=>void, deps: unknown[] = []){
  useEffect(()=>{
    if(!ref?.current) return;
    const ctx: unknown = null;
    let gsap: unknown = null;
    let ScrollTrigger: unknown = null;
    import('gsap')
      .then((m)=>{
        gsap = m.gsap || m.default || m;
        return import('gsap/ScrollTrigger');
      })
      .then((st)=>{
        ScrollTrigger = st.ScrollTrigger || st.default || st;
        if(gsap && ScrollTrigger){
          gsap.registerPlugin(ScrollTrigger);
        }
        if(animation){
          animation(gsap);
        }
      })
      .catch(()=>{
        // gsap not available
      });

    return ()=>{
      if(ctx && typeof (ctx as { revert?: () => void }).revert === 'function') (ctx as { revert: () => void }).revert();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
