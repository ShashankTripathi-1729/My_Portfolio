'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ═══════════════════════════════════════════════════════════════
   INFERNO BLADE — Volcanic Excalibur
   • 6000 lava particles erupt from below → assemble into sword
   • Real GLSL fire shader on blade surface (animated noise)
   • Fire columns shoot up from tip like Fire Force
   • Rings of molten energy orbit the blade
   • Lava drip particles fall from crossguard
   • Grimoire circle rotates behind
   • Dismiss: eruption flash → blade rockets to sky → screen cracks
═══════════════════════════════════════════════════════════════ */

const N = 6000

export default function Blade() {
  const mountRef   = useRef<HTMLDivElement>(null)
  const doneRef    = useRef(false)
  const readyRef   = useRef(false)
  const threeRef   = useRef<any>({})
  const [gone,     setGone]     = useState(false)
  const [showName, setShowName] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(()=>{
    if(!mountRef.current) return
    document.body.style.overflow='hidden'

    let raf:number
    const R = threeRef.current  // shared ref for cleanup

    // Float32 buffers
    const curr = new Float32Array(N*3)
    const tgt  = new Float32Array(N*3)
    const cols = new Float32Array(N*3)
    const szs  = new Float32Array(N)
    const vel  = new Float32Array(N*3)  // initial eruption velocity

    /* ── sword target sampler ── */
    function swordTgt(i:number):[number,number,number]{
      const t=i/N
      if(t<0.58){  // blade
        const bt=t/0.58, y=bt*4.2-1.8
        const w=(1-bt)*0.14+0.007
        return [(Math.random()-.5)*w*2,y,(Math.random()-.5)*0.03]
      }
      if(t<0.67){  // guard
        const x=((t-.58)/.09-.5)*1.6
        return [x+(Math.random()-.5)*.05,-1.82+(Math.random()-.5)*.1,(Math.random()-.5)*.04]
      }
      if(t<0.87){  // grip
        const bt=(t-.67)/.20
        return [(Math.random()-.5)*.08,-1.84-bt*1.0,(Math.random()-.5)*.035]
      }
      // pommel
      const a=Math.random()*Math.PI*2,r=Math.random()*.13
      return [Math.cos(a)*r,-2.9+(Math.random()-.5)*.1,Math.sin(a)*r]
    }

    /* ── lava color palette ── */
    function lavaColor(i:number):[number,number,number]{
      const t=i/N, r=Math.random()
      if(t<0.12) return [1.0,0.98,0.7]           // white-hot tip
      if(t<0.28) return [1.0,0.88,0.1]           // gold
      if(t<0.50) return [1.0,0.52+r*.1,0.0]      // orange flame
      if(t<0.65) return [1.0,0.25+r*.1,0.0]      // red-orange guard
      if(t<0.87) return [0.5,0.08,0.0]           // dark ember grip
      return [1.0,0.6,0.0]                        // gold pommel
    }

    const init=async()=>{
      const THREE=await import('three')
      R.THREE=THREE

      /* renderer */
      const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'})
      renderer.setSize(window.innerWidth,window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
      renderer.setClearColor(0x000000,0)
      renderer.toneMapping=THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure=1.8
      mountRef.current!.appendChild(renderer.domElement)
      R.renderer=renderer

      const scene=new THREE.Scene()
      scene.fog=new THREE.FogExp2(0x02000a,0.032)
      const camera=new THREE.PerspectiveCamera(52,window.innerWidth/window.innerHeight,0.1,100)
      camera.position.set(0,0.2,5.6)
      R.scene=scene; R.camera=camera

      const clock=new THREE.Clock(); R.clock=clock

      /* init particle positions — erupting from BELOW like a volcano */
      for(let i=0;i<N;i++){
        // All start underground, erupting upward
        const angle=Math.random()*Math.PI*2
        const radius=Math.random()*2.5
        curr[i*3]   = Math.cos(angle)*radius
        curr[i*3+1] = -5-Math.random()*4   // far below
        curr[i*3+2] = Math.sin(angle)*radius

        const [tx,ty,tz]=swordTgt(i)
        tgt[i*3]=tx; tgt[i*3+1]=ty; tgt[i*3+2]=tz

        // Eruption velocity — upward burst
        vel[i*3]   = (Math.random()-.5)*0.8
        vel[i*3+1] = 2+Math.random()*3
        vel[i*3+2] = (Math.random()-.5)*0.8

        const [cr,cg,cb]=lavaColor(i)
        cols[i*3]=cr; cols[i*3+1]=cg; cols[i*3+2]=cb
        szs[i]=Math.random()*4+1.2
      }

      const geo=new THREE.BufferGeometry()
      geo.setAttribute('position',new THREE.BufferAttribute(curr,3))
      geo.setAttribute('aColor',  new THREE.BufferAttribute(cols,3))
      geo.setAttribute('aSize',   new THREE.BufferAttribute(szs,1))
      R.geo=geo

      /* ── VERTEX SHADER ── */
      const vert=`
        attribute vec3  aColor;
        attribute float aSize;
        varying   vec3  vColor;
        varying   float vAlpha;
        uniform   float uTime;
        uniform   float uProg;

        // Simplex-style hash
        float hash(float n){ return fract(sin(n)*43758.5453); }

        void main(){
          vColor=aColor;
          vec4 mv=modelViewMatrix*vec4(position,1.0);

          // Fire flicker — more intense near tip (high y)
          float fy=smoothstep(-2.0,2.5,position.y);
          float flicker=1.0+sin(uTime*12.0+position.y*6.0+hash(float(gl_VertexID))*6.28)*0.18*fy*uProg;
          float sz=aSize*flicker*(1.0+uProg*2.8);
          gl_PointSize=sz*(310.0/-mv.z);
          gl_Position=projectionMatrix*mv;
          vAlpha=(0.25+uProg*0.75)*mix(0.6,1.0,fy);
        }
      `

      /* ── FRAGMENT SHADER — fire glow disc ── */
      const frag=`
        varying vec3  vColor;
        varying float vAlpha;
        uniform float uProg;

        void main(){
          vec2  uv=gl_PointCoord-0.5;
          float d=length(uv);
          if(d>0.5) discard;

          // Bright core + fire halo
          float core=1.0-smoothstep(0.0,0.16,d);
          float halo=1.0-smoothstep(0.14,0.50,d);
          float a=(core*0.95+halo*0.38)*vAlpha;

          // Temperature: white-hot core → orange → red edge
          vec3 hot=mix(vec3(1.0,0.9,0.5),vColor,d*2.0);
          vec3 bright=hot*(1.0+core*3.0);
          gl_FragColor=vec4(bright,a);
        }
      `

      const mat=new THREE.ShaderMaterial({
        uniforms:{uTime:{value:0},uProg:{value:0}},
        vertexShader:vert,
        fragmentShader:frag,
        transparent:true,
        depthWrite:false,
        blending:THREE.AdditiveBlending,
      })
      R.mat=mat

      const ptMesh=new THREE.Points(geo,mat)
      scene.add(ptMesh); R.ptMesh=ptMesh

      /* ── SWORD MESH ── */
      const swordGrp=buildSword(THREE)
      swordGrp.scale.setScalar(0); scene.add(swordGrp); R.swordGrp=swordGrp

      /* ── FIRE COLUMN (tip beam — Fire Force style) ── */
      const fireColumn=buildFireColumn(THREE)
      fireColumn.scale.setScalar(0); scene.add(fireColumn); R.fireColumn=fireColumn

      /* ── BLADE FIRE SHADER ── */
      const bladeFlame=buildBladeFlame(THREE)
      bladeFlame.scale.setScalar(0); scene.add(bladeFlame); R.bladeFlame=bladeFlame

      /* ── MOLTEN RINGS ── */
      const ring1=mkRing(THREE,0.55,0.022,0xff4400,2.5)
      const ring2=mkRing(THREE,0.82,0.014,0xff8800,1.2)
      const ring3=mkRing(THREE,1.12,0.009,0xffcc00,0.6)
      ;[ring1,ring2,ring3].forEach(r=>{r.scale.setScalar(0);scene.add(r)})
      R.rings=[ring1,ring2,ring3]

      /* ── LAVA DRIPS ── */
      const drips=buildDrips(THREE)
      drips.scale.setScalar(0); scene.add(drips); R.drips=drips

      /* ── LIGHTS ── */
      scene.add(new THREE.AmbientLight(0x200800,3))
      const pl1=new THREE.PointLight(0xff4400,16,10); pl1.position.set(0,2.5,2); scene.add(pl1); R.pl1=pl1
      const pl2=new THREE.PointLight(0xff8800,10,8);  pl2.position.set(.5,-1,2); scene.add(pl2)
      const pl3=new THREE.PointLight(0xffcc00,7,6);   pl3.position.set(-.5,1,2); scene.add(pl3)

      /* ── GSAP ANIMATION ── */
      const {default:gsap}=await import('gsap')
      R.gsap=gsap

      const o={prog:0,sword:0,erupt:0}
      const tl=gsap.timeline({delay:0.2})

      /* Phase 0: eruption burst — particles fly up from below */
      tl.to(o,{
        erupt:1,duration:0.8,ease:'power4.out',
        onUpdate:()=>{
          const e=o.erupt
          for(let i=0;i<N;i++){
            curr[i*3]   += vel[i*3]*e*0.12
            curr[i*3+1] += vel[i*3+1]*e*0.15
            curr[i*3+2] += vel[i*3+2]*e*0.12
          }
          geo.attributes.position.needsUpdate=true
          setProgress(Math.round(e*30))
        }
      })

      /* Phase 1: converge to sword shape */
      tl.to(o,{
        prog:1,duration:2.8,ease:'power3.inOut',
        onUpdate:()=>{
          mat.uniforms.uProg.value=o.prog
          const lag=o.prog<0.2?0:(o.prog-0.2)/0.8
          for(let i=0;i<N;i++){
            const sp=(0.055+szs[i]/5*0.05)*lag
            curr[i*3]  +=(tgt[i*3]  -curr[i*3])  *sp
            curr[i*3+1]+=(tgt[i*3+1]-curr[i*3+1])*sp
            curr[i*3+2]+=(tgt[i*3+2]-curr[i*3+2])*sp
          }
          geo.attributes.position.needsUpdate=true
          setProgress(Math.round(30+o.prog*50))
        }
      })

      /* Phase 2: sword materialises */
      tl.to(o,{
        sword:1,duration:0.6,ease:'back.out(1.7)',
        onUpdate:()=>{
          swordGrp.scale.setScalar(o.sword)
          bladeFlame.scale.setScalar(o.sword)
        }
      },'-=0.9')

      /* Phase 3: fire column shoots up */
      tl.to(fireColumn.scale,{x:1,y:1,z:1,duration:0.5,ease:'power3.out'},'-=0.3')

      /* Phase 4: rings explode out */
      tl.to(ring1.scale,{x:1,y:1,z:1,duration:0.45,ease:'back.out(2.5)'},'-=0.3')
      tl.to(ring2.scale,{x:1,y:1,z:1,duration:0.45,ease:'back.out(2.5)'},'-=0.43')
      tl.to(ring3.scale,{x:1,y:1,z:1,duration:0.45,ease:'back.out(2.5)'},'-=0.41')

      /* Phase 5: drips appear */
      tl.to(drips.scale,{x:1,y:1,z:1,duration:0.4,ease:'power2.out'},'-=0.2')

      /* Phase 6: done */
      tl.add(()=>{
        readyRef.current=true
        setProgress(100)
        setShowName(true)
        setTimeout(()=>setShowHint(true),700)
      },'+=0.3')

      /* camera drift */
      gsap.to(camera.position,{y:0.45,duration:6,ease:'sine.inOut',yoyo:true,repeat:-1})
    }

    /* ── dismiss ── */
    const dismiss=async()=>{
      if(doneRef.current||!readyRef.current) return
      doneRef.current=true
      setShowHint(false)

      const {default:gsap}=await import('gsap')
      const renderer=R.renderer

      // Lava burst flash — 4 flashes
      let flashes=0
      const flashInt=setInterval(()=>{
        renderer.toneMappingExposure=flashes%2===0?9:1.8
        flashes++
        if(flashes>7){clearInterval(flashInt);renderer.toneMappingExposure=1.8}
      },60)

      // Sword erupts UPWARD like a volcano blast
      gsap.to(R.swordGrp.position,  {y:14,duration:0.5,ease:'power4.in',delay:.1})
      gsap.to(R.bladeFlame.position,{y:14,duration:0.5,ease:'power4.in',delay:.1})
      gsap.to(R.fireColumn.position,{y:14,duration:0.4,ease:'power4.in',delay:.05})
      gsap.to(R.ptMesh.position,    {y:10,duration:0.55,ease:'power3.in'})
      R.rings.forEach((rng:any,idx:number)=>{
        gsap.to(rng.scale,  {x:5,y:5,z:5,duration:0.4,ease:'power2.in',delay:idx*.03})
        gsap.to(rng.material,{opacity:0,duration:0.35,delay:idx*.03})
      })

      // Fade out
      gsap.to(mountRef.current,{
        opacity:0,duration:0.6,delay:0.35,ease:'power2.inOut',
        onComplete:()=>{setGone(true);document.body.style.overflow=''}
      })
    }

    /* ── render loop ── */
    const animate=()=>{
      raf=requestAnimationFrame(animate)
      if(!R.renderer||!R.scene||!R.camera) return
      const t=R.clock.getElapsedTime()

      if(R.mat)    R.mat.uniforms.uTime.value=t
      const [r1,r2,r3]=R.rings||[]
      if(r1){r1.rotation.z=t*1.6;r1.rotation.x=t*0.7}
      if(r2){r2.rotation.z=-t*1.1;r2.rotation.y=t*0.5}
      if(r3){r3.rotation.z=t*0.8;r3.rotation.y=-t*0.6}
      if(R.swordGrp) R.swordGrp.rotation.y=Math.sin(t*.4)*.06
      if(R.bladeFlame) R.bladeFlame.rotation.y=Math.sin(t*.4)*.06
      if(R.fireColumn){
        // Fire column sways
        R.fireColumn.rotation.y=Math.sin(t*.3)*.04
        if(R.fireColumn.children[0]?.material?.uniforms){
          R.fireColumn.children[0].material.uniforms.uTime.value=t
        }
      }
      // Pulse main point light
      if(R.pl1) R.pl1.intensity=14+Math.sin(t*2.5)*4

      // Animate drips
      if(R.drips&&R.drips.visible){
        const dp=R.drips.geometry.attributes.position
        const da=R.drips.userData
        if(da.vels){
          for(let i=0;i<dp.count;i++){
            dp.array[i*3+1]-=da.vels[i]*0.02
            if(dp.array[i*3+1]<-4){dp.array[i*3+1]=da.origins[i]}
          }
          dp.needsUpdate=true
        }
      }

      R.renderer.render(R.scene,R.camera)
    }

    const onResize=()=>{
      if(!R.camera||!R.renderer)return
      R.camera.aspect=window.innerWidth/window.innerHeight
      R.camera.updateProjectionMatrix()
      R.renderer.setSize(window.innerWidth,window.innerHeight)
    }
    window.addEventListener('resize',onResize)

    const onWheel=(e:WheelEvent)=>{if(e.deltaY>0)dismiss()}
    const onKey=(e:KeyboardEvent)=>{if(['Space','Enter','ArrowDown'].includes(e.code))dismiss()}
    window.addEventListener('wheel',onWheel,{passive:true})
    window.addEventListener('keydown',onKey)
    ;(window as any).__blade=dismiss
    setTimeout(dismiss,10000)

    init().then(animate)

    return()=>{
      cancelAnimationFrame(raf)
      window.removeEventListener('resize',onResize)
      window.removeEventListener('wheel',onWheel)
      window.removeEventListener('keydown',onKey)
      if(R.renderer&&mountRef.current?.contains(R.renderer.domElement))
        mountRef.current.removeChild(R.renderer.domElement)
      R.renderer?.dispose()
    }
  },[])

  if(gone) return null

  return(
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[9999]"
        style={{background:'radial-gradient(ellipse at center,#100400 0%,#04000a 50%,#000 100%)'}}
        exit={{opacity:0,transition:{duration:0.5}}}>

        <div ref={mountRef} className="absolute inset-0"/>

        {/* Rotating fire pentagram — CSS only */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg className="absolute w-[640px] h-[640px] opacity-[0.10]"
            style={{animation:'spin-s 30s linear infinite'}} viewBox="0 0 640 640">
            <circle cx="320" cy="320" r="308" fill="none" stroke="rgba(255,68,0,0.5)" strokeWidth="1" strokeDasharray="8 14"/>
            <circle cx="320" cy="320" r="285" fill="none" stroke="rgba(255,136,0,0.3)" strokeWidth="0.5" strokeDasharray="4 8"/>
            {[0,1,2,3,4].map(i=>{
              const a1=(i*72-90)*Math.PI/180, a2=((i*72+144)-90)*Math.PI/180
              return<line key={i}
                x1={320+308*Math.cos(a1)} y1={320+308*Math.sin(a1)}
                x2={320+308*Math.cos(a2)} y2={320+308*Math.sin(a2)}
                stroke="rgba(255,68,0,0.3)" strokeWidth="0.8"/>
            })}
            {[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>{
              const a=(i*30)*Math.PI/180
              return<line key={i}
                x1={320+300*Math.cos(a)} y1={320+300*Math.sin(a)}
                x2={320+316*Math.cos(a)} y2={320+316*Math.sin(a)}
                stroke="rgba(255,204,0,0.6)" strokeWidth="2"/>
            })}
          </svg>
          <svg className="absolute w-[380px] h-[380px] opacity-[0.07]"
            style={{animation:'spin-r 18s linear infinite'}} viewBox="0 0 380 380">
            <circle cx="190" cy="190" r="180" fill="none" stroke="rgba(255,136,0,0.5)" strokeWidth="0.8" strokeDasharray="3 7"/>
            {[0,1,2,3,4,5].map(i=>{
              const a1=(i*60-90)*Math.PI/180, a2=((i*60+180)-90)*Math.PI/180
              return<line key={i}
                x1={190+180*Math.cos(a1)} y1={190+180*Math.sin(a1)}
                x2={190+180*Math.cos(a2)} y2={190+180*Math.sin(a2)}
                stroke="rgba(255,136,0,0.3)" strokeWidth="0.7"/>
            })}
          </svg>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/05">
          <motion.div className="h-full"
            style={{background:'linear-gradient(90deg,#ff2200,#ff8800,#ffcc00)'}}
            animate={{width:`${progress}%`}}
            transition={{duration:0.3}}/>
        </div>

        {/* Name reveal */}
        <AnimatePresence>
          {showName&&(
            <motion.div className="absolute inset-x-0 bottom-24 flex flex-col items-center gap-3 pointer-events-none"
              initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
              transition={{duration:1.1,ease:[.16,1,.3,1]}}>
              <p className="fm text-[9px] tracking-[8px] text-[#ff8800]/50 mb-1">— THE BLADE OF PURGATORY —</p>
              <h1 style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:'clamp(28px,6vw,64px)',
                letterSpacing:'0.15em',
                background:'linear-gradient(180deg,#ffcc00 0%,#ff8800 45%,#ff2200 100%)',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                filter:'drop-shadow(0 0 30px rgba(255,136,0,0.8)) drop-shadow(0 0 80px rgba(255,68,0,0.4))',
              }}>SHASHANK TRIPATHI</h1>
              <p className="fm text-[9px] tracking-[5px] text-[#ff8800]/55">
                POWER ELECTRONICS · DATA SCIENCE
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll hint */}
        <AnimatePresence>
          {showHint&&(
            <motion.button
              className="absolute bottom-6 left-1/2 -translate-x-1/2 fm text-[8px] tracking-[5px] text-[#ff4400]/45 border border-[#ff4400]/18 px-8 py-3 hover:border-[#ff4400]/60 hover:text-[#ff4400]/75 transition-all"
              initial={{opacity:0}} animate={{opacity:[0,.4,.2,.8,.4,1]}}
              transition={{duration:2}}
              onClick={()=>(window as any).__blade?.()}>
              [ SCROLL TO IGNITE ]
            </motion.button>
          )}
        </AnimatePresence>

        {/* HUD */}
        <span className="absolute top-6 left-8 fm text-[8px] tracking-[4px] text-white/12">INFERNO_SYSTEM</span>
        <span className="absolute top-6 right-8 fm text-[8px] tracking-[4px] text-white/12">RGIPT + IIT_MADRAS</span>
        <span className="absolute top-16 left-8 fm text-[7px] tracking-[3px] text-[#ff4400]/20">{progress<100?`ASSEMBLING_${progress}%`:'IGNITION_READY'}</span>
        <span className="absolute bottom-10 right-8 fm text-[7px] tracking-[3px] text-[#ffcc00]/18">2025</span>
      </motion.div>
    </AnimatePresence>
  )
}

/* ══ THREE.JS HELPERS ══════════════════════════════════════════ */

function buildSword(T:any){
  const g=new T.Group()

  // Blade — sharp, thin, fire-etched
  const s=new T.Shape()
  s.moveTo(0,2.4)
  s.lineTo(-.005,2.2); s.lineTo(-.06,.35); s.lineTo(-.11,-1.58)
  s.lineTo(0,-1.60);   s.lineTo(.11,-1.58); s.lineTo(.06,.35)
  s.lineTo(.005,2.2);  s.closePath()

  const bm=new T.MeshStandardMaterial({
    color:0xffe0a0,metalness:1.0,roughness:0.02,
    emissive:0xff6600,emissiveIntensity:0.6,side:T.DoubleSide,
  })
  g.add(new T.Mesh(new T.ShapeGeometry(s),bm))

  // Fuller
  const fl=new T.BufferGeometry().setFromPoints([new T.Vector3(0,2.3,.01),new T.Vector3(0,-1.5,.01)])
  g.add(new T.Line(fl,new T.LineBasicMaterial({color:0xffffff,linewidth:2})))

  // Hot edge lines — orange glow
  ;[-.014,.014].forEach(x=>{
    const eg=new T.BufferGeometry().setFromPoints([
      new T.Vector3(x,2.1,.007),new T.Vector3(x<0?-.14:.14,-1.55,.007)
    ])
    g.add(new T.Line(eg,new T.LineBasicMaterial({color:0xff8800,linewidth:1.5})))
  })

  // Crossguard — wider, more intimidating
  const cgm=new T.MeshStandardMaterial({color:0xcc7700,metalness:.95,roughness:.04,emissive:0xff8800,emissiveIntensity:.5})
  const cg=new T.Mesh(new T.BoxGeometry(1.55,.115,.08),cgm); cg.position.y=-1.62; g.add(cg)
  // Guard wings
  const wm=new T.MeshStandardMaterial({color:0xaa5500,metalness:.9,roughness:.1,emissive:0xff6600,emissiveIntensity:.3})
  ;[-1,1].forEach(sgn=>{
    const w=new T.Mesh(new T.BoxGeometry(.065,.28,.065),wm)
    w.position.set(sgn*.80,-1.43,0); w.rotation.z=sgn*.4; g.add(w)
  })

  // Grip
  const gp=new T.Mesh(new T.CylinderGeometry(.038,.044,1.05,12),
    new T.MeshStandardMaterial({color:0x180600,metalness:.2,roughness:.9}))
  gp.position.y=-2.15; g.add(gp)

  // Wrappings
  const wrapMat=new T.MeshStandardMaterial({color:0xdd9900,metalness:.85,roughness:.15,emissive:0xff6600,emissiveIntensity:.2})
  for(let i=0;i<10;i++){
    const wr=new T.Mesh(new T.TorusGeometry(.048,.009,6,12),wrapMat)
    wr.position.y=-1.68-i*.105; wr.rotation.x=Math.PI/2; g.add(wr)
  }

  // Pommel — octagonal, glowing gem
  const pm=new T.Mesh(new T.CylinderGeometry(.155,.115,.20,8),
    new T.MeshStandardMaterial({color:0xdd8800,metalness:.95,roughness:.04,emissive:0xff4400,emissiveIntensity:.8}))
  pm.position.y=-2.77; g.add(pm)
  // Pommel fire gem
  const gem=new T.Mesh(new T.OctahedronGeometry(.075,0),
    new T.MeshStandardMaterial({color:0xff2200,emissive:0xff2200,emissiveIntensity:4.0,metalness:0,roughness:0,transparent:true,opacity:.92}))
  gem.position.y=-2.77; g.add(gem)

  return g
}

function buildFireColumn(T:any){
  const g=new T.Group()

  /* Real fire shader — animated noise for turbulent flame */
  const fireMat=new T.ShaderMaterial({
    uniforms:{uTime:{value:0}},
    vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`
      varying vec2 vUv;
      uniform float uTime;

      // 2D noise
      float hash2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise2(vec2 p){
        vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);
        return mix(mix(hash2(i),hash2(i+vec2(1,0)),u.x),mix(hash2(i+vec2(0,1)),hash2(i+vec2(1,1)),u.x),u.y);
      }
      float fbm(vec2 p){
        float v=0.0,a=0.5;
        for(int i=0;i<5;i++){v+=a*noise2(p);p=p*2.1+vec2(.3,.7);a*=.5;}
        return v;
      }

      void main(){
        // UV: x=0..1 across width, y=0..1 bottom to top
        vec2 uv=vUv;

        // Horizontal center weighting
        float cx=abs(uv.x-.5)*2.0;
        float width=1.0-smoothstep(0.0,1.0,cx);

        // Turbulent upward flow
        float t=uTime*.9;
        vec2 q=vec2(uv.x-.5,uv.y);
        float n=fbm(q*3.0+vec2(0.0,t));
        float n2=fbm(q*5.0+vec2(1.5,-t*1.2));

        // Shape: wide at base, taper to tip
        float taper=1.0-smoothstep(0.0,1.0,uv.y);
        float shape=width*taper*(0.6+n*.6+n2*.3);

        // Fade top out
        float fade=smoothstep(1.0,.75,uv.y)*smoothstep(0.0,.05,uv.y);
        float a=shape*fade*0.7;

        // Color: white-hot base → gold → orange → red → transparent tip
        vec3 c0=vec3(1.0,1.0,.85);    // white hot
        vec3 c1=vec3(1.0,.75,.05);    // gold
        vec3 c2=vec3(1.0,.35,.0);     // orange
        vec3 c3=vec3(.8,.05,.0);      // deep red

        vec3 col=c0;
        col=mix(col,c1,smoothstep(.0,.25,uv.y));
        col=mix(col,c2,smoothstep(.2,.55,uv.y));
        col=mix(col,c3,smoothstep(.5,.9, uv.y));

        gl_FragColor=vec4(col,a);
      }
    `,
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,
  })

  // Main fire column — tall
  const fc=new T.Mesh(new T.PlaneGeometry(.4,8.0),fireMat)
  fc.position.set(0,6.3,0); g.add(fc)

  // Secondary wider glow layer
  const fm2=fireMat.clone()
  fm2.uniforms={uTime:{value:0}}
  const fc2=new T.Mesh(new T.PlaneGeometry(.8,7.0),fm2)
  fc2.position.set(0,5.8,-.02); g.add(fc2)

  // Thin bright core
  const coreGeo=new T.BufferGeometry().setFromPoints([
    new T.Vector3(0,2.4,.02),new T.Vector3(0,12,.02)
  ])
  g.add(new T.Line(coreGeo,new T.LineBasicMaterial({color:0xffffff,linewidth:2})))

  g.position.set(0,-.2,0)
  return g
}

function buildBladeFlame(T:any){
  const g=new T.Group()
  const mat=new T.ShaderMaterial({
    uniforms:{uTime:{value:0}},
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`
      varying vec2 vUv;
      void main(){
        float cx=abs(vUv.x-.5)*2.0;
        float edge=1.0-smoothstep(.0,1.0,cx);
        float fade=smoothstep(.0,.08,vUv.y)*smoothstep(1.0,.82,vUv.y);
        float a=pow(edge,4.0)*fade*.5;
        vec3 c=mix(vec3(1.0,.9,.4),mix(vec3(1.0,.5,.0),vec3(.9,.1,.0),vUv.y*.8),vUv.y);
        gl_FragColor=vec4(c,a);
      }
    `,
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,
  })
  g.add(new T.Mesh(new T.PlaneGeometry(.3,4.2),mat))
  return g
}

function mkRing(T:any,r:number,tube:number,col:number,emI:number){
  return new T.Mesh(
    new T.TorusGeometry(r,tube,8,80),
    new T.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:emI,metalness:.5,roughness:0,transparent:true,opacity:.88})
  )
}

function buildDrips(T:any){
  const count=24
  const positions=new Float32Array(count*3)
  const vels=new Float32Array(count)
  const origins=new Float32Array(count)
  // Drips appear around the crossguard at y≈-1.62
  for(let i=0;i<count;i++){
    const angle=Math.random()*Math.PI*2
    const r=Math.random()*.7
    positions[i*3]  =Math.cos(angle)*r
    positions[i*3+1]=-1.62+Math.random()*.3
    positions[i*3+2]=Math.sin(angle)*r
    vels[i]   =Math.random()*.5+.3
    origins[i]=positions[i*3+1]
  }
  const geo=new T.BufferGeometry()
  geo.setAttribute('position',new T.BufferAttribute(positions,3))
  const mat=new T.ShaderMaterial({
    uniforms:{uTime:{value:0}},
    vertexShader:`void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=4.0*(200.0/-mv.z);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`void main(){vec2 uv=gl_PointCoord-.5;if(length(uv)>.5)discard;float a=1.0-length(uv)*2.0;gl_FragColor=vec4(1.0,.35,.0,a*.8);}`,
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,
  })
  const mesh=new T.Points(geo,mat)
  mesh.userData={vels,origins}
  return mesh
}
