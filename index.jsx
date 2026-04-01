import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════
   UTILS & HOOKS
═══════════════════════════════════════ */

function useEmailJS() {
  useEffect(() => {
    if (document.getElementById("ejs")) return;
    const s = document.createElement("script");
    s.id = "ejs";
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.onload = () => window.emailjs?.init({ publicKey: "Gpcd8rwqRtpdhpw0V" });
    document.head.appendChild(s);
  }, []);
}

function useFonts() {
  useEffect(() => {
    if (document.getElementById("pf")) return;
    const l = document.createElement("link");
    l.id = "pf"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@300;400&display=swap";
    document.head.appendChild(l);
  }, []);
}

function useMagnetic(strength = 0.35) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const onMove = useCallback((e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength });
  }, [strength]);
  const onLeave = useCallback(() => setPos({ x: 0, y: 0 }), []);
  return { ref, pos, onMove, onLeave };
}

/* ═══════════════════════════════════════
   VISUAL COMPONENTS
═══════════════════════════════════════ */

function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const rp = useRef({ x: 0, y: 0 });
  const raf = useRef(null);
  useEffect(() => {
    const move = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dot.current) dot.current.style.transform = `translate(${e.clientX - 4}px,${e.clientY - 4}px)`;
    };
    const loop = () => {
      rp.current.x += (mouse.current.x - rp.current.x) * 0.11;
      rp.current.y += (mouse.current.y - rp.current.y) * 0.11;
      if (ring.current) ring.current.style.transform = `translate(${rp.current.x - 20}px,${rp.current.y - 20}px)`;
      raf.current = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move);
    raf.current = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf.current); };
  }, []);
  return (
    <>
      <div ref={dot} style={{ position:"fixed",top:0,left:0,width:8,height:8,background:"#111",borderRadius:"50%",pointerEvents:"none",zIndex:9999,mixBlendMode:"difference" }} />
      <div ref={ring} style={{ position:"fixed",top:0,left:0,width:40,height:40,border:"1.5px solid rgba(0,0,0,0.2)",borderRadius:"50%",pointerEvents:"none",zIndex:9998 }} />
    </>
  );
}

