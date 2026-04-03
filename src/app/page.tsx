'use client'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import Cursor  from '@/components/ui/Cursor'
import Navbar  from '@/components/ui/Navbar'
import { Hero,About,Research,Skills,Timeline,Contact,Footer } from '@/components/sections/All'

const Blade = dynamic(()=>import('@/components/three/Blade'),{
  ssr:false,
  loading:()=>(
    <div className="fixed inset-0 z-[9999] bg-[#02000a] flex items-center justify-center flex-col gap-8">
      <div className="relative">
        <div className="w-px h-32 mx-auto bg-gradient-to-b from-transparent via-orange-500 to-transparent opacity-60 animate-pulse"/>
        <div className="absolute inset-0 blur-xl bg-orange-500/10 animate-pulse"/>
      </div>
      <p style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'9px',letterSpacing:'6px',color:'rgba(255,136,0,0.4)'}}>
        IGNITING...
      </p>
    </div>
  ),
})

export default function Page() {
  useEffect(()=>{
    let lenis:any
    const go=async()=>{
      const {default:Lenis}=await import('lenis')
      lenis=new Lenis({
        duration:1.4,
        easing:(t:number)=>Math.min(1,1.001-Math.pow(2,-10*t)),
        smoothWheel:true,
      })
      lenis.on('scroll',()=>{
        const el=document.getElementById('spb')
        if(el){
          const p=window.scrollY/(document.body.scrollHeight-window.innerHeight)
          el.style.width=Math.min(p*100,100)+'%'
        }
      })
      const raf=(t:number)=>{lenis.raf(t);requestAnimationFrame(raf)}
      requestAnimationFrame(raf)
    }
    go()
    return()=>lenis?.destroy()
  },[])

  return(
    <>
      <div id="grain"/><div id="vig"/><div id="spb"/>
      <Cursor/>
      <Blade/>
      <Navbar/>
      <main>
        <Hero/><About/><Research/><Skills/><Timeline/><Contact/><Footer/>
      </main>
    </>
  )
}
