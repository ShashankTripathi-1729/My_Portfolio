'use client'
/* ═══════════════════════════════════════════════════════════════
   ALL SECTIONS — Fire Force / One Piece / AOT / COTE aesthetic
   Every section = a chapter. Every detail = pre-planned.
═══════════════════════════════════════════════════════════════ */

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

/* ══ SHARED SECTION HEADER ═══════════════════════════════════ */
function CH({ch,title,acc='#ff4400'}:{ch:string;title:string;acc?:string}){
  return(
    <div className="mb-16">
      <motion.div initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}}
        transition={{duration:.6}} viewport={{once:true}}
        className="flex items-center gap-4 mb-5">
        <span className="fm text-[9px] tracking-[5px]" style={{color:`${acc}55`}}>{ch}</span>
        <span className="flex-1 h-px" style={{background:`linear-gradient(90deg,${acc}40,transparent)`}}/>
      </motion.div>
      <motion.h2
        initial={{opacity:0,y:48,clipPath:'inset(0 0 100% 0)'}}
        whileInView={{opacity:1,y:0,clipPath:'inset(0 0 0% 0)'}}
        transition={{duration:1.1,ease:[.16,1,.3,1]}}
        viewport={{once:true}}
        className="fb leading-none"
        style={{fontSize:'clamp(3rem,7vw,6.5rem)',letterSpacing:'.04em'}}
        dangerouslySetInnerHTML={{__html:title}}
      />
      <motion.div initial={{scaleX:0}} whileInView={{scaleX:1}}
        transition={{duration:1,ease:[.16,1,.3,1],delay:.3}}
        viewport={{once:true}}
        className="mt-4 h-[2px] w-24 origin-left"
        style={{background:`linear-gradient(90deg,${acc},transparent)`}}
      />
    </div>
  )
}

