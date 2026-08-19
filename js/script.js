/* ===== CONTATO =====
   Os links do WhatsApp e do Instagram estao fixos direto no HTML e
   funcionam sem JavaScript. Para trocar o numero, substitua
   5561991826565 no index.html E na constante ZAP aqui embaixo. */
const ZAP = "5561991826565";
const waLink = (msg) => "https://wa.me/" + ZAP + "?text=" + encodeURIComponent(msg);

document.getElementById("yr").textContent = new Date().getFullYear();
const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

/* a palavra que troca sozinha no titulo do topo.
   O "fit" diminui a fonte quando a palavra nao cabe na largura da tela,
   senao "emagrecimento" estoura para fora em celular pequeno. */
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


/* ==========================================================
   SILHUETAS
   Seis corpos desenhados em SVG, sem depender de foto nenhuma.
   Todos saem do mesmo molde, mudando quatro medidas:
     s   meia-largura do ombro
     w   meia-largura da cintura
     b   espessura do braco
     bel quanto a barriga avanca (0 = reta)
   Para deixar um corpo mais largo ou mais seco, mexa so nos numeros
   da tabela CORPOS. Nao precisa mexer no desenho.
   ========================================================== */
const CORPOS={
  magro:     {s:14,w:9, b:5, bel:0},
  medio:     {s:16,w:13,b:6, bel:1.5},
  acima:     {s:17,w:18,b:7, bel:4},
  forma:     {s:19,w:10,b:7, bel:0},
  musculoso: {s:23,w:10,b:9, bel:0},
  muito:     {s:27,w:11,b:11,bel:0}
};

let siSeq=0;
function silhueta(chave){
  const c=CORPOS[chave];
  if(!c) return "";
  const {s,w,b,bel}=c, q=50, id="sil"+(++siSeq);
  return '<svg viewBox="0 0 100 168" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
    '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1">'+
    '<stop offset="0%" stop-color="#C4B5FD"/><stop offset="100%" stop-color="#7C3AED"/>'+
    '</linearGradient></defs><g fill="url(#'+id+')">'+
    '<circle cx="'+q+'" cy="18" r="11"/>'+
    '<path d="M'+(q-6)+',30 L'+(q+6)+',30'+
      ' C'+(q+s*0.5)+',31 '+(q+s)+',34 '+(q+s)+',44'+
      ' L'+(q+s+b)+',50'+
      ' C'+(q+s+b+1)+',64 '+(q+s+b-1)+',78 '+(q+s+b-3)+',88'+
      ' L'+(q+s+b-8)+',88'+
      ' C'+(q+s+b-7)+',78 '+(q+s+b-6)+',64 '+(q+s-2)+',56'+
      ' C'+(q+w+bel)+',70 '+(q+w+bel)+',82 '+(q+w)+',92'+
      ' L'+(q+w+2)+',104 L'+(q+w)+',140 L'+(q+w-1)+',162 L'+(q+3.5)+',162'+
      ' L'+(q+2.5)+',128 L'+q+',116'+
      ' L'+(q-2.5)+',128 L'+(q-3.5)+',162 L'+(q-w+1)+',162 L'+(q-w)+',140'+
      ' L'+(q-w-2)+',104 L'+(q-w)+',92'+
      ' C'+(q-w-bel)+',82 '+(q-w-bel)+',70 '+(q-s+2)+',56'+
      ' C'+(q-s-b+6)+',64 '+(q-s-b+7)+',78 '+(q-s-b+8)+',88'+
      ' L'+(q-s-b+3)+',88'+
      ' C'+(q-s-b+1)+',78 '+(q-s-b-1)+',64 '+(q-s-b)+',50'+
      ' L'+(q-s)+',44'+
      ' C'+(q-s)+',34 '+(q-s*0.5)+',31 '+(q-6)+',30 Z"/>'+
    '</g></svg>';
}
/* desenha em todo elemento que pedir um corpo pelo atributo */
document.querySelectorAll("[data-corpo]").forEach(el=>{ el.innerHTML=silhueta(el.dataset.corpo); });


/* ==========================================================
   PERFIL
   O que a pessoa respondeu. Fica guardado no navegador dela para a
   pagina continuar personalizada numa proxima visita. Nada e enviado
   para lugar nenhum, e por isso a pagina nao precisa de aviso de
   cookies.
   ========================================================== */
