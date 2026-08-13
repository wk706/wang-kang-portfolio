"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { motion } from "framer-motion";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const assetPath = (path: string) => `${basePath}${path}`;

const projects = [
  {
    number: "01", slug: "abyss-pawnshop", title: "ABYSS PAWNSHOP", zh: "我在深渊开当铺，天道急疯了", type: "AIGC SHORT DRAMA",
    cover: assetPath("/media/abyss-cover.png"), video: assetPath("/media/abyss-1.mp4"),
    data: ["06 集", "成片 06:13", "23 个场景", "完成 53 个镜头", "采用 47 个镜头"],
    roles: ["场景生成", "视频生成", "镜头设计", "剪辑"],
  },
  {
    number: "02", slug: "reborn-emperor", title: "REBORN PUPPET EMPEROR", zh: "重生傀儡皇帝，觉醒帝王系统", type: "AIGC SHORT DRAMA",
    cover: assetPath("/media/emperor-cover.png"), video: assetPath("/media/emperor-1.mp4"), vertical: true,
    data: ["02 集", "成片 02:09", "04 个场景", "完成 13 个镜头", "采用 13 个镜头"],
    roles: ["脚本生成", "场景生成", "镜头设计", "视频生成", "剪辑"],
  },
];

const productionProcess = [{zh:"脚本",en:"SCRIPT"},{zh:"角色",en:"CHARACTER"},{zh:"场景",en:"ENVIRONMENT"},{zh:"分镜",en:"STORYBOARD"},{zh:"图像",en:"IMAGE"},{zh:"视频",en:"VIDEO"},{zh:"剪辑",en:"EDIT"},{zh:"成片",en:"FINAL"}];
const skills = ["脚本", "分镜", "角色", "场景", "图像", "视频", "剪辑", "镜头", "视觉叙事"];
const shots = [
  { code:"C01", project:"深渊当铺", source:assetPath("/media/abyss-1.mp4"), poster:assetPath("/media/shots/abyss-1.jpg"), start:5, camera:"推进 / 全景", slug:"abyss-pawnshop" },
  { code:"C02", project:"深渊当铺", source:assetPath("/media/abyss-2.mp4"), poster:assetPath("/media/shots/abyss-2.jpg"), start:7, camera:"环绕 / 中景", slug:"abyss-pawnshop" },
  { code:"C03", project:"深渊当铺", source:assetPath("/media/abyss-3.mp4"), poster:assetPath("/media/shots/abyss-3.jpg"), start:7, camera:"俯仰 / 大全景", slug:"abyss-pawnshop" },
  { code:"C04", project:"深渊当铺", source:assetPath("/media/abyss-4.mp4"), poster:assetPath("/media/shots/abyss-4.jpg"), start:7, camera:"跟拍 / 全景", slug:"abyss-pawnshop" },
  { code:"C05", project:"深渊当铺", source:assetPath("/media/abyss-5.mp4"), poster:assetPath("/media/shots/abyss-5.jpg"), start:7, camera:"动作 / 近景", slug:"abyss-pawnshop" },
  { code:"C06", project:"深渊当铺", source:assetPath("/media/abyss-6.mp4"), poster:assetPath("/media/shots/abyss-6.jpg"), start:7, camera:"推进 / 特写", slug:"abyss-pawnshop" },
  { code:"C07", project:"傀儡皇帝", source:assetPath("/media/emperor-1.mp4"), poster:assetPath("/media/shots/emperor-1.jpg"), start:7, camera:"固定 / 中景", slug:"reborn-emperor", vertical:true },
  { code:"C08", project:"傀儡皇帝", source:assetPath("/media/emperor-1.mp4"), poster:assetPath("/media/shots/emperor-2.jpg"), start:24, camera:"推进 / 特写", slug:"reborn-emperor", vertical:true },
  { code:"C09", project:"傀儡皇帝", source:assetPath("/media/emperor-1.mp4"), poster:assetPath("/media/shots/emperor-3.jpg"), start:41, camera:"插入 / 细节", slug:"reborn-emperor", vertical:true },
  { code:"C10", project:"傀儡皇帝", source:assetPath("/media/emperor-1.mp4"), poster:assetPath("/media/shots/emperor-4.jpg"), start:58, camera:"近景 / 反应", slug:"reborn-emperor", vertical:true },
];

