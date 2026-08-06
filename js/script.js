/* ===== CONTATO =====
   Os links do WhatsApp e do Instagram já estão fixos direto no HTML
   (procure por "wa.me" e por "instagram.com" acima) e funcionam sem JavaScript.
   Para trocar o número depois, basta substituir 5561991826565 em todos os lugares. */
document.getElementById("yr").textContent=new Date().getFullYear();
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;

/* rotating specialty word */
(function(){
  const el=document.getElementById("rotWord");
  if(!el) return;
  const words=["hipertrofia","emagrecimento","estética","força","autoestima"];
  const fit=()=>{
    el.style.fontSize="";
    const box=el.parentElement, max=box.clientWidth-4;
    let fs=parseFloat(getComputedStyle(el).fontSize);
    let guard=0;
    while(el.scrollWidth>max && fs>20 && guard++<60){ fs-=1.5; el.style.fontSize=fs+"px"; }
  };
  fit();
  window.addEventListener("resize",fit,{passive:true});
  if(reduce) return;
  let i=0;
  setInterval(()=>{
    el.style.opacity=0; el.style.transform="translateY(-12px)";
    setTimeout(()=>{ i=(i+1)%words.length; el.textContent=words[i]; fit();
      el.style.opacity=1; el.style.transform="translateY(0)"; },280);
  },2300);
})();

/* scroll progress + hero parallax */
const prog=document.getElementById("prog"), heroMedia=document.getElementById("heroMedia");
const onScrollFx=()=>{
  const h=document.documentElement, y=h.scrollTop, max=h.scrollHeight-h.clientHeight;
  prog.style.width=(max>0?(y/max*100):0)+"%";
  if(heroMedia && !reduce && y<window.innerHeight) heroMedia.style.transform="translateY("+(y*0.22)+"px)";
};
window.addEventListener("scroll",onScrollFx,{passive:true}); onScrollFx();

/* reveal on scroll */
const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}});},{threshold:.14});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

/* count up */
const cUp=new IntersectionObserver((es)=>{es.forEach(e=>{
  if(!e.isIntersecting) return; cUp.unobserve(e.target);
  const el=e.target, end=+el.dataset.count, suf=el.dataset.suffix||""; let t0=null; const dur=1400;
  const step=(ts)=>{if(!t0)t0=ts; const p=Math.min((ts-t0)/dur,1); el.textContent=Math.floor((1-Math.pow(1-p,3))*end)+suf; if(p<1)requestAnimationFrame(step);};
  requestAnimationFrame(step);
})},{threshold:.6});
document.querySelectorAll("[data-count]").forEach(el=>cUp.observe(el));

/* transformation carousel */
(function(){
  const tcar=document.getElementById("tcar"), tdots=document.getElementById("tdots");
  if(!tcar||!tdots) return;
  const cards=[...tcar.children];
  cards.forEach((_,i)=>{const b=document.createElement("button");b.setAttribute("aria-label","Ver transformação "+(i+1));
    b.addEventListener("click",()=>cards[i].scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"}));tdots.appendChild(b);});
  const dots=[...tdots.children];
  const setActive=()=>{const c=tcar.getBoundingClientRect(),cx=c.left+c.width/2;let best=0,bd=1e9;
    cards.forEach((el,i)=>{const r=el.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-cx);if(d<bd){bd=d;best=i;}});
    dots.forEach((d,i)=>d.classList.toggle("on",i===best));};
  tcar.addEventListener("scroll",()=>{clearTimeout(window.__ds);window.__ds=setTimeout(setActive,60);},{passive:true});
  setActive();
  if(!reduce){const nud=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){nud.disconnect();
    setTimeout(()=>{tcar.scrollBy({left:64,behavior:"smooth"});setTimeout(()=>tcar.scrollBy({left:-64,behavior:"smooth"}),480);},700);}});},{threshold:.5});nud.observe(tcar);}
})();

/* carrossel 3D de depoimentos
   Cada card vira um pouco no eixo Y conforme se afasta do centro da tela.
   O script so calcula a posicao e entrega para o CSS pelas variaveis --p, --a e --s. */
(function(){
  const car=document.getElementById("vcar"), dots=document.getElementById("vdots"), hint=document.getElementById("vhint");
  if(!car) return;
  const cards=[...car.children];

  /* com um depoimento so nao existe o que deslizar: some com as bolinhas e a dica */
  if(cards.length<2){ if(dots) dots.remove(); if(hint) hint.remove(); }
  else if(dots){
    cards.forEach((_,i)=>{const b=document.createElement("button");b.setAttribute("aria-label","Ver depoimento "+(i+1));
      b.addEventListener("click",()=>cards[i].scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"}));dots.appendChild(b);});
  }
  const dotEls=dots?[...dots.children]:[];

  let ticking=0;
  const paint=()=>{
    ticking=0;
    const box=car.getBoundingClientRect(), cx=box.left+box.width/2, reach=box.width*.62;
    let best=0, bd=1e9;
    cards.forEach((card,i)=>{
      const r=card.getBoundingClientRect(), d=r.left+r.width/2-cx;
      if(Math.abs(d)<bd){bd=Math.abs(d);best=i;}
      if(reduce) return;
      const p=Math.max(-1,Math.min(1,d/reach)), a=Math.abs(p), inner=card.firstElementChild;
      inner.style.setProperty("--p",p.toFixed(3));
      inner.style.setProperty("--a",a.toFixed(3));
      inner.style.setProperty("--s",p<0?"1":"-1");
    });
    dotEls.forEach((d,i)=>d.classList.toggle("on",i===best));
  };
  const queue=()=>{ if(!ticking) ticking=requestAnimationFrame(paint); };
  car.addEventListener("scroll",queue,{passive:true});
  window.addEventListener("resize",queue,{passive:true});
  paint();
})();

/* FAB */
const fab=document.querySelector(".fab");
window.addEventListener("scroll",()=>{
  const y=window.scrollY;
  if(y>460) fab.classList.add("show"); else fab.classList.remove("show");
  fab.classList.add("expand"); clearTimeout(window.__ft); window.__ft=setTimeout(()=>fab.classList.remove("expand"),1600);
},{passive:true});