function Particles() {
  const canvas = useRef(null);
  useEffect(() => {
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: 24 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.5 + 0.1
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0;
        if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(155,145,130,${p.a})`; ctx.fill();
      });
      pts.forEach((p, i) => pts.slice(i+1).forEach(q => {
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 90) { ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.strokeStyle = `rgba(155,145,130,${(1-d/90)*0.1})`; ctx.lineWidth=0.5; ctx.stroke(); }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={canvas} style={{ position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0 }} />;
}

function TiltCard({ children, style = {}, className = "" }) {
  const ref = useRef(null);
  const [t, setT] = useState({ rx:0, ry:0, gx:50, gy:50, scale:1 });
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    setT({ rx:(y-0.5)*-14, ry:(x-0.5)*14, gx:x*100, gy:y*100, scale:1.02 });
  };
  const onLeave = () => setT({ rx:0, ry:0, gx:50, gy:50, scale:1 });
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className}
      style={{ ...style, transform:`perspective(700px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale(${t.scale})`, transition:"transform 0.12s ease", transformStyle:"preserve-3d", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute",inset:0,background:`radial-gradient(circle at ${t.gx}% ${t.gy}%, rgba(255,255,255,0.22) 0%, transparent 65%)`, pointerEvents:"none",zIndex:1,borderRadius:"inherit" }} />
      <div style={{ position:"relative",zIndex:2 }}>{children}</div>
    </div>
  );
}

function Reveal({ children, delay=0, y=20 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold:0.05 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity:vis?1:0, transform:vis?`translateY(0)`:`translateY(${y}px)`, transition:`opacity 0.55s ease ${delay}ms, transform 0.55s cubic-bezier(.22,1,.36,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

function Counter({ to, suffix="" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; obs.disconnect();
      const target = parseInt(to)||0, dur=1200, step=16;
      const inc = target/(dur/step); let cur=0;
      const id = setInterval(() => { cur=Math.min(cur+inc,target); setVal(Math.floor(cur)); if(cur>=target)clearInterval(id); }, step);
    },{ threshold:0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  },[to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ═══════════════════════════════════════
   NAV / SERVICES DATA
═══════════════════════════════════════ */

const NAV = [
  { id:"inicio", label:"Inicio", icon:"○" },
  { id:"servicios", label:"Servicios", icon:"◈" },
  { id:"sobre-mi", label:"Sobre mí", icon:"◑" },
  { id:"contacto", label:"Contacto", icon:"◎" },
];
const SERVICES_EMPRESA = [
  { n:"01", title:"Web corporativa", desc:"Presencia digital profesional que genera confianza y capta clientes B2B", price:"1.500 – 5.000 €" },
  { n:"02", title:"Aplicación web a medida", desc:"Panel de gestión, CRM, intranet o herramienta interna para tu equipo", price:"3.000 – 12.000 €" },
  { n:"03", title:"Landing page de campaña", desc:"Página de conversión optimizada para publicidad o lanzamiento de producto", price:"600 – 1.800 €" },
  { n:"04", title:"E-commerce B2B / tienda empresa", desc:"Catálogo online, pedidos mayoristas o tienda multi-perfil con gestión", price:"2.000 – 6.000 €" },
  { n:"05", title:"Rediseño y optimización", desc:"Modernización de web existente con mejoras de rendimiento y conversión", price:"1.200 – 4.000 €" },
  { n:"06", title:"Mantenimiento mensual", desc:"Soporte técnico, actualizaciones, seguridad y mejoras continuas", price:"150 – 400 €/mes" },
];
const SERVICES_PARTICULAR = [
  { n:"07", title:"Portfolio para artistas", desc:"Espacio digital único para que tu obra hable sola", price:"350 – 700 €" },
  { n:"08", title:"Web para autónomos", desc:"Presencia profesional rápida y sin complicaciones", price:"400 – 900 €" },
  { n:"09", title:"Tienda online pequeña", desc:"E-commerce funcional y atractivo para empezar a vender", price:"900 – 2.000 €" },
];
const TAGS = ["HTML / CSS","JavaScript","React","Node.js","WordPress","Figma","E-commerce","SEO","B2B","UI/UX"];

/* ═══════════════════════════════════════
   PANELS
═══════════════════════════════════════ */

function Inicio({ setActive }) {
  const [hov, setHov] = useState(null);
  const mag = useMagnetic(0.4);

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", maxWidth:580, position:"relative", zIndex:1 }}>
      <Reveal delay={0}>
        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.22em", color:"#b0afa9", textTransform:"uppercase", marginBottom:28 }}>
          ✦ Disponible para proyectos
        </p>
      </Reveal>

      <Reveal delay={80}>
        <h1 style={{ fontSize:"clamp(2rem,4vw,3.2rem)", fontWeight:300, lineHeight:1.1, letterSpacing:"-2px", color:"#111", marginBottom:20 }}>
          Webs que{" "}
          <span style={{ fontWeight:600, position:"relative", display:"inline-block" }}>
            funcionan
            <svg style={{ position:"absolute", bottom:-5, left:0, width:"100%", overflow:"visible" }} height="6" viewBox="0 0 100 6">
              <path d="M0 5 Q25 0 50 5 Q75 10 100 5" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </span>{" "}
          <em style={{ fontStyle:"italic", color:"#b0afa9", fontWeight:300 }}>de verdad</em>
        </h1>
      </Reveal>

      <Reveal delay={160}>
        <p style={{ fontSize:13.5, color:"#6b6a67", lineHeight:1.85, marginBottom:28, maxWidth:440 }}>
          Diseño y desarrollo webs para <strong style={{ color:"#111", fontWeight:500 }}>empresas y negocios</strong> que quieren resultados reales — webs corporativas, aplicaciones a medida y e-commerce que convierten visitas en clientes.
        </p>
      </Reveal>

      <Reveal delay={240}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:32 }}>
          {TAGS.map((t,i) => (
            <span key={t} onMouseEnter={()=>setHov(t)} onMouseLeave={()=>setHov(null)}
              style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:hov===t?"#111":"#888",
                background:hov===t?"#fff":"rgba(255,255,255,0.55)", border:`1px solid ${hov===t?"#bbb":"#e5e5e3"}`,
                padding:"4px 12px", borderRadius:999, backdropFilter:"blur(4px)",
                transform:hov===t?"translateY(-2px) scale(1.05)":"none",
                transition:"all 0.2s cubic-bezier(.22,1,.36,1)", cursor:"default",
                animationDelay:`${i*30}ms` }}>
              {t}
            </span>
          ))}
        </div>
      </Reveal>

      <Reveal delay={320}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:32 }}>
          {[{n:20,suf:"+",label:"Proyectos entregados"},{n:null,raw:"3–5d",label:"Entrega media"},{n:100,suf:"%",label:"Satisfacción cliente"}].map((s,i) => (
            <TiltCard key={i} style={{ background:"#fff", border:"1px solid #e8e7e4", borderRadius:14, padding:"18px 16px" }}>
              <div style={{ fontSize:26, fontWeight:600, letterSpacing:"-1px", color:"#111", marginBottom:4 }}>
                {s.n!==null ? <Counter to={s.n} suffix={s.suf} /> : s.raw}
              </div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#b8b7b2", letterSpacing:"0.06em" }}>{s.label}</div>
            </TiltCard>
          ))}
        </div>
      </Reveal>

      <Reveal delay={400}>
        <div ref={mag.ref} onMouseMove={mag.onMove} onMouseLeave={mag.onLeave} style={{ display:"inline-block" }}>
          <button onClick={()=>setActive("contacto")}
            style={{ transform:`translate(${mag.pos.x}px,${mag.pos.y}px)`, transition:"transform 0.3s cubic-bezier(.22,1,.36,1)",
              display:"flex", alignItems:"center", gap:10, padding:"12px 24px", borderRadius:10, border:"none",
              background:"#111", color:"#fff", fontSize:13.5, fontWeight:500, cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 20px rgba(0,0,0,0.16)" }}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,0.28)";e.currentTarget.style.background="#1a1a1a";}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.16)";e.currentTarget.style.background="#111";}}>
            Hablemos <span style={{ display:"inline-block", transition:"transform 0.2s", fontSize:15 }}
              onMouseEnter={e=>e.currentTarget.style.transform="translateX(5px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="translateX(0)"}>→</span>
          </button>
        </div>
      </Reveal>
    </div>
  );
}

function ServiceRow({ s, i, hov, setHov }) {
  return (
    <Reveal key={s.n} delay={i*45}>
      <div onMouseEnter={()=>setHov(s.n)} onMouseLeave={()=>setHov(null)}
        style={{ display:"grid", gridTemplateColumns:"32px 1fr auto", alignItems:"center", gap:16,
          padding:"16px 0", paddingLeft:hov===s.n?10:0, borderBottom:"1px solid #eeede9",
          transition:"padding 0.25s cubic-bezier(.22,1,.36,1)" }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:hov===s.n?"#111":"#c5c4c0", transition:"color 0.2s" }}>{s.n}</span>
        <div>
          <h3 style={{ fontSize:13.5, fontWeight:500, color:"#111", marginBottom:3, letterSpacing:hov===s.n?"0.01em":"0", transition:"letter-spacing 0.2s" }}>{s.title}</h3>
          <p style={{ fontSize:12, color:"#a8a7a3", lineHeight:1.5 }}>{s.desc}</p>
        </div>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:hov===s.n?"#111":"#c5c4c0", whiteSpace:"nowrap", transition:"color 0.2s, transform 0.2s", transform:hov===s.n?"translateX(-3px)":"none", display:"inline-block" }}>{s.price}</span>
      </div>
    </Reveal>
  );
}

