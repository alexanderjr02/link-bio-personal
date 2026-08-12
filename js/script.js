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

/* baralho de depoimentos
   Os cards ficam empilhados. O da frente ocupa o lugar 0, os de tras vao
   recuando para a direita. Quem ja passou sai pela esquerda. Da para
   arrastar o card da frente, clicar nas setas ou clicar nas barrinhas. */
(function(){
  const stage=document.getElementById("vdStage");
  if(!stage) return;
  const cards=[...stage.children],
        ctrl=document.getElementById("vdCtrl"),
        rail=document.getElementById("vdRail"),
        prev=document.getElementById("vdPrev"),
        next=document.getElementById("vdNext");

  /* com um depoimento so nao existe o que navegar */
  if(cards.length<2){ if(ctrl) ctrl.remove(); }
  else if(rail){
    cards.forEach((_,i)=>{const b=document.createElement("button");b.type="button";
      b.setAttribute("aria-label","Ver depoimento "+(i+1));
      b.addEventListener("click",()=>show(i));rail.appendChild(b);});
  }
  const bars=rail?[...rail.children]:[];

  /* lugar de cada card no maco: quanto mais atras, mais recuado e menor */
  const SLOT=[{x:0,y:0,s:1,o:1},{x:20,y:10,s:.955,o:.5},{x:36,y:19,s:.915,o:.26}];
  let active=0, drag=null;

  const place=(card,x,y,s,o,z)=>{
    card.style.transform="translate("+x+"px,"+y+"px) scale("+s+")";
    card.style.opacity=o; card.style.zIndex=z;
  };

  const layout=()=>{
    cards.forEach((card,i)=>{
      const d=i-active, front=d===0;
      if(d<0) place(card,-window.innerWidth,0,.96,0,1);        /* ja passou: saiu pela esquerda */
      else{ const sl=SLOT[Math.min(d,SLOT.length-1)];
            place(card,sl.x,sl.y,sl.s,d>=SLOT.length?0:sl.o,30-d); }
      card.classList.toggle("is-front",front);
      card.style.pointerEvents=front?"auto":"none";
      card.setAttribute("aria-hidden",front?"false":"true");
    });
    bars.forEach((b,i)=>b.classList.toggle("on",i===active));
    if(prev) prev.disabled=active===0;
    if(next) next.disabled=active===cards.length-1;
    measure();
  };

  /* O palco acompanha a altura do card da frente, que muda conforme o tamanho
     do depoimento. Os cards de tras recebem essa mesma altura para nao vazarem
     por baixo da pilha quando o texto deles for mais longo. */
  const measure=()=>{
    const front=cards[active], inner=front.firstElementChild, keep=inner.style.height;
    inner.style.height="auto";
    const h=front.offsetHeight;
    inner.style.height=keep;                 /* volta ao valor antigo para a altura poder animar */
    void front.offsetHeight;
    stage.style.height=h+"px";
    cards.forEach(c=>{c.firstElementChild.style.height=h+"px";});
  };
  function show(i){ active=Math.max(0,Math.min(cards.length-1,i)); layout(); }

  if(prev) prev.addEventListener("click",()=>show(active-1));
  if(next) next.addEventListener("click",()=>show(active+1));

  /* arrastar o card da frente */
  if(!reduce && cards.length>1){
    stage.addEventListener("pointerdown",(e)=>{
      if(e.button||!cards[active].contains(e.target)) return;
      drag={x:e.clientX,y:e.clientY,dx:0,locked:null,id:e.pointerId};
    });
    stage.addEventListener("pointermove",(e)=>{
      if(!drag||e.pointerId!==drag.id) return;
      const dx=e.clientX-drag.x, dy=e.clientY-drag.y;
      if(drag.locked===null){
        if(Math.abs(dx)<6&&Math.abs(dy)<6) return;
        drag.locked=Math.abs(dx)>Math.abs(dy);            /* se desceu, a pagina rola normal */
        if(drag.locked){ stage.classList.add("is-dragging");
          try{ stage.setPointerCapture(e.pointerId); }catch(err){} }
      }
      if(!drag.locked) return;
      drag.dx=dx;
      const t=Math.min(Math.abs(dx)/140,1);
      place(cards[active],dx,Math.abs(dx)*.04,1,1-t*.25,30);
      cards[active].style.transform+=" rotate("+(dx*.02)+"deg)";
      const nxt=cards[active+1];                          /* o de tras vem vindo junto */
      if(nxt) place(nxt,SLOT[1].x*(1-t),SLOT[1].y*(1-t),SLOT[1].s+(1-SLOT[1].s)*t,SLOT[1].o+(1-SLOT[1].o)*t,29);
    });
    const drop=(e)=>{
      if(!drag||(e&&e.pointerId!==drag.id)) return;
      const dx=drag.dx, locked=drag.locked; drag=null;
      stage.classList.remove("is-dragging");
      if(!locked) return;
      if(dx<-70) show(active+1); else if(dx>70) show(active-1); else layout();
    };
    stage.addEventListener("pointerup",drop);
    stage.addEventListener("pointercancel",drop);
  }

  /* a altura muda quando a foto carrega ou quando a tela vira */
  cards.forEach(c=>{const im=c.querySelector("img"); if(im&&!im.complete) im.addEventListener("load",measure);});
  window.addEventListener("resize",layout,{passive:true});
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(measure);
  layout();
})();

/* FAB */
const fab=document.querySelector(".fab");
window.addEventListener("scroll",()=>{
  const y=window.scrollY;
  if(y>460) fab.classList.add("show"); else fab.classList.remove("show");
  fab.classList.add("expand"); clearTimeout(window.__ft); window.__ft=setTimeout(()=>fab.classList.remove("expand"),1600);
},{passive:true});