function DigitalCore({ className = "" }: { className?: string }) {
  const mount = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mount.current) return;
    const host = mount.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, host.clientWidth / host.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 4.5);
    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2") && !probe.getContext("webgl")) {
      host.classList.add("no-webgl");
      return;
    }
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      host.classList.add("no-webgl");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    const vertex = `uniform float uTime; uniform float uScroll; varying vec3 vNormal; varying vec3 vPosition; void main(){ vNormal=normalize(normalMatrix*normal); vec3 p=position; float wave=sin(p.y*5.0+uTime*.45)*.055+sin(p.x*7.0-uTime*.3)*.025; wave+=sin((p.x+p.y+p.z)*9.0-uTime*.65)*.018*(1.0+uScroll); p+=normal*wave; vPosition=p; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }`;
    const fragment = `uniform float uTime; uniform float uScroll; varying vec3 vNormal; varying vec3 vPosition; void main(){ vec3 viewDir=normalize(cameraPosition-vPosition); float fresnel=pow(1.0-abs(dot(vNormal,viewDir)),2.4); float vein=smoothstep(.78,.98,sin(vPosition.y*18.0+vPosition.x*11.0+uTime*.3)); float pulse=.5+.5*sin(uTime*.8-length(vPosition)*8.0); vec3 base=vec3(.008,.012,.02); vec3 ice=vec3(.22,.78,1.0); vec3 silver=vec3(.72,.78,.84); vec3 color=base+fresnel*ice*(.62+uScroll*.42)+vein*silver*.055+pulse*ice*.018; gl_FragColor=vec4(color,.94); }`;
    const geometry = new THREE.TorusKnotGeometry(1.05, 0.35, 220, 40, 2, 3);
    const material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms: { uTime: { value: 0 }, uScroll: { value: 0 } }, transparent: true });
    const core = new THREE.Mesh(geometry, material); core.rotation.set(0.25, -0.45, 0.15); scene.add(core);
    const cage = new THREE.Mesh(new THREE.IcosahedronGeometry(1.72, 2), new THREE.MeshBasicMaterial({ color: 0x88ddff, wireframe: true, transparent: true, opacity: 0.045 })); scene.add(cage);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.82, 0.004, 8, 180), new THREE.MeshBasicMaterial({ color: 0xb5efff, transparent: true, opacity: 0.36 })); ring.rotation.set(1.2, 0.15, 0.35); scene.add(ring);
    const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(.58, 3), new THREE.MeshBasicMaterial({ color:0x46d9ff, wireframe:true, transparent:true, opacity:.14 })); scene.add(inner);
    const ringTwo = new THREE.Mesh(new THREE.TorusGeometry(2.18, .0025, 6, 180), new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.13})); ringTwo.rotation.set(.25,1.05,-.18); scene.add(ringTwo);
    const particleCount = innerWidth < 768 ? 80 : 240;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount*3);
    for(let i=0;i<particleCount;i++){ particlePositions[i*3]=(Math.random()-.5)*9; particlePositions[i*3+1]=(Math.random()-.5)*6; particlePositions[i*3+2]=(Math.random()-.5)*6; }
    particleGeometry.setAttribute("position",new THREE.BufferAttribute(particlePositions,3));
    const particleMaterial = new THREE.PointsMaterial({color:0x8debff,size:.014,transparent:true,opacity:.32,sizeAttenuation:true});
    const particles = new THREE.Points(particleGeometry,particleMaterial); scene.add(particles);
    const pointer = new THREE.Vector2(), target = new THREE.Vector2();
    const onMove = (e: PointerEvent) => { target.x = (e.clientX / innerWidth - 0.5) * 2; target.y = -(e.clientY / innerHeight - 0.5) * 2; };
    const resize = () => { camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(host.clientWidth, host.clientHeight); };
    window.addEventListener("pointermove", onMove, { passive: true }); window.addEventListener("resize", resize);
    const clock = new THREE.Clock(); let raf = 0;
    const render = () => { const t=clock.getElapsedTime(); pointer.lerp(target,.035); const scroll=Math.min(scrollY/innerHeight,1); if(!reduceMotion){ core.rotation.y=t*.055+pointer.x*.12; core.rotation.x=.25+Math.sin(t*.22)*.05+pointer.y*.07; core.position.y=Math.sin(t*.35)*.06; core.scale.setScalar(1+scroll*.22); cage.rotation.y=-t*.018; ring.rotation.z=t*.025; ringTwo.rotation.z=-t*.013; inner.rotation.x=t*.08; inner.rotation.y=-t*.11; particles.rotation.y=t*.008+pointer.x*.025; particles.rotation.x=pointer.y*.018; } camera.position.z=4.5-scroll*2.75; camera.position.x+=(pointer.x*.16-camera.position.x)*.035; camera.position.y+=(pointer.y*.1-camera.position.y)*.035; material.uniforms.uTime.value=t; material.uniforms.uScroll.value=scroll; renderer.render(scene,camera); raf=requestAnimationFrame(render); };
    render();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", onMove); window.removeEventListener("resize", resize); geometry.dispose(); material.dispose(); particleGeometry.dispose(); particleMaterial.dispose(); renderer.dispose(); host.removeChild(renderer.domElement); };
  }, []);
  return <div ref={mount} className={`digital-core ${className}`} aria-hidden="true" />;
}