const Perfil=(function(){
  const CHAVE="pa.diagnostico";
  /* aba anonima pode recusar o armazenamento: sem o try a pagina quebraria */
  const ler=()=>{ try{ return JSON.parse(localStorage.getItem(CHAVE)||"null"); }catch(e){ return null; } };
  const gravar=(p)=>{ try{ localStorage.setItem(CHAVE,JSON.stringify(p)); }catch(e){} };
  return {ler,gravar};
})();


/* ==========================================================
   TEXTOS DO DIAGNOSTICO
   O objetivo nao e perguntado: ele e DEDUZIDO do intervalo entre o
   corpo que a pessoa tem e o corpo que ela quer. Quem esta acima do
   peso e quer ficar em forma e emagrecimento; quem esta magro e quer
   ficar musculoso e hipertrofia, e assim por diante.
   ========================================================== */
const PERFIL_POR_GAP={
  magro:{ forma:"massa",    musculoso:"massa",    muito:"palco" },
  medio:{ forma:"estetica", musculoso:"massa",    muito:"palco" },
  acima:{ forma:"gordura",  musculoso:"gordura",  muito:"gordura" }
};

/* o tamanho do salto define o prazo mostrado na linha do tempo.
   Estar acima do peso soma esforco, porque tem gordura a perder antes. */
const ESFORCO_HOJE={magro:1, medio:1, acima:2};
const ESFORCO_META={forma:1, musculoso:2, muito:3};
const SALTOS={
  2:{nome:"Ajuste fino",   prazo:"4 a 6 meses",   marco:"Mês 4 a 6"},
  3:{nome:"Salto médio",   prazo:"6 a 10 meses",  marco:"Mês 6 a 10"},
  4:{nome:"Salto grande",  prazo:"10 a 15 meses", marco:"Mês 10 a 15"},
  5:{nome:"Projeto longo", prazo:"1 a 2 anos",    marco:"Ano 1 a 2"}
};

const PERFIS={
  gordura:{
    chip:"Perder gordura",
    custo:"Quantos verões você já passou esperando a segunda-feira certa?",
    linha:[
      ["Semana 1 a 3","Você para de comer no escuro. A balança quase não mexe, e isso é normal."],
      ["Mês 2","A roupa denuncia antes do espelho. É aqui que a maioria desiste."],
      [null,"A foto que você evita tirar deixa de ser um problema."]
    ]
  },
  massa:{
    chip:"Ganhar massa",
    custo:"Dois anos treinando no escuro rendem menos que oito meses com plano.",
    linha:[
      ["Semana 1 a 3","A carga sobe porque enfim existe uma regra pra ela subir."],
      ["Mês 2","Camiseta apertando em lugar novo. Costas e ombro entregam primeiro."],
      [null,"O shape que você tentou sozinho por dois anos."]
    ]
  },
  estetica:{
    chip:"Definição",
    custo:"Você já tem a base. Falta o acabamento, e ele não vem por acaso.",
    linha:[
      ["Semana 1 a 3","A gente separa o que entra em foco do que entra em manutenção."],
      ["Mês 2","Simetria começa a aparecer. A balança não muda e o espelho muda."],
      [null,"O acabamento que aparece de camiseta e sem ela."]
    ]
  },
  palco:{
    chip:"Rumo ao palco",
    custo:"Palco tem data. Preparação sem calendário vira temporada perdida.",
    linha:[
      ["Semana 1 a 3","Definimos se o seu momento é de off-season ou de preparação."],
      ["Mês 2","Blocos fechados e calendário montado até a data."],
      [null,"Você chega no palco no ponto, não no susto."]
    ]
  }
};

const VEREDITO={
  nunca:"Você não está atrasado. Está sem método, que é outra coisa e tem conserto.",
  semplano:"Esforço você já tem. Falta ordem, e ordem se resolve na primeira semana.",
  travado:"Você não travou por falta de esforço. Travou por falta de progressão com critério.",
  lesao:"Seu caso não é treinar mais. É treinar na ordem certa, e isso é decisão técnica."
};