function Servicios({ setActive }) {
  const [hov, setHov] = useState(null);
  const [tab, setTab] = useState("empresa");

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", maxWidth:660, width:"100%" }}>
      <Reveal>
        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.22em", color:"#b0afa9", textTransform:"uppercase", marginBottom:20 }}>✦ Servicios</p>
      </Reveal>

      {/* Tab switcher */}
      <Reveal delay={40}>
        <div style={{ display:"flex", gap:6, marginBottom:28, padding:4, background:"#f5f4f1", borderRadius:10, width:"fit-content" }}>
          {[{id:"empresa",label:"Para empresas ✦"},{id:"particular",label:"Particulares"}].map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ padding:"7px 16px", borderRadius:8, border:"none", cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif", fontSize:12.5, fontWeight:tab===t.id?500:400,
                background:tab===t.id?"#fff":"transparent",
                color:tab===t.id?"#111":"#9a9995",
                boxShadow:tab===t.id?"0 1px 4px rgba(0,0,0,0.08)":"none",
                transition:"all 0.2s cubic-bezier(.22,1,.36,1)" }}>
              {t.label}
            </button>
          ))}
        </div>
      </Reveal>

      {tab === "empresa" && (
        <div key="empresa">
          <Reveal delay={60}>
            <div style={{ marginBottom:16, padding:"12px 16px", background:"#111", borderRadius:10, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em" }}>ENFOQUE PRINCIPAL</span>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.85)", lineHeight:1.5 }}>Trabajamos principalmente con empresas que necesitan presencia digital sólida, herramientas a medida y resultados medibles.</span>
            </div>
          </Reveal>
          <div style={{ borderTop:"1px solid #eeede9" }}>
            {SERVICES_EMPRESA.map((s,i) => <ServiceRow key={s.n} s={s} i={i} hov={hov} setHov={setHov} />)}
          </div>
        </div>
      )}

      {tab === "particular" && (
        <div key="particular">
          <div style={{ borderTop:"1px solid #eeede9" }}>
            {SERVICES_PARTICULAR.map((s,i) => <ServiceRow key={s.n} s={s} i={i} hov={hov} setHov={setHov} />)}
          </div>
        </div>
      )}

      <Reveal delay={400}>
        <div style={{ marginTop:20, padding:"14px 18px", background:"#f5f4f1", borderRadius:12 }}>
          <span style={{ fontSize:12.5, color:"#6b6a67", lineHeight:1.6 }}>
            ¿Tienes un proyecto específico en mente?{" "}
            <button onClick={()=>setActive("contacto")} style={{ color:"#111", fontWeight:500, background:"none", border:"none", cursor:"pointer", padding:0, textDecoration:"underline", textUnderlineOffset:3, fontFamily:"'DM Sans',sans-serif", fontSize:12.5 }}>
              Hablamos y te damos presupuesto sin compromiso →
            </button>
          </span>
        </div>
      </Reveal>
    </div>
  );
}

