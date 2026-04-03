'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Cursor(){
  useEffect(()=>{
    if(window.matchMedia('(hover:none)').matches) return
    const dot=document.getElementById('C'), ring=document.getElementById('CR')
    if(!dot||!ring) return
    let mx=0,my=0,rx=0,ry=0
    document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY})
    const loop=()=>{
      dot.style.left=mx+'px'; dot.style.top=my+'px'
      rx+=(mx-rx)*.14; ry+=(my-ry)*.14
      ring.style.left=rx+'px'; ring.style.top=ry+'px'
      requestAnimationFrame(loop)
    }
    loop()
    const h=()=>ring.classList.add('h'), u=()=>ring.classList.remove('h')
    const obs=new MutationObserver(()=>document.querySelectorAll('a,button').forEach(el=>{
      el.addEventListener('mouseenter',h); el.addEventListener('mouseleave',u)
    }))
    obs.observe(document.body,{childList:true,subtree:true})
    document.querySelectorAll('a,button').forEach(el=>{
      el.addEventListener('mouseenter',h); el.addEventListener('mouseleave',u)
    })
    return()=>obs.disconnect()
  },[])
  return(
    <>
      <div id="C" className="fixed top-0 left-0 pointer-events-none"/>
      <div id="CR" className="fixed top-0 left-0 pointer-events-none"/>
    </>
  )
}

const NL=[
  {h:'#about',l:'About'},{h:'#research',l:'Research'},
  {h:'#skills',l:'Arsenal'},{h:'#timeline',l:'Timeline'},{h:'#contact',l:'Contact'},
]

export function Navbar(){
  const [sc,setSc]=useState(false)
  const [ac,setAc]=useState('')
  const [op,setOp]=useState(false)

  useEffect(()=>{
    const fn=()=>{
      setSc(window.scrollY>40)
      let c=''
      NL.forEach(({h})=>{
        const el=document.querySelector(h) as HTMLElement
        if(el&&window.scrollY>=el.offsetTop-200) c=h.slice(1)
      })
      setAc(c)
    }
    window.addEventListener('scroll',fn,{passive:true})
    return()=>window.removeEventListener('scroll',fn)
  },[])

  const go=(h:string)=>{
    document.querySelector(h)?.scrollIntoView({behavior:'smooth'})
    setOp(false)
  }

  return(
    <motion.nav initial={{y:-80,opacity:0}} animate={{y:0,opacity:1}}
      transition={{delay:.4,duration:.9,ease:[.16,1,.3,1]}}
      className={`fixed top-0 inset-x-0 z-[500] h-16 flex items-center justify-between px-8 md:px-14 transition-all duration-300 ${sc?'bg-[#02000a]/92 backdrop-blur-2xl border-b border-[#ff4400]/07':''}`}>

      <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} className="flex items-center gap-3 group">
        <span className="fb text-2xl text-[#ff4400] flicker" style={{textShadow:'0 0 20px rgba(255,68,0,0.8)'}}>ST</span>
        <span className="hidden md:block fm text-[9px] tracking-[3px] text-white/22 group-hover:text-white/50 transition-colors">SHASHANK · EE + DS</span>
      </button>

      <div className="hidden md:flex items-center gap-8">
        {NL.map(({h,l})=>(
          <button key={h} onClick={()=>go(h)}
            className={`fm text-[10px] tracking-[3px] uppercase relative pb-1 transition-colors duration-200 ${ac===h.slice(1)?'text-[#ff4400]':'text-white/28 hover:text-white/60'}`}>
            {l}
            <span className={`absolute bottom-0 left-0 h-px bg-[#ff4400] transition-all duration-300 ${ac===h.slice(1)?'w-full':'w-0'}`}/>
          </button>
        ))}
      </div>

      <a href="https://drive.google.com/file/d/1cUjC5Og_iEZFPVKDU8yOKNNsGtSwEyHw/view?usp=sharing"
        target="_blank" rel="noopener noreferrer"
        className="hidden md:flex fm text-[9px] tracking-[2px] uppercase px-4 py-2 border border-[#ff4400]/22 text-[#ff4400]/65 hover:border-[#ff4400] hover:text-[#ff4400] hover:bg-[#ff4400]/05 transition-all">
        ↓ Résumé
      </a>

      <button className="md:hidden flex flex-col gap-1.5 p-1" onClick={()=>setOp(!op)}>
        <span className={`block h-px w-6 bg-white/45 transition-all ${op?'rotate-45 translate-y-2':''}`}/>
        <span className={`block h-px w-4 bg-white/45 transition-opacity ${op?'opacity-0':''}`}/>
        <span className={`block h-px w-6 bg-white/45 transition-all ${op?'-rotate-45 -translate-y-2':''}`}/>
      </button>

      <AnimatePresence>
        {op&&(
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
            className="absolute top-16 inset-x-0 bg-[#02000a]/98 backdrop-blur-2xl border-b border-white/04 flex flex-col">
            {NL.map(({h,l})=>(
              <button key={h} onClick={()=>go(h)}
                className="px-8 py-4 fm text-[10px] tracking-[3px] text-white/35 hover:text-[#ff4400] text-left border-b border-white/04 transition-colors">{l}</button>
            ))}
            <a href="https://drive.google.com/file/d/1cUjC5Og_iEZFPVKDU8yOKNNsGtSwEyHw/view?usp=sharing"
              target="_blank" className="px-8 py-4 fm text-[10px] text-[#ff4400]/55">↓ RÉSUMÉ</a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