/* qual plano faz sentido para cada resposta, e o motivo que a pessoa le */
const recomendar=(p)=>{
  if(p.onde==="presencial")
    return {plano:"presencial",porque:"você rende mais com alguém corrigindo na hora."};
  if(p.tentou==="semplano")
    return {plano:"essencial",porque:"você já treina firme. Falta o plano, não a cobrança."};
  return {plano:"premium",porque:"sozinho já não está funcionando. Aqui eu ajusto toda semana."};
};

/* junta tudo o que se sabe da pessoa a partir das quatro respostas */
const montarPerfil=(r)=>{
  const chave=(PERFIL_POR_GAP[r.hoje]||{})[r.meta]||"massa";
  const salto=SALTOS[(ESFORCO_HOJE[r.hoje]||1)+(ESFORCO_META[r.meta]||1)]||SALTOS[3];
  return {hoje:r.hoje, meta:r.meta, tentou:r.tentou, onde:r.onde, chave:chave, salto:salto};
};


/* ==========================================================
   A PAGINA SE AJUSTA AO PERFIL
   Depois do diagnostico, o topo, o plano em destaque e a chamada final
   passam a falar do caso especifico da pessoa.
   ========================================================== */
const irPara=(id)=>{
  const alvo=document.getElementById(id);
  if(alvo) alvo.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});
};

const aplicarPerfil=(p)=>{
  const d=PERFIS[p.chave];
  if(!d) return;

  /* o titulo do topo NAO muda: a hero fica sempre com o texto fixo do
     Pedro, com a palavra que troca sozinha. Foi decisao dele. */

  /* quem ja respondeu nao precisa refazer: o botao do topo deixa de
     apontar para a pergunta e passa a levar direto ao plano recomendado */
  const heroCta=document.getElementById("heroCta");
  if(heroCta){
    const tx=heroCta.querySelector(".bt-tx");
    if(tx) tx.textContent="Ver meu plano recomendado";
    heroCta.setAttribute("href","#planos");
  }

  const finalCta=document.getElementById("finalCta");
  if(finalCta) finalCta.href=waLink("Oi Pedro! Fiz o diagnóstico no site ("+d.chip+") e quero começar.");

  /* o destaque sai do plano padrao e vai para o que combina com a resposta */
  const rec=recomendar(p);
  document.querySelectorAll(".plan").forEach(card=>{
    card.classList.remove("is-top");
    const selo=card.querySelector(".plan-tag");
    if(selo) selo.remove();
  });
  const alvo=document.querySelector('.plan[data-plano="'+rec.plano+'"]');
  if(!alvo) return;

  alvo.classList.add("is-top");
  const selo=document.createElement("span");
  selo.className="plan-tag rec";
  selo.textContent="Pra você";
  alvo.prepend(selo);

  const dica=document.getElementById("planHint");
  if(dica){
    dica.textContent="";
    const ponto=document.createElement("i");
    const txt=document.createElement("span");
    const forte=document.createElement("b");
    forte.textContent="Recomendo o "+alvo.querySelector("h3").textContent+": ";
    txt.appendChild(forte);
    txt.appendChild(document.createTextNode(rec.porque));
    dica.appendChild(ponto); dica.appendChild(txt);
    dica.hidden=false;
  }
};


/* ==========================================================
   DIAGNOSTICO EM TELA CHEIA
   Uma pergunta por tela. Cada botao carrega data-val (a chave usada
   pela logica) e data-label (o texto que entra na mensagem do
   WhatsApp).
   ========================================================== */