function SobreMi({ setActive }) {
  const items = [
    { label:"Formación", title:"Autodidacta", sub:"Aprendizaje continuo y práctico" },
    { label:"Experiencia", title:"1–2 años", sub:"Proyectos reales para clientes" },
    { label:"Estilo", title:"Cercano y directo", sub:"Hablas conmigo, no con una agencia" },
    { label:"Ubicación", title:"Madrid, España", sub:"Disponible en remoto" },
  ];
  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", maxWidth:520 }}>
      <Reveal>
        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.22em", color:"#b0afa9", textTransform:"uppercase", marginBottom:36 }}>✦ Sobre mí</p>
      </Reveal>
      <Reveal delay={60}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,#e8e4dc,#d0ccc4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:600, color:"#6b6a67", flexShrink:0, boxShadow:"inset 0 1px 0 rgba(255,255,255,0.6),0 2px 8px rgba(0,0,0,0.08)" }}>AS</div>
          <div>
            <p style={{ fontSize:15, fontWeight:600, color:"#111", marginBottom:2, letterSpacing:"-0.3px" }}>Antonio Sánchez</p>
            <p style={{ fontSize:11.5, color:"#a8a7a3" }}>Programador & Diseñador Web · Madrid</p>
          </div>
        </div>
      </Reveal>
      <Reveal delay={120}>
        <p style={{ fontSize:13.5, color:"#6b6a67", lineHeight:1.85, marginBottom:12 }}>
          Soy un desarrollador web autodidacta con 1–2 años de experiencia construyendo páginas que combinan{" "}
          <strong style={{ color:"#111", fontWeight:500 }}>diseño cuidado y código limpio</strong>. Aprendí por mi cuenta porque me apasiona crear cosas que funcionan y se ven bien.
        </p>
        <p style={{ fontSize:13.5, color:"#6b6a67", lineHeight:1.85, marginBottom:28 }}>
          Me especializo en webs para <strong style={{ color:"#111", fontWeight:500 }}>empresas que quieren resultados</strong> — webs corporativas, apps internas y e-commerce B2B. También trabajo con autónomos y artistas que necesitan presencia digital sin complicaciones.
        </p>
      </Reveal>
      <Reveal delay={200}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
          {items.map(it => (
            <TiltCard key={it.label} style={{ background:"#fff", border:"1px solid #e8e7e4", borderRadius:14, padding:"16px 18px" }}>
              <p style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#b8b7b2", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:6 }}>{it.label}</p>
              <p style={{ fontSize:13, fontWeight:500, color:"#111", marginBottom:2 }}>{it.title}</p>
              <p style={{ fontSize:11.5, color:"#a8a7a3" }}>{it.sub}</p>
            </TiltCard>
          ))}
        </div>
      </Reveal>
      <Reveal delay={280}>
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", background:"#eef6f0", border:"1px solid #d4ead9", borderRadius:12 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:"#2d6a3f", flexShrink:0, animation:"pulseGreen 2s ease-in-out infinite", display:"inline-block" }} />
          <p style={{ fontSize:12.5, color:"#2d6a3f", lineHeight:1.6 }}>
            Actualmente disponible para nuevos proyectos.{" "}
            <button onClick={()=>setActive("contacto")} style={{ fontWeight:500, color:"#1a4d2c", background:"none", border:"none", cursor:"pointer", padding:0, textDecoration:"underline", textUnderlineOffset:3, fontFamily:"'DM Sans',sans-serif", fontSize:12.5 }}>Hablamos →</button>
          </p>
        </div>
      </Reveal>
    </div>
  );
}

