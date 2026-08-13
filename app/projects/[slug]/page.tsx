import Link from "next/link";
import { notFound } from "next/navigation";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const assetPath = (path: string) => `${basePath}${path}`;

const cases = {
  "abyss-pawnshop": {
    index:"01", title:"ABYSS PAWNSHOP", zh:"我在深渊开当铺，天道急疯了", cover:assetPath("/media/abyss-cover.png"), format:"landscape",
    intro:"一座存在于万劫深渊的典当行，以天道厌恶之物为筹码，展开复仇、交易与权力反转。",
    stats:["06 集","成片 06:13","23 个场景","完成 53 个镜头","采用 47 个镜头"],
    roles:["场景生成","视频生成","镜头设计","剪辑"], videos:[1,2,3,4,5,6].map(n=>assetPath(`/media/abyss-${n}.mp4`)), posters:[1,2,3,4,5,6].map(n=>assetPath(`/media/shots/abyss-${n}.jpg`)), starts:[5,7,7,7,7,7],
  },
  "reborn-emperor": {
    index:"02", title:"REBORN PUPPET EMPEROR", zh:"重生傀儡皇帝，觉醒帝王系统", cover:assetPath("/media/emperor-cover.png"), format:"portrait",
    intro:"被命运操控的傀儡皇帝在权力迷局中觉醒，以帝王系统重新夺回叙事与王朝的控制权。",
    stats:["02 集","成片 02:09","04 个场景","完成 13 个镜头","采用 13 个镜头"],
    roles:["脚本生成","场景生成","镜头设计","视频生成","剪辑"], videos:Array(4).fill(assetPath("/media/emperor-1.mp4")), posters:[1,2,3,4].map(n=>assetPath(`/media/shots/emperor-${n}.jpg`)), starts:[7,24,41,58],
  },
} as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(cases).map((slug) => ({ slug }));
}

export default async function ProjectPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params; const project=cases[slug as keyof typeof cases]; if(!project)notFound();
  const stages=["概念设定","脚本拆解","角色设计","场景生成","分镜设计","镜头设计","视频生成","剪辑","最终成片"];
  return <main className="case-page">
    <header className="case-nav"><Link href="/">← 王康</Link><span>{project.index} / 项目详情</span><Link href="/#contact">联系 ↗</Link></header>
    <section className="case-hero"><img src={project.cover} alt={`${project.zh} 主视觉`}/><div className="case-overlay"/><div className="case-title"><span>AIGC 漫剧 / 2026</span><h1>{project.zh}</h1><p>{project.title}</p></div><div className="case-scroll">向下查看制作流程 ↓</div></section>
    <section className="case-intro"><div><span>作品介绍 / THE FILM</span><p>{project.intro}</p></div><div>{project.stats.map(x=><span key={x}>{x}</span>)}</div><div>{project.roles.map(x=><span key={x}>{x}</span>)}</div></section>
    <section className="case-process"><aside><span>制作系统 / PRODUCTION</span><h2>从创意，<br/>到最终<br/>画面。</h2></aside><div>{stages.map((s,i)=><article key={s}><span>{String(i+1).padStart(2,"0")}</span><h3>{s}</h3><p>{["确定世界观、冲突与情绪核心。","将剧情拆成可执行的节拍与场次。","建立角色视觉锚点与身份连续性。","生成可复用、可反打的统一场景资产。","把叙事节拍转换为镜头序列。","控制景别、机位、运动与视觉连续性。","生成角色动作、表演与空间运动。","重建节奏、声音和情绪推进。","筛选并交付完整可观看的影像。"] [i]}</p></article>)}</div></section>
    <section className={`film-strip ${project.format==="portrait"?"portrait-strip":""}`}><div className="strip-head"><span>镜头设计 / SHOT DESIGN</span><h2>精选<br/>镜头序列。</h2><p>横向浏览生成镜头。点击视频可播放或暂停。</p></div><div className="strip-scroll">{project.videos.map((v,i)=><figure key={`${v}-${i}`}><video src={`${v}#t=${project.starts[i]}`} muted loop playsInline controls preload="metadata" poster={project.posters[i]}/><figcaption><span>C{String(i+1).padStart(2,"0")}</span><span>{i%2?"跟拍 / 中景":"推进 / 全景"}</span><span>AI 视频</span></figcaption></figure>)}</div></section>
    <section className={`case-final ${project.format==="portrait"?"portrait-final":""}`}><video src={project.videos[0]} muted loop autoPlay playsInline poster={project.cover}/><div><span>最终成片 / FINAL FILM</span><h2>世界。<br/>运动。<br/>故事。</h2></div></section>
    <section className="case-next"><span>下一个项目 / NEXT</span><Link href={slug==="abyss-pawnshop"?"/projects/reborn-emperor":"/projects/abyss-pawnshop"}>{slug==="abyss-pawnshop"?"重生傀儡皇帝，觉醒帝王系统":"我在深渊开当铺，天道急疯了"} ↗</Link></section>
  </main>;
}