function Cursor() {
  const dot=useRef<HTMLDivElement>(null), ring=useRef<HTMLDivElement>(null); const [label,setLabel]=useState("");
  useEffect(()=>{ if(matchMedia("(pointer: coarse)").matches)return; let x=-100,y=-100,rx=-100,ry=-100,raf=0; const move=(e:MouseEvent)=>{x=e.clientX;y=e.clientY}; const over=(e:MouseEvent)=>setLabel((e.target as HTMLElement).closest<HTMLElement>("[data-cursor]")?.dataset.cursor||""); const tick=()=>{rx+=(x-rx)*.35;ry+=(y-ry)*.35;dot.current?.style.setProperty("transform",`translate3d(${x}px,${y}px,0)`);ring.current?.style.setProperty("transform",`translate3d(${rx}px,${ry}px,0)`);raf=requestAnimationFrame(tick)}; addEventListener("mousemove",move);addEventListener("mouseover",over);tick();return()=>{removeEventListener("mousemove",move);removeEventListener("mouseover",over);cancelAnimationFrame(raf)}},[]);
  return <><div ref={dot} className="cursor-dot"/><div ref={ring} className={`cursor-ring ${label?"is-active":""}`}><span>{label}</span></div></>;
}

function ProjectPanel({project}:{project:typeof projects[number]}){
  const video=useRef<HTMLVideoElement>(null);
  return <article className="project-panel reveal"><Link href={`/projects/${project.slug}`} className="project-link" data-cursor="查看" onMouseEnter={()=>video.current?.play()} onMouseLeave={()=>{video.current?.pause();if(video.current)video.current.currentTime=0}}><div className={`project-media ${project.vertical?"vertical-media":""}`}><img src={project.cover} alt={`${project.zh} 项目主视觉`}/><video ref={video} src={project.video} muted loop playsInline preload="metadata"/><div className="project-shade"/><div className="project-index">{project.number} / 02</div></div><div className="project-heading"><div><p>AI 漫剧 / {project.type}</p><h3>{project.zh}</h3><span>{project.title}</span></div><i>↗</i></div></Link><div className="project-meta"><div>{project.data.map(x=><span key={x}>{x}</span>)}</div><div>{project.roles.map(x=><span key={x}>{x}</span>)}</div></div></article>;
}

function ShotCard({shot,index}:{shot:typeof shots[number],index:number}){
  const video=useRef<HTMLVideoElement>(null);
  const play=()=>{if(!video.current)return;video.current.currentTime=shot.start;video.current.play().catch(()=>{});};
  const stop=()=>{video.current?.pause();};
  return <Link href={`/projects/${shot.slug}`} className={`shot-card ${shot.vertical?"is-vertical":""}`} data-cursor="播放" onMouseEnter={play} onFocus={play} onMouseLeave={stop} onBlur={stop}>
    <div className="shot-visual"><img src={shot.poster} alt={`${shot.project} ${shot.code} 镜头静帧`}/><video ref={video} src={shot.source} muted loop playsInline preload="metadata"/><span>0{index+1}</span></div>
    <div className="shot-info"><strong>{shot.code}</strong><span>{shot.project}</span><span>{shot.camera}</span></div>
  </Link>;
}