/* ─── SUCCESS SCREEN ─── */
function SuccessScreen({ name, onReset }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 50); return () => clearTimeout(t); }, []);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:24, textAlign:"center", fontFamily:"'DM Sans',sans-serif",
      opacity:show?1:0, transform:show?"translateY(0)":"translateY(20px)", transition:"all 0.6s cubic-bezier(.22,1,.36,1)" }}>
      <div style={{ width:72, height:72, borderRadius:"50%", background:"#eef6f0", border:"1px solid #d4ead9", display:"flex", alignItems:"center", justifyContent:"center",
        animation:"bounceIn 0.7s cubic-bezier(.22,1,.36,1)" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2d6a3f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div>
        <h2 style={{ fontSize:22, fontWeight:500, letterSpacing:"-0.5px", color:"#111", marginBottom:8 }}>¡Mensaje enviado{name ? `, ${name}` : ""}!</h2>
        <p style={{ fontSize:13, color:"#6b6a67", maxWidth:260, lineHeight:1.75, margin:"0 auto" }}>
          Te respondo en menos de 24 horas. Mientras tanto, echa un ojo a mis servicios 👀
        </p>
      </div>
      <button onClick={onReset}
        style={{ padding:"9px 22px", borderRadius:9, border:"1px solid #e5e5e3", background:"#fff", fontSize:12.5, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", color:"#6b6a67", transition:"all 0.2s" }}
        onMouseEnter={e=>{e.currentTarget.style.background="#f5f4f1";e.currentTarget.style.color="#111";e.currentTarget.style.borderColor="#bbb";}}
        onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.color="#6b6a67";e.currentTarget.style.borderColor="#e5e5e3";}}>
        Enviar otro mensaje →
      </button>
    </div>
  );
}