(function(){
  const tela=document.getElementById("qzFull");
  if(!tela) return;

  const corpo=document.getElementById("qfBody"),
        painels=[...corpo.querySelectorAll(".qf-pane")],
        trilho=document.getElementById("qfRail"),
        voltar=document.getElementById("qfBack"),
        fechar=document.getElementById("qfClose"),
        linha=document.getElementById("qfTl"),
        total=painels.filter(p=>p.dataset.key).length;

  let resp={}, atual=0, focoAnterior=null;

  for(let i=0;i<total;i++) trilho.appendChild(document.createElement("i"));
  const barras=[...trilho.children];

  const pintar=()=>{
    const fim=atual>=total;
    barras.forEach((b,i)=>b.classList.toggle("on",fim||i<=atual));
    voltar.classList.toggle("off",atual===0);
  };

  const mostrar=(i)=>{
    painels.forEach(p=>p.classList.remove("is-on"));
    painels[i].classList.add("is-on");
    atual=i;
    pintar();
    corpo.scrollTop=0;
  };

  const abrir=()=>{
    focoAnterior=document.activeElement;
    tela.hidden=false;
    document.body.classList.add("qz-open");
    requestAnimationFrame(()=>tela.classList.add("on"));
    const primeiro=painels[atual].querySelector("button");
    if(primeiro) primeiro.focus({preventScroll:true});
  };

  const sair=()=>{
    tela.classList.remove("on");
    document.body.classList.remove("qz-open");
    const some=()=>{ tela.hidden=true; if(focoAnterior&&focoAnterior.focus) focoAnterior.focus({preventScroll:true}); };
    if(reduce) some(); else setTimeout(some,320);
  };

  const montarResultado=()=>{
    const p=montarPerfil(resp);
    const d=PERFIS[p.chave];

    document.getElementById("qfSiA").innerHTML=silhueta(p.hoje);
    document.getElementById("qfSiB").innerHTML=silhueta(p.meta);
    document.getElementById("qfSalto").textContent=p.salto.nome;
    document.getElementById("qfPrazo").textContent=p.salto.prazo;
    document.getElementById("qfVered").textContent=VEREDITO[p.tentou];
    document.getElementById("qfCost").textContent=d.custo;

    linha.textContent="";
    d.linha.forEach(([quando,oque])=>{
      const li=document.createElement("li"),
            w=document.createElement("span"),
            t=document.createElement("span");
      w.className="tw"; w.textContent=quando||p.salto.marco;
      t.className="tt"; t.textContent=oque;
      li.appendChild(w); li.appendChild(t); linha.appendChild(li);
    });

    document.getElementById("qfCta").href=waLink(
      "Oi Pedro! Fiz o diagnóstico no site.\n\n"+
      "Hoje: "+resp.hojeTx+"\n"+
      "Quero chegar em: "+resp.metaTx+"\n"+
      "Já tentei: "+resp.tentouTx+"\n"+
      "Quero treinar: "+resp.ondeTx+"\n\n"+
      "Me diz como funciona?");

    Perfil.gravar(p);
    aplicarPerfil(p);

    /* a isca some para quem acabou de responder: pessoa quente nao
       precisa de uma saida mais facil agora */
    const isca=document.getElementById("fallback");
    if(isca) isca.hidden=true;
  };

  const acenderLinha=()=>{
    [...linha.children].forEach((li,i)=>{
      if(reduce){ li.classList.add("on"); return; }
      setTimeout(()=>li.classList.add("on"),260+i*240);
    });
  };

  corpo.addEventListener("click",(e)=>{
    const opcao=e.target.closest(".qf-opt,.qf-corpo");
    if(!opcao) return;
    const chave=opcao.closest(".qf-pane").dataset.key;
    resp[chave]=opcao.dataset.val;
    resp[chave+"Tx"]=opcao.dataset.label;
    const prox=atual+1;
    if(prox===total){ montarResultado(); mostrar(prox); acenderLinha(); }
    else mostrar(prox);
  });

  voltar.addEventListener("click",()=>{
    if(atual===0) return;
    if(atual>=total){ mostrar(total-1); return; }
    mostrar(atual-1);
  });
  fechar.addEventListener("click",sair);

  document.getElementById("qfVerPlano").addEventListener("click",()=>{
    sair();
    setTimeout(()=>irPara("planos"),reduce?0:340);
  });

  document.addEventListener("keydown",(e)=>{
    if(e.key==="Escape"&&!tela.hidden) sair();
  });

  /* a pergunta 1 acontece na propria pagina, a vista. Quem toca numa
     silhueta la ja respondeu: guardamos a resposta e abrimos a tela
     cheia direto na pergunta 2. E por isso que nao existe um botao
     "comecar o quiz": comecar e responder. */
  document.addEventListener("click",(e)=>{
    const inicio=e.target.closest(".qz-inicio");
    if(!inicio) return;
    resp.hoje=inicio.dataset.val;
    resp.hojeTx=inicio.dataset.label;
    /* marca a mesma opcao no painel de dentro, para quem voltar na
       pergunta 1 encontrar coerencia */
    const espelho=painels[0].querySelector('[data-val="'+inicio.dataset.val+'"]');
    if(espelho) espelho.classList.add("is-picked");
    mostrar(1);
    abrir();
  });

  /* retomada: quem ja respondeu numa visita anterior encontra a pagina
     do jeito que deixou, com um atalho para o plano recomendado */
  const salvo=Perfil.ler();
  if(salvo&&PERFIS[salvo.chave]){
    aplicarPerfil(salvo);
    const barra=document.getElementById("resume");
    if(barra){
      document.getElementById("rzPerfil").textContent=PERFIS[salvo.chave].chip;
      barra.hidden=false;
      requestAnimationFrame(()=>barra.classList.add("on"));
      document.getElementById("rzGo").addEventListener("click",()=>{ irPara("planos"); barra.classList.remove("on"); });
      document.getElementById("rzX").addEventListener("click",()=>barra.classList.remove("on"));
    }
  }

  pintar();
})();