export default function Home(){
  const [loaded,setLoaded]=useState(false),[progress,setProgress]=useState(0),[activeSkill,setActiveSkill]=useState("AIGC"),[contactStatus,setContactStatus]=useState("邮箱地址已直接显示，可一键复制"),[showWechat,setShowWechat]=useState(false);
  const copyEmail=async()=>{try{await navigator.clipboard.writeText("819406604@qq.com");setContactStatus("邮箱已复制 · 819406604@qq.com")}catch{setContactStatus("请手动复制：819406604@qq.com")}};
  useEffect(()=>{let n=0;const timer=window.setInterval(()=>{n+=Math.ceil((100-n)*.16);if(n>=99){n=100;clearInterval(timer)}setProgress(n)},45);const done=window.setTimeout(()=>{setProgress(100);setLoaded(true)},1700);return()=>{clearInterval(timer);clearTimeout(done)}},[]);
  useEffect(()=>{gsap.registerPlugin(ScrollTrigger);const lenis=new Lenis({duration:1.18,smoothWheel:true});let id=0;const raf=(time:number)=>{lenis.raf(time);id=requestAnimationFrame(raf)};id=requestAnimationFrame(raf);const ctx=gsap.context(()=>{gsap.utils.toArray<HTMLElement>(".reveal").forEach(el=>gsap.fromTo(el,{y:70,opacity:0},{y:0,opacity:1,duration:1.25,ease:"power3.out",scrollTrigger:{trigger:el,start:"top 84%"}}));gsap.to(".hero-content",{yPercent:-26,opacity:0,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:true}});gsap.to(".hero .digital-core",{scale:1.38,opacity:.08,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:true}});gsap.fromTo(".shot-card",{x:90,opacity:0},{x:0,opacity:1,duration:1.1,stagger:.07,ease:"power3.out",scrollTrigger:{trigger:".shot-archive",start:"top 72%"}});gsap.utils.toArray<HTMLElement>(".project-panel").forEach(panel=>gsap.fromTo(panel.querySelector(".project-media"),{scale:.91},{scale:1,ease:"none",scrollTrigger:{trigger:panel,start:"top bottom",end:"center center",scrub:true}}))});return()=>{cancelAnimationFrame(id);lenis.destroy();ctx.revert()}},[]);
  return <main>
    <div className={`preloader ${loaded?"is-done":""}`}><div><span>王康 / WANG KANG</span><small>AIGC 视觉创作者</small></div><strong>{String(progress).padStart(2,"0")}</strong><p>正在载入数字空间</p></div>
    <Cursor/><div className="noise"/>
    <header className="site-nav"><Link href="#top" data-cursor="打开" className="wordmark">王康<sup>®</sup></Link><nav><Link href="#works">作品</Link><Link href="#shots">镜头</Link><Link href="#process">流程</Link><Link href="#about">关于</Link></nav><Link href="#contact" className="nav-contact" data-cursor="打开">联系 <span>↗</span></Link></header>
    <section id="top" className="hero"><DigitalCore/><div className="hero-grid" aria-hidden="true"/><div className="hero-content"><div className="hero-kicker"><span>AIGC 视觉创作者</span><span>2026 作品集 / PORTFOLIO</span></div><motion.h1 initial={{opacity:0,y:40}} animate={loaded?{opacity:1,y:0}:{}} transition={{duration:1.4,ease:[.16,1,.3,1]}}>让想象<br/><em>成为</em><br/>流动影像。</motion.h1><p className="hero-note">AI × CINEMA × STORYTELLING<br/>王康 / WANG KANG</p></div><a href="#works" className="scroll-cue" data-cursor="打开"><span>向下探索 / SCROLL</span><i>↓</i></a></section>
    <section id="works" className="works section-pad"><div className="section-head reveal"><span>01 / 精选作品 · SELECTED WORKS</span><h2>世界，<br/>正在运动。</h2><p>从场景资产到最终镜头，将生成式影像组织成完整的电影叙事。</p></div><div className="projects">{projects.map(p=><ProjectPanel project={p} key={p.slug}/>)}</div></section>
    <section id="shots" className="shot-archive"><div className="shot-archive-head reveal"><span>01B / 镜头档案 · SHOT ARCHIVE</span><h2>十个镜头，<br/><em>两个世界。</em></h2><p>从世界建立、角色反应到空间运动，悬停即可进入镜头。</p></div><div className="shot-rail">{shots.map((shot,i)=><ShotCard key={`${shot.code}-${i}`} shot={shot} index={i}/>)}</div><div className="rail-hint">拖动 / 滑动浏览　→</div></section>
    <section id="process" className="process-section section-pad"><div className="section-head process-title reveal"><span>02 / 制作流程 · PROCESS</span><h2>从提示词，<br/>到最终<br/><em>画面。</em></h2></div><div className="process-track"><div className="track-line"/>{productionProcess.map((item,i)=><div className="process-node reveal" key={item.en}><span>{String(i+1).padStart(2,"0")} / {item.en}</span><h3>{item.zh}</h3><p>{["叙事拆解与节奏设计","统一角色身份与视觉锚点","构建可持续复用的世界资产","把故事转换为镜头语言","建立电影级静帧与构图","控制运动、表演与连续性","组织节奏、声音与情绪","交付完整可观看的影像"][i]}</p></div>)}</div></section>
    <section className="capabilities section-pad"><div className="section-head reveal"><span>03 / 创作能力 · CAPABILITIES</span><h2>一个系统，<br/>多种能力。</h2></div><div className="skill-network reveal"><div className="skill-core"><small>当前能力 / FOCUS</small><strong>{activeSkill}</strong><p>{activeSkill==="AIGC"?"视觉系统 / 电影语言":"构图 / 连续性 / 运动"}</p></div>{skills.map((skill,i)=><button key={skill} style={{"--i":i} as React.CSSProperties} onMouseEnter={()=>setActiveSkill(skill)} onFocus={()=>setActiveSkill(skill)} onMouseLeave={()=>setActiveSkill("AIGC")} data-cursor="打开">{skill}</button>)}</div></section>
    <section id="about" className="about section-pad"><div className="about-mark reveal"><img src={assetPath("/media/wang-kang-mark.png")} alt="王康个人数字标识"/></div><div className="about-copy reveal"><span>04 / 关于 · ABOUT</span><h2>逐帧构建，<br/>属于我的<br/><em>影像世界。</em></h2><p>我是王康，一名专注 AIGC 漫剧与 AI 电影影像的视觉创作者。我把脚本、场景、分镜、镜头生成与剪辑视为同一条叙事链路，让每个生成画面都服务于角色、节奏和世界观。</p><dl><div><dt>创作方向 / FOCUS</dt><dd>AIGC 漫剧制作<br/>AI 电影影像</dd></div><div><dt>所在地 / BASE</dt><dd>中国 · 成都<br/>开放项目合作</dd></div></dl></div></section>
    <div className="tools-ticker"><div>MIDJOURNEY　 KLING　 RUNWAY　 COMFYUI　 CHATGPT　 PREMIERE PRO　 AFTER EFFECTS　 PHOTOSHOP　 MIDJOURNEY　 KLING　 RUNWAY　 COMFYUI　 CHATGPT　 PREMIERE PRO　 AFTER EFFECTS　 PHOTOSHOP</div></div>
    <section id="contact" className="contact"><DigitalCore className="contact-core"/><div className="contact-copy reveal"><span>05 / 联系 · CONTACT</span><h2>一起创造，<br/><em>新的影像。</em></h2><div className="contact-direct"><span>邮箱 / EMAIL</span><strong>819406604@qq.com</strong><button onClick={copyEmail} data-cursor="复制">复制邮箱</button></div><div className="contact-links"><button onClick={()=>setShowWechat(true)} data-cursor="打开">查看微信二维码 ↗</button><a href={assetPath("/media/wang-kang-resume.docx")} download="王康个人简历.docx" data-cursor="下载">下载个人简历 ↓</a></div><p className="contact-status" aria-live="polite">{contactStatus}</p></div>{showWechat&&<div className="wechat-overlay" role="dialog" aria-modal="true" aria-label="王康微信二维码"><button className="wechat-close" onClick={()=>setShowWechat(false)} aria-label="关闭微信二维码">关闭 ×</button><div className="wechat-panel"><span>微信 / 王康</span><img src={assetPath("/media/wechat-qr.jpg")} alt="王康微信二维码"/><strong>w18780454910</strong><button onClick={()=>{navigator.clipboard?.writeText("w18780454910");setContactStatus("微信号已复制 · W18780454910")}}>复制微信号</button></div></div>}</section>
    <footer><div><span>王康 / WANG KANG</span><small>AIGC 视觉创作者</small></div><div>中国 · 成都 / CHENGDU</div><div>2026</div><strong>王康®</strong></footer>
  </main>;
}