/* ─── CONTACTO ─── */
function Contacto() {
  const [form, setForm] = useState({ name:"", email:"", type:"Diseño web", msg:"" });
  const [status, setStatus] = useState(null);
  const [focused, setFocused] = useState(null);
  const [sent, setSent] = useState(false);
  const [shake, setShake] = useState(false);

  const change = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSend = async () => {
    setStatus(null);
    if (!form.name || !form.email || !form.msg) { setStatus("error_fields"); triggerShake(); return; }
    if (!form.email.includes("@")) { setStatus("error_email"); triggerShake(); return; }
    setStatus("loading");
    try {
      if (!window.emailjs) throw new Error("EmailJS not ready");
      await window.emailjs.send("service_kr4zfyb", "template_0q2ldup", {
        from_name: form.name,
        from_email: form.email,
        project_type: form.type,
        message: form.msg,
        to_email: "8corama@gmail.com",
      });
      setSent(true);
    } catch (err) {
      console.error(err);
      setStatus("error_send");
      triggerShake();
    }
  };

  if (sent) return <SuccessScreen name={form.name} onReset={() => { setSent(false); setStatus(null); }} />;

  const fieldStyle = (name) => ({
    width:"100%", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#111", background:"#fff",
    border:`1px solid ${focused===name?"#888":"#e5e5e3"}`, borderRadius:9, padding:"10px 14px", outline:"none",
    transition:"border-color 0.2s, box-shadow 0.2s",
    boxShadow:focused===name?"0 0 0 3px rgba(0,0,0,0.05)":"none"
  });

  const errMsg = status==="error_fields" ? "Por favor rellena todos los campos."
    : status==="error_email" ? "Introduce un email válido."
    : status==="error_send" ? "Error al enviar. Escríbeme a 8corama@gmail.com" : null;

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", maxWidth:440 }}>
      <Reveal>
        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.22em", color:"#b0afa9", textTransform:"uppercase", marginBottom:36 }}>✦ Contacto</p>
      </Reveal>
      <Reveal delay={60}>
        <p style={{ fontSize:13.5, color:"#6b6a67", lineHeight:1.75, marginBottom:24 }}>
          ¿Tienes un proyecto en mente? Cuéntame qué necesitas — te respondo en menos de 24 horas.
        </p>
      </Reveal>

      <Reveal delay={120}>
        <div style={{ animation: shake ? "shakeX 0.45s ease" : "none" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            {[{label:"Nombre",name:"name",ph:"Tu nombre",type:"text"},{label:"Email",name:"email",ph:"tu@correo.com",type:"email"}].map(f => (
              <div key={f.name}>
                <label style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#b8b7b2", textTransform:"uppercase", letterSpacing:"0.12em", display:"block", marginBottom:6 }}>{f.label}</label>
                <input name={f.name} type={f.type} value={form[f.name]} onChange={change} placeholder={f.ph}
                  onFocus={()=>setFocused(f.name)} onBlur={()=>setFocused(null)} style={fieldStyle(f.name)} />
              </div>
            ))}
          </div>

          <div style={{ marginBottom:10 }}>
            <label style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#b8b7b2", textTransform:"uppercase", letterSpacing:"0.12em", display:"block", marginBottom:6 }}>Tipo de proyecto</label>
            <select name="type" value={form.type} onChange={change}
              onFocus={()=>setFocused("type")} onBlur={()=>setFocused(null)}
              style={{ ...fieldStyle("type"), cursor:"pointer", WebkitAppearance:"none", backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23aaa'/%3E%3C/svg%3E\")", backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", paddingRight:30 }}>
              {["Diseño web","Desarrollo web","Portfolio artístico","Tienda online","Mantenimiento","Otro"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:"#b8b7b2", textTransform:"uppercase", letterSpacing:"0.12em", display:"block", marginBottom:6 }}>Mensaje</label>
            <textarea name="msg" value={form.msg} onChange={change} placeholder="Cuéntame en qué puedo ayudarte..." rows={4}
              onFocus={()=>setFocused("msg")} onBlur={()=>setFocused(null)}
              style={{ ...fieldStyle("msg"), resize:"none", lineHeight:1.65 }} />
          </div>

          <button onClick={handleSend} disabled={status==="loading"}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              padding:"11px 0", borderRadius:10, border:"none",
              background:status==="loading"?"#555":"#111", color:"#fff",
              fontSize:13.5, fontWeight:500, cursor:status==="loading"?"not-allowed":"pointer",
              fontFamily:"'DM Sans',sans-serif", transition:"background 0.2s, transform 0.1s, box-shadow 0.2s",
              boxShadow:"0 4px 16px rgba(0,0,0,0.12)" }}
            onMouseEnter={e=>{ if(status!=="loading"){e.currentTarget.style.background="#1a1a1a";e.currentTarget.style.boxShadow="0 6px 24px rgba(0,0,0,0.22)";} }}
            onMouseLeave={e=>{ e.currentTarget.style.background=status==="loading"?"#555":"#111";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.12)"; }}
            onMouseDown={e=>e.currentTarget.style.transform="scale(0.98)"}
            onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
            {status==="loading" ? (
              <>
                <svg style={{ animation:"spin 0.7s linear infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Enviando...
              </>
            ) : "Enviar mensaje →"}
          </button>

          {errMsg && (
            <div style={{ marginTop:12, padding:"11px 14px", background:"#fdf0f0", border:"1px solid #f5d5d5", borderRadius:9, fontSize:12.5, color:"#a03030", textAlign:"center" }}>
              {errMsg}
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN APP
═══════════════════════════════════════ */

export default function Portfolio() {
  useEmailJS();
  useFonts();
  const [active, setActive] = useState("inicio");
  const [exiting, setExiting] = useState(false);
  const [next, setNext] = useState(null);

  const navigate = useCallback((id) => {
    if (id === active || exiting) return;
    setExiting(true);
    setNext(id);
    setTimeout(() => {
      setActive(id);
      setExiting(false);
      setNext(null);
    }, 260);
  }, [active, exiting]);

  const panels = {
    inicio:     <Inicio setActive={navigate} />,
    servicios:  <Servicios setActive={navigate} />,
    "sobre-mi": <SobreMi setActive={navigate} />,
    contacto:   <Contacto />,
  };

  return (
    <>
      <style>{`
        @keyframes pulseGreen { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(1.35)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes bounceIn { 0%{transform:scale(0) rotate(-8deg);opacity:0} 60%{transform:scale(1.2) rotate(3deg)} 80%{transform:scale(0.95)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes slideIn3D { from{opacity:0;transform:perspective(800px) translateX(40px) rotateY(-10deg) scale(0.97)} to{opacity:1;transform:perspective(800px) translateX(0) rotateY(0deg) scale(1)} }
        @keyframes slideOut3D { from{opacity:1;transform:perspective(800px) translateX(0) rotateY(0deg) scale(1)} to{opacity:0;transform:perspective(800px) translateX(-40px) rotateY(10deg) scale(0.97)} }
        @keyframes navDot { 0%{transform:scale(0)} 60%{transform:scale(1.4)} 100%{transform:scale(1)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        input::placeholder,textarea::placeholder { color:#c5c4c0; }
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#d1d0cc;border-radius:99px}
        ::-webkit-scrollbar-track{background:transparent}
      `}</style>

      <Cursor />

      <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"#f8f7f5", fontFamily:"'DM Sans',sans-serif" }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width:232, flexShrink:0, background:"#ffffff", borderRight:"1px solid #eeede9", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"28px 16px", position:"relative", zIndex:10 }}>

          {/* Subtle sidebar bg texture */}
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 80% 20%, rgba(220,216,208,0.18) 0%, transparent 60%)", pointerEvents:"none" }} />

          <div style={{ position:"relative" }}>
            {/* Avatar */}
            <div style={{ marginBottom:26 }}>
              <div style={{ width:46, height:46, borderRadius:"50%", background:"linear-gradient(135deg,#e8e4dc,#ccc9c0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:600, color:"#6b6a67", marginBottom:14, boxShadow:"inset 0 1px 0 rgba(255,255,255,0.65), 0 2px 6px rgba(0,0,0,0.06)", transition:"transform 0.3s cubic-bezier(.22,1,.36,1)" }}
                onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08) rotate(-3deg)"}
                onMouseLeave={e=>e.currentTarget.style.transform="scale(1) rotate(0deg)"}>AS</div>
              <p style={{ fontSize:13.5, fontWeight:600, color:"#111", marginBottom:1, letterSpacing:"-0.2px" }}>Antonio Sánchez</p>
              <p style={{ fontSize:11.5, color:"#b0afa9", marginBottom:12 }}>Programador & Diseñador Web</p>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#eef6f0", border:"1px solid #d4ead9", padding:"3px 10px 3px 8px", borderRadius:999, fontSize:11, color:"#2d6a3f" }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#2d6a3f", animation:"pulseGreen 2s ease-in-out infinite", display:"inline-block", flexShrink:0 }} />
                Disponible
              </div>
            </div>

            {/* Nav */}
            <nav style={{ display:"flex", flexDirection:"column", gap:2 }}>
              {NAV.map(n => {
                const isActive = active === n.id;
                return (
                  <button key={n.id} onClick={()=>navigate(n.id)}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:9,
                      fontSize:13, fontFamily:"'DM Sans',sans-serif",
                      background:isActive?"#f5f4f1":"transparent", color:isActive?"#111":"#9a9995",
                      fontWeight:isActive?500:400, border:"none", cursor:"pointer", textAlign:"left", width:"100%",
                      transition:"all 0.2s cubic-bezier(.22,1,.36,1)",
                      transform:isActive?"translateX(2px)":"translateX(0)" }}
                    onMouseEnter={e=>{ if(!isActive){e.currentTarget.style.background="#f9f8f6";e.currentTarget.style.color="#666";} }}
                    onMouseLeave={e=>{ if(!isActive){e.currentTarget.style.background="transparent";e.currentTarget.style.color="#9a9995";} }}>
                    <span style={{ width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center",
                      borderRadius:6, fontSize:12, background:isActive?"#fff":"transparent", color:isActive?"#111":"#c5c4c0",
                      boxShadow:isActive?"0 1px 3px rgba(0,0,0,0.08)":"none", transition:"all 0.2s", flexShrink:0 }}>{n.icon}</span>
                    {n.label}
                    {isActive && <span style={{ marginLeft:"auto", width:4, height:4, borderRadius:"50%", background:"#111", animation:"navDot 0.3s cubic-bezier(.22,1,.36,1)" }} />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom CTA */}
          <div style={{ position:"relative", display:"flex", flexDirection:"column", gap:10 }}>
            <button onClick={()=>navigate("contacto")}
              style={{ width:"100%", padding:"10px 0", fontSize:13, fontWeight:500, fontFamily:"'DM Sans',sans-serif", background:"#111", color:"#fff", border:"none", borderRadius:9, cursor:"pointer", transition:"all 0.25s cubic-bezier(.22,1,.36,1)", boxShadow:"0 2px 8px rgba(0,0,0,0.12)" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#1a1a1a";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="#111";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.12)"; }}>
              Solicitar presupuesto
            </button>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
              {[{label:"Discord",url:"https://discord.com/users/antoniosanchez"},{label:"GitHub",url:"https://github.com/00010-0"},{label:"IG",url:"https://www.instagram.com/antoniosanchezzgz/"}].map(s=>(
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ padding:"7px 4px", fontSize:11, fontFamily:"'DM Sans',sans-serif", color:"#9a9995", background:"#f5f4f1", border:"1px solid #e8e7e4", borderRadius:8, textAlign:"center", textDecoration:"none", transition:"all 0.18s", display:"block" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="#fff";e.currentTarget.style.color="#111";e.currentTarget.style.borderColor="#bbb";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 3px 10px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="#f5f4f1";e.currentTarget.style.color="#9a9995";e.currentTarget.style.borderColor="#e8e7e4";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none"; }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex:1, overflow:"hidden", position:"relative" }}>
          {/* BG deco */}
          <div style={{ position:"absolute", top:-100, right:-100, width:360, height:360, borderRadius:"50%", background:"radial-gradient(circle, rgba(220,215,205,0.28) 0%, transparent 70%)", pointerEvents:"none", zIndex:0 }} />
          <div style={{ position:"absolute", bottom:-80, left:"20%", width:260, height:260, borderRadius:"50%", background:"radial-gradient(circle, rgba(200,220,210,0.18) 0%, transparent 70%)", pointerEvents:"none", zIndex:0 }} />
          <Particles />

          {/* Panel */}
          <div key={active} style={{
            position:"absolute", inset:0, overflowY:"auto", padding:"3rem 3.5rem", zIndex:1,
            animation: `${exiting?"slideOut3D":"slideIn3D"} 0.28s cubic-bezier(.22,1,.36,1) forwards`
          }}>
            {panels[active]}
          </div>
        </main>
      </div>
    </>
  );
}