/* ══ HERO ════════════════════════════════════════════════════ */
export function Hero(){
  const cv=useRef<HTMLCanvasElement>(null)

  useEffect(()=>{
    const c=cv.current; if(!c)return
    const ctx=c.getContext('2d')!
    let W=0,H=0,raf:number
    const m={x:-999,y:-999}
    const resize=()=>{W=c.width=c.offsetWidth;H=c.height=c.offsetHeight}
    resize()

    // Ember particle
    class Ember{
      x=0;y=0;vx=0;vy=0;r=0;a=0;hue=0;life=1;decay=0
      constructor(){this.init()}
      init(){
        this.x=Math.random()*W; this.y=H+10
        this.vx=(Math.random()-.5)*.8; this.vy=-(Math.random()*.6+.2)
        this.r=Math.random()*2.5+.5; this.life=1
        this.decay=Math.random()*.003+.001
        this.a=Math.random()*.6+.2
        this.hue=Math.random()>0.6?50:Math.random()>0.5?30:10  // gold/orange/red
      }
      update(){
        const dx=this.x-m.x,dy=this.y-m.y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<160){this.vx+=dx/d*.04;this.vy-=.02}
        this.vx*=.995; this.vy*=.995
        this.x+=this.vx; this.y+=this.vy
        this.life-=this.decay
        if(this.life<=0||this.y<-10) this.init()
      }
      draw(){
        ctx.save(); ctx.globalAlpha=this.a*this.life
        const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r*4)
        g.addColorStop(0,`hsla(${this.hue},100%,85%,1)`)
        g.addColorStop(.5,`hsla(${this.hue},100%,55%,.6)`)
        g.addColorStop(1,`hsla(${this.hue},100%,35%,0)`)
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(this.x,this.y,this.r*4,0,Math.PI*2); ctx.fill()
        ctx.restore()
      }
    }

    const embers=Array.from({length:160},()=>new Ember())
    document.addEventListener('mousemove',e=>{m.x=e.clientX;m.y=e.clientY})
    window.addEventListener('resize',resize,{passive:true})

    const draw=()=>{
      ctx.clearRect(0,0,W,H)
      // Hot connections between nearby embers
      for(let i=0;i<embers.length;i++){
        for(let j=i+1;j<embers.length;j++){
          const dx=embers[i].x-embers[j].x,dy=embers[i].y-embers[j].y,d=Math.sqrt(dx*dx+dy*dy)
          if(d<90){
            ctx.save(); ctx.globalAlpha=(1-d/90)*.12
            ctx.strokeStyle=d<45?'#ff8800':'#ff4400'
            ctx.lineWidth=.5; ctx.beginPath()
            ctx.moveTo(embers[i].x,embers[i].y); ctx.lineTo(embers[j].x,embers[j].y); ctx.stroke()
            ctx.restore()
          }
        }
      }
      embers.forEach(e=>{e.update();e.draw()})
      raf=requestAnimationFrame(draw)
    }
    draw()
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize)}
  },[])

  const fu=(d:number)=>({hidden:{opacity:0,y:40},visible:{opacity:1,y:0,transition:{delay:d,duration:.9,ease:[.16,1,.3,1]}}})

  return(
    <section id="hero" className="S relative h-screen flex items-center overflow-hidden bg-[#02000a]">
      <canvas ref={cv} className="absolute inset-0 w-full h-full"/>

      {/* Lava glow from bottom */}
      <div className="absolute bottom-0 inset-x-0 h-64 pointer-events-none"
        style={{background:'linear-gradient(to top,rgba(255,68,0,0.08),transparent)'}}/>

      {/* Giant BG kanji — 炎 (flame) */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 fb select-none pointer-events-none"
        style={{fontSize:'clamp(200px,30vw,440px)',color:'transparent',WebkitTextStroke:'1px rgba(255,68,0,0.035)',lineHeight:1}}>
        炎
      </div>

      <div className="relative z-10 px-10 md:px-20 max-w-5xl">
        <motion.div variants={fu(.1)} initial="hidden" animate="visible" className="flex items-center gap-3 mb-5">
          <span className="w-8 h-px" style={{background:'linear-gradient(90deg,transparent,#ff4400)'}}/>
          <span className="fm text-[9px] tracking-[5px] text-[#ff8800]/50 uppercase">Dual Degree · RGIPT + IIT Madras</span>
          <span className="w-8 h-px" style={{background:'linear-gradient(90deg,#ff4400,transparent)'}}/>
        </motion.div>

        <motion.h1 variants={fu(.2)} initial="hidden" animate="visible"
          className="fb leading-[.85] mb-6" style={{fontSize:'clamp(60px,11vw,148px)',letterSpacing:'.03em'}}>
          <span className="block gfire flicker" style={{filter:'drop-shadow(0 0 40px rgba(255,136,0,0.6))'}}>SHASHANK</span>
          <span className="block text-white/10" style={{WebkitTextStroke:'1px rgba(255,68,0,0.35)'}}>TRIPATHI</span>
        </motion.h1>

        <motion.p variants={fu(.34)} initial="hidden" animate="visible"
          className="fm text-[11px] tracking-[3px] text-white/30 mb-5 flex flex-wrap items-center gap-3">
          <span style={{color:'#ff8800'}}>Power Electronics</span>
          <span className="text-white/15">✦</span>
          <span style={{color:'#88ccff'}}>Data Science</span>
          <span className="text-white/15">✦</span>
          <span style={{color:'#ffcc00'}}>Model-Free MPC</span>
        </motion.p>

        <motion.div variants={fu(.44)} initial="hidden" animate="visible" className="flex flex-wrap gap-2 mb-10">
          {[['SiC / GaN','#ff4400'],['Adaptive Control','#cc44ff'],['IEEE Manuscripts','#ffcc00'],['HIL Validation','#88ccff']].map(([l,c])=>(
            <span key={l} className="fm text-[8px] tracking-[2px] px-3 py-1.5 uppercase"
              style={{border:`1px solid ${c}28`,color:c,background:`${c}07`}}>{l}</span>
          ))}
        </motion.div>

        <motion.div variants={fu(.56)} initial="hidden" animate="visible" className="flex flex-wrap gap-4">
          <button onClick={()=>document.getElementById('about')?.scrollIntoView({behavior:'smooth'})}
            className="group relative overflow-hidden fb text-xl tracking-[.1em] px-10 py-4 text-[#02000a] cursor-none">
            <span className="absolute inset-0 transition-transform duration-500"
              style={{background:'linear-gradient(135deg,#ff4400,#ff8800)'}}/>
            <span className="absolute inset-0 translate-x-full group-hover:translate-x-0 transition-transform duration-500"
              style={{background:'linear-gradient(135deg,#ffcc00,#ff8800)'}}/>
            <span className="relative z-10">ENTER THE DOMAIN</span>
          </button>
          <a href="https://drive.google.com/file/d/1cUjC5Og_iEZFPVKDU8yOKNNsGtSwEyHw/view?usp=sharing"
            target="_blank" rel="noopener noreferrer"
            className="fm text-[10px] tracking-[2px] px-6 py-4 border border-[#ff4400]/22 text-[#ff4400]/60 hover:border-[#ff4400] hover:text-[#ff4400] transition-all uppercase">
            ↓ Résumé
          </a>
        </motion.div>
      </div>

      {/* Stats bar */}
      <motion.div initial={{y:60,opacity:0}} animate={{y:0,opacity:1}}
        transition={{delay:1.1,duration:.8,ease:[.16,1,.3,1]}}
        className="absolute bottom-0 inset-x-0 flex"
        style={{background:'rgba(2,0,10,.82)',backdropFilter:'blur(24px)',borderTop:'1px solid rgba(255,68,0,.09)'}}>
        {[{n:'2',l:'Degrees Active',c:'#88ccff'},{n:'3',l:'Research Projects',c:'#ff8800'},{n:'2',l:'Manuscripts Prep',c:'#ffcc00'},{n:'∞',l:'LTspice Sims',c:'#00ff87'}].map(({n,l,c},i)=>(
          <div key={l} className="flex-1 py-4 px-5 text-center border-r border-[#ff4400]/05 last:border-r-0">
            <div className="fb text-3xl" style={{color:c,textShadow:`0 0 20px ${c}90`,letterSpacing:'.05em'}}>{n}</div>
            <div className="fm text-[7px] tracking-[2px] text-white/18 mt-1 uppercase">{l}</div>
          </div>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 opacity-30"
        style={{writingMode:'vertical-rl'}}>
        <div className="w-px h-14" style={{background:'linear-gradient(to bottom,#ff4400,transparent)',animation:'flame-wave 2s ease-in-out infinite'}}/>
        <span className="fm text-[7px] tracking-[3px] text-white/25">SCROLL</span>
      </div>
    </section>
  )
}

/* ══ ABOUT ═══════════════════════════════════════════════════ */
export function About(){
  return(
    <section id="about" className="S py-32 px-10 md:px-20 bg-[#02000a]">
      {/* Lava crack divider */}
      <motion.div initial={{scaleX:0}} whileInView={{scaleX:1}}
        transition={{duration:1.4,ease:[.16,1,.3,1]}} viewport={{once:true}}
        className="w-full h-px mb-20 origin-left"
        style={{background:'linear-gradient(90deg,#ff2200,#ff8800,#ffcc00,transparent)'}}/>

      <div className="max-w-6xl mx-auto">
        <CH ch="CHAPTER 01" title={"WHO I <span class=\"gfire\">AM</span>"} acc="#ff4400"/>

        <div className="grid md:grid-cols-[1.4fr,1fr] gap-16 items-start">
          <div>
            {[
              `I'm an undergraduate researcher at the intersection of <strong>power electronics</strong> and <strong>intelligent control systems</strong> — running two degrees simultaneously because the field demanded it.`,
              `My mission: make power converters <strong>autonomous and adaptive</strong>. I replace rigid mathematical plant models with real-time, model-free control — from SiC/GaN gate driver optimization to hardware-in-the-loop experimental validation.`,
              `Two review manuscripts are in preparation targeting <strong>IEEE Transactions</strong> and <strong>Elsevier</strong>. DC-DC converter hardware validation is actively underway with experimental rig planned.`,
            ].map((t,i)=>(
              <motion.p key={i} initial={{opacity:0,x:-40}} whileInView={{opacity:1,x:0}}
                transition={{duration:.8,delay:i*.1,ease:[.16,1,.3,1]}} viewport={{once:true}}
                className="text-[15px] text-white/42 leading-[2.1] mb-5 font-light fr"
                dangerouslySetInnerHTML={{__html:t.replace(/<strong>/g,'<strong class="text-white font-semibold">')}}/>
            ))}

            <motion.div initial={{opacity:0}} whileInView={{opacity:1}}
              transition={{duration:.8,delay:.4}} viewport={{once:true}}
              className="mt-8 pt-6 border-t border-[#ff4400]/07">
              {[
                {ic:'⚡',t:'B.Tech Electronics Engineering — RGIPT, Amethi (2024–Present)'},
                {ic:'📊',t:'BS Data Science & Applications — IIT Madras Online (2023–Present)'},
                {ic:'📄',t:'2 Manuscripts in Preparation — IEEE Transactions · Elsevier'},
                {ic:'📍',t:'Based in Raebareli, Uttar Pradesh, India'},
              ].map(({ic,t},i)=>(
                <motion.div key={t} initial={{opacity:0,x:-24}} whileInView={{opacity:1,x:0}}
                  transition={{duration:.6,delay:.5+i*.08,ease:[.16,1,.3,1]}} viewport={{once:true}}
                  className="flex items-start gap-3 mb-4 text-[13px] text-white/32 font-light fr">
                  <span className="flex-shrink-0 mt-0.5">{ic}</span><span>{t}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{opacity:0,x:50}} whileInView={{opacity:1,x:0}}
            transition={{duration:.9,delay:.2,ease:[.16,1,.3,1]}} viewport={{once:true}}
            className="grid grid-cols-2 gap-3">
            {[{v:'2',l:'Degrees\nActive',c:'#88ccff'},{v:'3',l:'Research\nProjects',c:'#ff8800'},{v:'2',l:'Manuscripts\nin Prep',c:'#ffcc00'},{v:'∞',l:'LTspice\nSims',c:'#00ff87'}].map(({v,l,c})=>(
              <motion.div key={l} whileHover={{scale:1.04,y:-4}} transition={{type:'spring',stiffness:400,damping:20}}
                className="relative overflow-hidden p-6 border border-white/04"
                style={{background:`linear-gradient(135deg,rgba(255,255,255,.014) 0%,${c}05 100%)`}}>
                <div className="absolute top-0 inset-x-0 h-px"
                  style={{background:`linear-gradient(90deg,transparent,${c},transparent)`,opacity:.5}}/>
                <div className="fb text-5xl mb-2" style={{color:c,textShadow:`0 0 28px ${c}90`,letterSpacing:'.05em'}}>{v}</div>
                <div className="fm text-[8px] tracking-[2px] text-white/22 uppercase whitespace-pre-line leading-relaxed">{l}</div>
              </motion.div>
            ))}
            <motion.div whileHover={{scale:1.01}} className="col-span-2 flex items-center gap-3 px-4 py-3 border border-[#00ff87]/10">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ff87] flex-shrink-0"
                style={{boxShadow:'0 0 10px #00ff87,0 0 20px rgba(0,255,135,0.4)',animation:'pulse-f 2s infinite'}}/>
              <span className="fm text-[9px] tracking-[3px] text-[#00ff87]/45">AVAILABLE FOR COLLABORATION</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ══ RESEARCH ════════════════════════════════════════════════ */
const RES=[
  {n:'01',t:'Active Gate Driver Technologies',s:'Comprehensive Review & Analysis',st:'IEEE / Elsevier · In Prep',c:'#88ccff',
   d:'Systematic review of active gate driving for Si MOSFETs, SiC MOSFETs, and GaN HEMTs. dv/dt & di/dt shaping for EMI mitigation and switching loss optimization. Comparative analysis of open-loop, closed-loop, and adaptive AGD architectures. First draft complete.',
   tags:['SiC MOSFETs','GaN HEMTs','EMI Mitigation','Switching Loss','Adaptive Control','dv/dt Control']},
  {n:'02',t:'Model-Free MPC',s:'Methods & Applications in Power Electronics',st:'Preparing Submission',c:'#cc44ff',
   d:'Full taxonomy of MF-MPC frameworks eliminating dependency on explicit plant models. Ultra-local models, data-driven linearization, and learning-based MPC applied to motor drives and DC-DC converters under parameter uncertainty.',
   tags:['Model-Free Control','Ultra-Local Models','Motor Drives','DC-DC Converters','Data-Driven MPC']},
  {n:'03',t:'DC-DC Converter Optimization',s:'Control-Oriented Modeling & Transient Analysis',st:'Ongoing',c:'#ffcc00',
   d:'Switching transient analysis for buck, boost, and buck-boost in LTspice. State-space modeling with duty-ratio sensitivity in MATLAB/Simulink. Closed-loop stability, ripple analysis, load-adaptive control. Hardware validation planned.',
   tags:['LTspice','MATLAB/Simulink','Buck/Boost','State-Space','Transient Analysis']},
]

export function Research(){
  const [op,setOp]=useState<number|null>(null)
  return(
    <section id="research" className="S py-32 px-10 md:px-20 bg-[#0f0500]">
      <motion.div initial={{scaleX:0}} whileInView={{scaleX:1}}
        transition={{duration:1.4,ease:[.16,1,.3,1]}} viewport={{once:true}}
        className="w-full h-px mb-20 origin-left"
        style={{background:'linear-gradient(90deg,#ff8800,#ffcc00,#88ccff,transparent)'}}/>
      <div className="max-w-5xl mx-auto">
        <CH ch="CHAPTER 02" title={"WHAT I'M <span class=\"gice\">FORGING</span>"} acc="#88ccff"/>
        <div className="flex flex-col gap-3">
          {RES.map((r,i)=>(
            <motion.div key={r.n}
              initial={{x:-90,opacity:0,skewX:'2deg'}} whileInView={{x:0,opacity:1,skewX:'0deg'}}
              transition={{duration:.85,ease:[.16,1,.3,1],delay:i*.09}} viewport={{once:true,amount:.1}}
              className="relative overflow-hidden border border-white/05 cursor-pointer group"
              style={{background:'rgba(255,255,255,.013)'}}
              onClick={()=>setOp(op===i?null:i)}>

              {/* Left accent — fire gradient */}
              <motion.div className="absolute left-0 inset-y-0 w-[3px]"
                style={{background:`linear-gradient(to bottom,transparent,${r.c},transparent)`}}
                initial={{scaleY:0}} whileInView={{scaleY:1}}
                transition={{duration:.6,delay:i*.09+.3}} viewport={{once:true}}/>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{background:`radial-gradient(ellipse at top left,${r.c}07 0%,transparent 55%)`}}/>
              <div className="absolute right-5 bottom-2 fb text-[72px] pointer-events-none select-none"
                style={{color:'rgba(255,255,255,.02)',lineHeight:1,letterSpacing:'.05em'}}>{r.n}</div>

              <div className="relative z-10 p-7">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="fm text-[8px] tracking-[2px] px-3 py-1 border inline-block mb-3"
                      style={{color:r.c,borderColor:`${r.c}28`,background:`${r.c}07`}}>{r.st}</span>
                    <h3 className="fc text-xl md:text-2xl font-bold text-white">{r.t}</h3>
                    <p className="fm text-[10px] tracking-[2px] mt-1" style={{color:r.c}}>{r.s}</p>
                  </div>
                  <motion.div animate={{rotate:op===i?45:0}}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-white/10 text-white/28 fm text-sm mt-1">+</motion.div>
                </div>
                <AnimatePresence>
                  {op===i&&(
                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}}
                      exit={{height:0,opacity:0}} transition={{duration:.45,ease:[.16,1,.3,1]}} className="overflow-hidden">
                      <p className="text-white/42 text-[13px] leading-relaxed font-light pt-3 mb-4 border-t border-white/05 fr">{r.d}</p>
                      <div className="flex flex-wrap gap-2">
                        {r.tags.map(tg=><span key={tg} className="fm text-[8px] px-2.5 py-1 border border-white/06 text-white/28 hover:border-white/20 hover:text-white/55 transition-all">{tg}</span>)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {op!==i&&(
                  <div className="flex flex-wrap gap-2">
                    {r.tags.slice(0,3).map(tg=><span key={tg} className="fm text-[8px] px-2.5 py-1 border border-white/05 text-white/18">{tg}</span>)}
                    {r.tags.length>3&&<span className="fm text-[8px] text-white/12">+{r.tags.length-3}</span>}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══ SKILLS ══════════════════════════════════════════════════ */
const CATS=[
  {ic:'⚡',t:'Simulation & Design',s:'Circuit & system modelling',c:'#ffcc00',
   sk:[{n:'LTspice',v:88},{n:'MATLAB',v:85},{n:'Simulink',v:83},{n:'AutoCAD',v:65}]},
  {ic:'💻',t:'Programming',s:'Languages & data stack',c:'#00ff87',
   sk:[{n:'Python',v:92},{n:'C / Embedded',v:70},{n:'SQL',v:68},{n:'Java',v:60}]},
  {ic:'🎛️',t:'Control Theory',s:'Methods & frameworks',c:'#88ccff',
   sk:[{n:'Model Predictive Control',v:82},{n:'Model-Free Control',v:80},{n:'Adaptive Control',v:75},{n:'Closed-Loop Analysis',v:78}]},
  {ic:'🔌',t:'Hardware & Systems',s:'Devices & platforms',c:'#cc44ff',
   sk:[{n:'Power Electronics',v:80},{n:'Gate Driver Design',v:78},{n:'FPGA Development',v:62},{n:'HIL Validation',v:68}]},
]
const TOOLS=[
  {n:'LTspice',c:'#ffcc00'},{n:'MATLAB',c:'#ffcc00'},{n:'Simulink',c:'#ffcc00'},
  {n:'Python',c:'#00ff87'},{n:'NumPy/SciPy',c:'#00ff87'},{n:'Pandas',c:'#00ff87'},
  {n:'C/Embedded',c:'#00ff87'},{n:'FPGA Boards',c:'#88ccff'},{n:'HIL Validation',c:'#88ccff'},
  {n:'Microcontrollers',c:'#88ccff'},{n:'LaTeX',c:'#cc44ff'},{n:'Git/GitHub',c:'#cc44ff'},
  {n:'Jupyter',c:'#cc44ff'},{n:'PostgreSQL',c:'#00ff87'},{n:'Java',c:'#00ff87'},{n:'AutoCAD',c:'#ffcc00'},
]
function Bar({name,val,col,delay}:{name:string;val:number;col:string;delay:number}){
  const ref=useRef<HTMLDivElement>(null)
  const iv=useInView(ref,{once:true,amount:.5})
  return(
    <div ref={ref} className="mb-3">
      <div className="flex justify-between mb-1.5">
        <span className="fm text-[10px] text-white/42">{name}</span>
        <span className="fm text-[10px]" style={{color:col}}>{val}</span>
      </div>
      <div className="relative h-px bg-white/05 overflow-hidden">
        <motion.div className="absolute inset-y-0 left-0 h-full"
          style={{background:`linear-gradient(90deg,${col}80,${col})`,boxShadow:`0 0 8px ${col}`}}
          initial={{width:'0%'}} animate={iv?{width:`${val}%`}:{width:'0%'}}
          transition={{duration:1.8,ease:[.16,1,.3,1],delay}}/>
        {iv&&<motion.div className="absolute inset-y-0 w-[35%]"
          style={{background:'linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent)'}}
          initial={{left:'-35%'}} animate={{left:'140%'}}
          transition={{duration:1.1,ease:'easeOut',delay:delay+.5}}/>}
      </div>
    </div>
  )
}
export function Skills(){
  return(
    <section id="skills" className="S py-32 px-10 md:px-20 bg-[#02000a]">
      <motion.div initial={{scaleX:0}} whileInView={{scaleX:1}}
        transition={{duration:1.4,ease:[.16,1,.3,1]}} viewport={{once:true}}
        className="w-full h-px mb-20 origin-left"
        style={{background:'linear-gradient(90deg,#cc44ff,#88ccff,#ffcc00,transparent)'}}/>
      <div className="max-w-6xl mx-auto">
        <CH ch="CHAPTER 03" title={"MY <span class=\"gsoul\">ARSENAL</span>"} acc="#cc44ff"/>
        {/* Scan bar */}
        <motion.div initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}
          className="relative border border-[#88ccff]/10 px-5 py-3 mb-10 overflow-hidden"
          style={{background:'rgba(136,204,255,.015)'}}>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse"/>
            <span className="fm text-[9px] tracking-[4px] text-[#88ccff]/42">SKILL MATRIX LOADING — 4 DOMAINS · 16 MODULES</span>
          </div>
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{background:'linear-gradient(180deg,transparent,rgba(136,204,255,.06),transparent)'}}
            animate={{y:['-100%','200%']}} transition={{duration:2.5,ease:'linear',repeat:Infinity,repeatDelay:4}}/>
        </motion.div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-12">
          {CATS.map((cat,ci)=>(
            <motion.div key={cat.t}
              initial={{y:60,opacity:0,scale:.9}} whileInView={{y:0,opacity:1,scale:1}}
              transition={{duration:.8,ease:[.16,1,.3,1],delay:ci*.08}} viewport={{once:true,amount:.1}}
              whileHover={{y:-6}}
              className="relative overflow-hidden border border-white/05 p-6"
              style={{background:`linear-gradient(135deg,rgba(255,255,255,.014) 0%,${cat.c}05 100%)`}}>
              <div className="absolute top-0 left-[15%] right-[15%] h-px"
                style={{background:`linear-gradient(90deg,transparent,${cat.c},transparent)`,opacity:.45}}/>
              <div className="absolute inset-0 pointer-events-none"
                style={{background:`radial-gradient(circle at top center,${cat.c} 0%,transparent 65%)`,opacity:.05}}/>
              <div className="relative z-10">
                <div className="text-xl mb-3">{cat.ic}</div>
                <div className="fc text-[13px] font-bold text-white mb-1">{cat.t}</div>
                <div className="fm text-[8px] tracking-[1px] text-white/22 mb-5">{cat.s}</div>
                {cat.sk.map((sk,si)=><Bar key={sk.n} name={sk.n} val={sk.v} col={cat.c} delay={ci*.1+si*.08}/>)}
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} transition={{duration:.8}} viewport={{once:true}}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <span className="fm text-[9px] tracking-[4px] text-white/22">FULL STACK</span>
            <div className="flex items-center gap-5 flex-wrap fm text-[8px] text-white/22">
              {[['#ffcc00','Simulation'],['#00ff87','Code'],['#88ccff','Hardware'],['#cc44ff','Dev']].map(([c,l])=>(
                <span key={l} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{background:c,boxShadow:`0 0 5px ${c}`}}/>{l}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {TOOLS.map((t,i)=>(
              <motion.div key={t.n}
                initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}}
                transition={{duration:.35,delay:(i%8)*.04}} viewport={{once:true}}
                whileHover={{y:-3,scale:1.06}}
                className="flex items-center gap-2 px-3 py-2 border border-white/05 bg-white/[.01] fm text-[9px] text-white/32 cursor-default transition-all duration-200"
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor=`${t.c}38`;el.style.color=t.c;el.style.background=`${t.c}07`}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='';el.style.color='';el.style.background=''}}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:t.c,boxShadow:`0 0 4px ${t.c}`}}/>
                {t.n}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ══ TIMELINE ════════════════════════════════════════════════ */
const EVT=[
  {yr:'2023',p:'2023 — PRESENT',t:'BS Data Science & Applications',o:'IIT Madras · Online Programme',
   d:"Full undergraduate degree in data science. ML, statistics, data engineering, programming. Running concurrently with B.Tech.",
   s:'ACTIVE',sc:'#00ff87',c:'#88ccff',tags:['Machine Learning','Statistics','Python','Data Engineering']},
  {yr:'2024',p:'2024 — PRESENT',t:'B.Tech Electronics Engineering',o:'RGIPT · Amethi, Uttar Pradesh',
   d:'Power electronics, control systems, embedded hardware. Research track: SiC/GaN devices and intelligent converter control.',
   s:'ACTIVE',sc:'#00ff87',c:'#cc44ff',tags:['Power Electronics','Control Systems','SiC/GaN','Embedded']},
  {yr:'2025',p:'2025 — PRESENT',t:'IEEE / Elsevier Manuscripts',o:'IEEE Transactions · Elsevier Journals',
   d:'Two review manuscripts in preparation. Active Gate Drivers for WBG devices. Model-Free MPC for Power Electronics. Both Q1 targets.',
   s:'IN REVIEW',sc:'#ffcc00',c:'#ffcc00',tags:['IEEE Transactions','Elsevier','WBG Devices','Model-Free MPC']},
  {yr:'2025',p:'ONGOING',t:'DC-DC Hardware Validation',o:'RGIPT Research Lab',
   d:'Building experimental validation platform. LTspice simulation complete. MATLAB modeling in progress. Hardware rig fabrication planned.',
   s:'ONGOING',sc:'#88ccff',c:'#ff4400',tags:['LTspice','MATLAB','Hardware','Validation']},
]
function TN({ev,i}:{ev:typeof EVT[0];i:number}){
  const ref=useRef<HTMLDivElement>(null)
  const iv=useInView(ref,{once:true,amount:.25})
  return(
    <motion.div ref={ref}
      initial={{opacity:0,x:i%2===0?-60:60}} animate={iv?{opacity:1,x:0}:{}}
      transition={{duration:.9,ease:[.16,1,.3,1],delay:i*.1}}
      className="relative flex gap-7 pb-12 last:pb-0">
      <div className="flex flex-col items-center flex-shrink-0">
        <motion.div animate={iv?{boxShadow:[`0 0 0px ${ev.c}00`,`0 0 24px ${ev.c}90`,`0 0 12px ${ev.c}50`]}:{}}
          transition={{duration:.8,delay:i*.1+.4}}
          className="w-5 h-5 rounded-full border-2 bg-[#0f0500] z-10 flex items-center justify-center"
          style={{borderColor:ev.c}}>
          <motion.div animate={iv?{scale:[0,1.6,1]}:{scale:0}}
            transition={{duration:.5,delay:i*.1+.5}}
            className="w-2 h-2 rounded-full" style={{background:ev.c}}/>
        </motion.div>
        <motion.div className="w-px flex-1 mt-2"
          style={{background:`linear-gradient(to bottom,${ev.c}50,transparent)`}}
          initial={{scaleY:0,originY:0}} animate={iv?{scaleY:1}:{}}
          transition={{duration:.9,delay:i*.1+.3}}/>
      </div>
      <motion.div whileHover={{x:6}} transition={{type:'spring',stiffness:400,damping:30}}
        className="flex-1 relative border border-white/05 p-6 -mt-1 group overflow-hidden"
        style={{background:'rgba(255,255,255,.011)'}}>
        <div className="absolute left-0 inset-y-0 w-[2px]"
          style={{background:`linear-gradient(to bottom,transparent,${ev.c},transparent)`}}/>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{background:`radial-gradient(ellipse at top left,${ev.c}06 0%,transparent 60%)`}}/>
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
            <div>
              <span className="fm text-[9px] tracking-[2px] mr-3" style={{color:ev.c}}>{ev.p}</span>
              <span className="fm text-[7px] tracking-[2px] px-2 py-0.5 border"
                style={{color:ev.sc,borderColor:`${ev.sc}22`,background:`${ev.sc}07`}}>◉ {ev.s}</span>
            </div>
            <span className="fb text-[44px]" style={{color:`${ev.c}14`,lineHeight:1,letterSpacing:'.05em'}}>{ev.yr}</span>
          </div>
          <h3 className="fc text-[17px] font-bold text-white mb-1">{ev.t}</h3>
          <p className="fm text-[10px] tracking-[1px] mb-3" style={{color:ev.c}}>{ev.o}</p>
          <p className="text-white/32 text-[13px] leading-relaxed font-light mb-4 fr">{ev.d}</p>
          <div className="flex flex-wrap gap-2">
            {ev.tags.map(tg=><span key={tg} className="fm text-[8px] px-2 py-0.5 border border-white/05 text-white/18">{tg}</span>)}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
export function Timeline(){
  return(
    <section id="timeline" className="S py-32 px-10 md:px-20 bg-[#0f0500]">
      <motion.div initial={{scaleX:0}} whileInView={{scaleX:1}}
        transition={{duration:1.4,ease:[.16,1,.3,1]}} viewport={{once:true}}
        className="w-full h-px mb-20 origin-left"
        style={{background:'linear-gradient(90deg,#ff4400,#ffcc00,#00ff87,transparent)'}}/>
      <div className="max-w-3xl mx-auto">
        <CH ch="CHAPTER 04" title={"MY <span class=\"ggold\">JOURNEY</span>"} acc="#ffcc00"/>
        <div className="relative">
          <motion.div className="absolute left-[10px] top-3 bottom-0 w-px"
            style={{background:'linear-gradient(to bottom,#88ccff,#cc44ff,#ffcc00,transparent)',opacity:.18}}
            initial={{scaleY:0,originY:0}} whileInView={{scaleY:1}}
            transition={{duration:1.5}} viewport={{once:true}}/>
          {EVT.map((e,i)=><TN key={e.t} ev={e} i={i}/>)}
        </div>
      </div>
    </section>
  )
}

/* ══ CONTACT ════════════════════════════════════════════════ */
function Rocket(){
  const ref=useRef<HTMLCanvasElement>(null)
  const iv=useInView(ref,{once:true})
  useEffect(()=>{
    if(!iv)return
    const cv=ref.current; if(!cv)return
    const ctx=cv.getContext('2d')!
    cv.width=cv.offsetWidth; cv.height=cv.offsetHeight
    const W=cv.width,H=cv.height
    let t=0,raf:number,stars=false
    const trail:any[]=[]
    const pos=(p:number)=>({x:W*.12+p*W*.76,y:H*.85-p*H*.65+Math.pow(p-.5,2)*H*.35})
    const draw=()=>{
      if(!stars){
        stars=true
        for(let i=0;i<80;i++){ctx.save();ctx.globalAlpha=Math.random()*.4+.05;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(Math.random()*W,Math.random()*H,Math.random()*1.1+.2,0,Math.PI*2);ctx.fill();ctx.restore()}
      }
      ctx.clearRect(0,0,W,H)
      // redraw stars
      for(let i=0;i<80;i++){ctx.save();ctx.globalAlpha=.08;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc((i*W/80+13)%W,(i*H/80+7)%H,.8,0,Math.PI*2);ctx.fill();ctx.restore()}
      t=Math.min(t+.003,1)
      ctx.save();ctx.setLineDash([3,8]);ctx.strokeStyle='rgba(255,136,0,.12)';ctx.lineWidth=1;ctx.beginPath()
      for(let i=0;i<=100;i++){const p=pos(i/100);i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)}
      ctx.stroke();ctx.restore()
      const p=pos(t);trail.push({x:p.x,y:p.y});if(trail.length>90)trail.shift()
      trail.forEach((pt,i)=>{
        const pr=i/trail.length;ctx.save();ctx.globalAlpha=pr*.7
        const g=ctx.createRadialGradient(pt.x,pt.y,0,pt.x,pt.y,pr*5)
        g.addColorStop(0,'#ff8800');g.addColorStop(.4,'#ff4400');g.addColorStop(1,'transparent')
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(pt.x,pt.y,pr*5,0,Math.PI*2);ctx.fill();ctx.restore()
      })
      if(trail.length>2){
        const prev=trail[trail.length-2],angle=Math.atan2(p.y-prev.y,p.x-prev.x)
        ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle)
        ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-9,-5);ctx.lineTo(-6,0);ctx.lineTo(-9,5);ctx.closePath()
        const rg=ctx.createLinearGradient(-9,0,14,0);rg.addColorStop(0,'#ff4400');rg.addColorStop(1,'#ffcc00')
        ctx.fillStyle=rg;ctx.shadowColor='#ff8800';ctx.shadowBlur=20;ctx.fill();ctx.restore()
      }
      if(t<1)raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw)
    return()=>cancelAnimationFrame(raf)
  },[iv])
  return<canvas ref={ref} className="w-full h-40 block"/>
}

const LNK=[
  {i:'01',l:'EMAIL',   v:'shashanktripathi1729@gmail.com',h:'mailto:shashanktripathi1729@gmail.com',c:'#88ccff'},
  {i:'02',l:'LINKEDIN',v:'shashank-tripathi-s1729',        h:'https://linkedin.com/in/shashank-tripathi-s1729',c:'#cc44ff'},
  {i:'03',l:'GITHUB',  v:'ShashankTripathi-1729',          h:'https://github.com/ShashankTripathi-1729',c:'#ffcc00'},
  {i:'04',l:'RÉSUMÉ',  v:'View on Google Drive',            h:'https://drive.google.com/file/d/1cUjC5Og_iEZFPVKDU8yOKNNsGtSwEyHw/view?usp=sharing',c:'#ff8800'},
]
export function Contact(){
  return(
    <section id="contact" className="S py-32 px-10 md:px-20 bg-[#02000a]">
      <motion.div initial={{scaleX:0}} whileInView={{scaleX:1}}
        transition={{duration:1.4,ease:[.16,1,.3,1]}} viewport={{once:true}}
        className="w-full h-px mb-20 origin-left"
        style={{background:'linear-gradient(90deg,#ff2200,#ff8800,#88ccff,transparent)'}}/>
      <div className="max-w-5xl mx-auto">
        <CH ch="CHAPTER 05" title={"LET'S <span class=\"gfire\">CONNECT</span>"} acc="#ff4400"/>
        <motion.div initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}
          className="relative mb-12 border border-[#ff4400]/07 overflow-hidden"
          style={{background:'rgba(255,68,0,.015)'}}>
          <div className="absolute top-2.5 left-4 fm text-[8px] tracking-[3px] text-[#ff8800]/22">ARTEMIS II — CISLUNAR TRAJECTORY</div>
          <div className="absolute top-2.5 right-4 fm text-[8px] tracking-[3px] text-[#88ccff]/22">LUNAR FLYBY 2025</div>
          <Rocket/>
        </motion.div>
        <div className="grid md:grid-cols-[1fr,1.4fr] gap-12">
          <motion.div initial={{opacity:0,x:-40}} whileInView={{opacity:1,x:0}}
            transition={{duration:.9,ease:[.16,1,.3,1]}} viewport={{once:true}}>
            <p className="text-white/38 text-[14px] leading-[2.1] font-light mb-5 fr">
              Open to research collaborations, internships, IEEE paper reviews, and power electronics projects. Working on power systems, intelligent control, or SiC/GaN hardware? I want to hear about it.
            </p>
            <p className="text-white/22 text-[13px] leading-relaxed font-light mb-8 fr">Based in Raebareli, UP. Usually reply within a few hours.</p>
            <div className="flex items-center gap-3 px-4 py-3 border border-[#00ff87]/10 w-fit">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ff87] flex-shrink-0"
                style={{boxShadow:'0 0 10px #00ff87',animation:'pulse-f 2s infinite'}}/>
              <span className="fm text-[9px] tracking-[3px] text-[#00ff87]/42">AVAILABLE FOR COLLABORATION</span>
            </div>
          </motion.div>
          <div className="flex flex-col gap-2">
            {LNK.map((lk,i)=>(
              <motion.a key={lk.i} href={lk.h} target={lk.h.startsWith('mailto')?undefined:'_blank'} rel="noopener noreferrer"
                initial={{opacity:0,x:50}} whileInView={{opacity:1,x:0}}
                transition={{duration:.7,ease:[.16,1,.3,1],delay:i*.08}} viewport={{once:true}}
                whileHover={{x:8}}
                className="group relative flex items-center gap-4 px-5 py-4 border border-white/05 bg-white/[.011] overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{background:`radial-gradient(ellipse at left center,${lk.c}07 0%,transparent 60%)`}}/>
                <span className="fm text-[10px] text-white/15 group-hover:text-white/40 transition-colors flex-shrink-0">{lk.i}</span>
                <div className="flex-1">
                  <div className="fm text-[8px] tracking-[3px] text-white/18 mb-0.5">{lk.l}</div>
                  <div className="text-[13px] text-white/60 group-hover:text-white transition-colors fr">{lk.v}</div>
                </div>
                <span className="text-lg flex-shrink-0 transition-all duration-200 group-hover:translate-x-1" style={{color:lk.c}}>→</span>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══ FOOTER ══════════════════════════════════════════════════ */
export function Footer(){
  return(
    <footer className="relative overflow-hidden py-8 px-10 md:px-20 border-t border-[#ff4400]/05 bg-[#02000a]">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="fb whitespace-nowrap tracking-[.1em]"
          style={{fontSize:'clamp(48px,14vw,160px)',color:'rgba(255,68,0,.016)'}}>SHASHANK</span>
      </div>
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="fb text-2xl text-[#ff4400] flicker glow-f" style={{letterSpacing:'.1em'}}>ST</span>
          <span className="fm text-[8px] tracking-[3px] text-white/18">SHASHANK TRIPATHI</span>
        </div>
        <span className="fm text-[8px] tracking-[2px] text-white/12">© 2025 · RGIPT + IIT MADRAS · RAEBARELI, INDIA</span>
        <span className="fm text-[8px] tracking-[2px] text-white/12">POWER ELECTRONICS · DATA SCIENCE</span>
      </div>
    </footer>
  )
}
