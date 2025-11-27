import { useEffect } from 'react';

export default function useGsap(ref:any, animation?: (gsap:any)=>void, deps: any[] = []){
  useEffect(()=>{
    if(!ref?.current) return;
    let ctx:any = null;
    let gsap:any = null;
    let ScrollTrigger:any = null;
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
      if(ctx && ctx.revert) ctx.revert();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