/* transformation carousel */
(function(){
  const tcar=document.getElementById("tcar"), tdots=document.getElementById("tdots");
  if(!tcar||!tdots) return;
  const cards=[...tcar.children];

  /* tarja de contexto: foto de antes e depois sem tempo, formato e
     frequencia nao prova nada. Os dados vem do atributo data-meta de
     cada card, separados por barra vertical. Card sem data-meta fica
     exatamente como era antes, sem tarja nenhuma. */
  cards.forEach(card=>{
    const dados=(card.dataset.meta||"").split("|").map(s=>s.trim()).filter(Boolean);
    const moldura=card.querySelector(".ba");
    if(!dados.length||!moldura) return;
    const tarja=document.createElement("div");
    tarja.className="tmeta";
    dados.forEach(d=>{const s=document.createElement("span");s.textContent=d;tarja.appendChild(s);});
    moldura.appendChild(tarja);
  });

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

/* perguntas frequentes
   Abrir uma fecha as outras, para a secao nao virar parede de texto.
   A animacao de altura e do CSS (grid-template-rows), aqui so entra a
   troca de classe e o estado que o leitor de tela precisa. */
(function(){
  const faq=document.querySelector(".faq");
  if(!faq) return;
  [...faq.querySelectorAll(".faq-i")].forEach((item,i)=>{
    const botao=item.querySelector(".faq-q"), resposta=item.querySelector(".faq-a");
    if(!botao||!resposta) return;
    resposta.id="faq-resp-"+(i+1);
    botao.setAttribute("aria-expanded","false");
    botao.setAttribute("aria-controls",resposta.id);
    botao.addEventListener("click",()=>{
      const abrir=!item.classList.contains("is-open");
      faq.querySelectorAll(".faq-i.is-open").forEach(aberto=>{
        aberto.classList.remove("is-open");
        aberto.querySelector(".faq-q").setAttribute("aria-expanded","false");
      });
      if(abrir){ item.classList.add("is-open"); botao.setAttribute("aria-expanded","true"); }
    });
  });
})();

/* origem do lead
   Cada botao verde da pagina manda uma mensagem diferente, entao da para
   saber de que secao veio o contato so lendo a conversa no WhatsApp.
   Este bloco avisa tambem qualquer ferramenta de analytics que estiver
   instalada (Cloudflare Zaraz, Google Analytics ou Meta Pixel). Sem
   ferramenta nenhuma instalada ele nao faz nada e nao quebra nada. */
document.addEventListener("click",(e)=>{
  const link=e.target.closest(".wa-link");
  if(!link) return;
  const secao=link.closest("section,header,footer");
  const origem=link.classList.contains("fab")?"fab":
               link.closest(".qzfull")?"diagnostico":
               (secao&&(secao.id||secao.tagName.toLowerCase()))||"pagina";
  try{
    if(window.zaraz&&window.zaraz.track) window.zaraz.track("whatsapp",{origem:origem});
    if(window.gtag) window.gtag("event","whatsapp",{origem:origem});
    if(window.fbq) window.fbq("track","Contact",{origem:origem});
  }catch(err){}
},{passive:true});

/* FAB */
const fab=document.querySelector(".fab");
window.addEventListener("scroll",()=>{
  const y=window.scrollY;
  if(y>460) fab.classList.add("show"); else fab.classList.remove("show");
  fab.classList.add("expand"); clearTimeout(window.__ft); window.__ft=setTimeout(()=>fab.classList.remove("expand"),1600);
},{passive:true});
