/* Chapter 4 · Exploring diversity of matter using separation techniques.
   Each IIFE guards on its root id so this file is safe on any lesson page. */
(function(){
'use strict';
function el(t,c,h){const n=document.createElement(t); if(c)n.className=c; if(h!=null)n.innerHTML=h; return n;}

/* ==============================================================
   magnetLab — iron filings and sulfur
   ============================================================== */
(function magnetLab(){
  const root=document.getElementById('magnetLab'); if(!root) return;
  const magnet=root.querySelector('.mg-magnet'), filings=root.querySelectorAll('.mg-iron');
  const sweep=root.querySelector('.mg-sweep'), reset=root.querySelector('.mg-reset');
  const out=root.querySelector('.mg-out'), left=root.querySelector('.mg-left');
  let done=false;
  function render(){
    magnet.setAttribute('transform', done?'translate(0 -46)':'translate(0 0)');
    filings.forEach((f,i)=>{
      f.setAttribute('transform', done?'translate('+(6-i*2.2)+' -84)':'translate(0 0)');
    });
    out.textContent = done ? 'Iron filings — attracted to the magnet and lifted clear' : '— nothing collected yet —';
    left.textContent = done ? 'Sulfur — non-magnetic, left behind in the dish' : 'Iron filings and sulfur, mixed together';
  }
  sweep.addEventListener('click',()=>{ done=true; render(); });
  reset.addEventListener('click',()=>{ done=false; render(); });
  render();
})();

/* ==============================================================
   filterLab — filtration, and why it fails on a solution
   ============================================================== */
(function filterLab(){
  const root=document.getElementById('filterLab'); if(!root) return;
  const pour=root.querySelector('.fl-pour'), reset=root.querySelector('.fl-reset');
  const pick=root.querySelectorAll('.fl-pick button');
  const residue=root.querySelector('.fl-residue'), filtrate=root.querySelector('.fl-filtrate');
  const beakerMix=root.querySelector('.fl-mix');
  const rRes=root.querySelector('.fl-rres'), rFil=root.querySelector('.fl-rfil'), verdict=root.querySelector('.fl-verdict');
  const SAMP={
    chalk:{name:'chalk and water', insoluble:true, solidCol:'#C9D3DC', liqCol:'rgba(200,220,235,.5)',
      res:'Chalk — the particles are bigger than the pores, so they stay on the filter paper',
      fil:'Water — the particles are small enough to pass through the pores',
      ok:'Separated. Filtration works because the chalk is <strong>insoluble</strong> — it stays as solid particles big enough to be trapped.'},
    salt:{name:'salt solution', insoluble:false, solidCol:'rgba(0,0,0,0)', liqCol:'rgba(205,222,236,.55)',
      res:'Nothing. The filter paper is empty.',
      fil:'Salt solution — <em>all</em> of it went straight through',
      ok:'<strong>Nothing was separated.</strong> The salt has dissolved, so its particles are as small as the water particles and pass straight through the pores. To get salt out of salt solution you need <strong>evaporation</strong>, not filtration.'}
  };
  let cur='chalk', poured=false;
  function render(){
    const s=SAMP[cur];
    pick.forEach(b=>b.setAttribute('aria-pressed', b.dataset.s===cur?'true':'false'));
    beakerMix.setAttribute('fill', poured?'rgba(0,0,0,0)':s.liqCol);
    beakerMix.style.opacity = poured?0:1;
    residue.style.opacity = (poured && s.insoluble)?1:0;
    filtrate.style.opacity = poured?1:0;
    filtrate.setAttribute('fill', s.liqCol);
    rRes.innerHTML = poured? s.res : '—';
    rFil.innerHTML = poured? s.fil : '—';
    verdict.innerHTML = poured? s.ok : 'Pick a mixture, then pour it through.';
  }
  pick.forEach(b=>b.addEventListener('click',()=>{ cur=b.dataset.s; poured=false; render(); }));
  pour.addEventListener('click',()=>{ poured=true; render(); });
  reset.addEventListener('click',()=>{ poured=false; render(); });
  render();
})();

/* ==============================================================
   evapLab — evaporation: you keep the solid, you lose the liquid
   ============================================================== */
(function evapLab(){
  const root=document.getElementById('evapLab'); if(!root) return;
  const go=root.querySelector('.ev-go'), reset=root.querySelector('.ev-reset');
  const liquid=root.querySelector('.ev-liquid'), solid=root.querySelector('.ev-solid');
  const steam=root.querySelector('.ev-steam'), flame=root.querySelector('.ev-flame');
  const kept=root.querySelector('.ev-kept'), lost=root.querySelector('.ev-lost'), note=root.querySelector('.ev-note');
  let t=null;
  function set(p){
    liquid.setAttribute('transform','translate(0 '+(p*9)+') scale(1 '+(1-p*0.95).toFixed(3)+')');
    liquid.style.opacity=1-p*0.9;
    solid.style.opacity=p;
    steam.style.opacity=(p>0&&p<1)?0.85:0;
    flame.style.opacity=(p>0&&p<1)?1:(p>=1?0:0.35);
    kept.textContent = p>=1?'Salt — left behind in the crucible as the residue':'—';
    lost.textContent = p>=1?'Water — escaped into the air as water vapour, and is gone':'—';
    note.innerHTML = p>=1
      ? 'Evaporation gives you the <strong>dissolved solid</strong>. The liquid is not collected — it escapes as vapour. Choose evaporation only when the <em>solid</em> is what you want.'
      : 'Water changes state at a much lower temperature than salt, so the water leaves first and the salt stays.';
  }
  go.addEventListener('click',()=>{
    if(t) clearInterval(t); const st=performance.now();
    t=setInterval(()=>{ const p=Math.min(1,(performance.now()-st)/2600); set(p); if(p>=1){clearInterval(t);t=null;} },40);
  });
  reset.addEventListener('click',()=>{ if(t)clearInterval(t); t=null; set(0); });
  set(0);
})();

/* ==============================================================
   distillLab — distillation: you keep the liquid
   ============================================================== */
(function distillLab(){
  const root=document.getElementById('distillLab'); if(!root) return;
  const go=root.querySelector('.dt-go'), reset=root.querySelector('.dt-reset');
  const flame=root.querySelector('.dt-flame'), bub=root.querySelector('.dt-bubbles');
  const vap=root.querySelector('.dt-vapour'), drops=root.querySelector('.dt-drops');
  const collected=root.querySelector('.dt-collected'), flaskLiq=root.querySelector('.dt-flaskliq');
  const temp=root.querySelector('.dt-temp'), kept=root.querySelector('.dt-kept'), leftb=root.querySelector('.dt-left');
  const stage=root.querySelector('.dt-stage');
  let t=null;
  function set(p){
    flame.style.opacity = p>0&&p<1 ? 1 : (p>=1?0:.35);
    bub.style.opacity   = p>0.08&&p<1 ? 1 : 0;
    vap.style.opacity   = p>0.18&&p<1 ? .9 : 0;
    drops.style.opacity = p>0.34&&p<1 ? 1 : 0;
    collected.setAttribute('height',(p*26).toFixed(1));
    collected.setAttribute('y',(176-p*26).toFixed(1));
    flaskLiq.setAttribute('opacity',(1-p*0.28).toFixed(2));
    temp.textContent = p<=0 ? '25 °C' : (p<0.18 ? Math.round(25+p*420)+' °C' : '100 °C');
    kept.textContent = p>=1 ? 'Pure water — the distillate, collected in the beaker' : '—';
    leftb.textContent = p>=1 ? 'Salt — remains in the distillation flask' : '—';
    stage.innerHTML = p<=0 ? 'Ready. The flask holds salt solution.'
      : p<0.18 ? 'Heating the salt solution…'
      : p<0.34 ? 'The water boils. Steam rises and passes into the condenser.'
      : p<1 ? 'The condenser is cooled by cold water, so the steam <strong>condenses</strong> back into liquid water.'
      : 'Done. Distillation gives you the <strong>liquid</strong> — the opposite of evaporation.';
  }
  go.addEventListener('click',()=>{
    if(t) clearInterval(t); const st=performance.now();
    t=setInterval(()=>{ const p=Math.min(1,(performance.now()-st)/4200); set(p); if(p>=1){clearInterval(t);t=null;} },40);
  });
  reset.addEventListener('click',()=>{ if(t)clearInterval(t); t=null; set(0); });
  set(0);
})();

/* ==============================================================
   chromLab — paper chromatography
   ============================================================== */
(function chromLab(){
  const root=document.getElementById('chromLab'); if(!root) return;
  const go=root.querySelector('.ch-go'), reset=root.querySelector('.ch-reset');
  const front=root.querySelector('.ch-front');
  const spots=[...root.querySelectorAll('.ch-spot')];   /* data-rise = fraction of solvent front */
  const stage=root.querySelector('.ch-stage'), order=root.querySelector('.ch-order');
  const START=196, TOP=54;                              /* y of start line and max solvent height */
  let t=null;
  function set(p){
    const fy = START - (START-TOP)*p;
    front.setAttribute('y1',fy); front.setAttribute('y2',fy);
    front.style.opacity = p>0?1:0;
    spots.forEach(s=>{
      const r=parseFloat(s.dataset.rise);
      s.setAttribute('cy', (START - (START-TOP)*p*r).toFixed(1));
    });
    stage.innerHTML = p<=0 ? 'A drop of ink sits on the start line, just above the water.'
      : p<1 ? 'Water travels up the paper, carrying the substances in the ink with it.'
      : 'The substances have separated. The paper is now a <strong>chromatogram</strong>.';
    order.innerHTML = p>=1
      ? '<strong>Yellow</strong> travelled furthest — it is the <strong>most soluble</strong> in water. Then green, then red. <strong>Grey did not move at all</strong> — it is <strong>insoluble</strong>, so it stays on the start line.'
      : '';
  }
  go.addEventListener('click',()=>{
    if(t) clearInterval(t); const st=performance.now();
    t=setInterval(()=>{ const p=Math.min(1,(performance.now()-st)/3400); set(p); if(p>=1){clearInterval(t);t=null;} },40);
  });
  reset.addEventListener('click',()=>{ if(t)clearInterval(t); t=null; set(0); });
  set(0);
})();

/* ==============================================================
   planLab — plan a multi-step separation (the flagship)
   ============================================================== */
(function planLab(){
  const root=document.getElementById('planLab'); if(!root) return;

  const SUB={
    iron   :{label:'iron filings', magnetic:true,  soluble:false, col:'#5A6B7A'},
    sulfur :{label:'sulfur',       magnetic:false, soluble:false, col:'#E8C33B'},
    sand   :{label:'sand',         magnetic:false, soluble:false, col:'#C6A87C'},
    sawdust:{label:'sawdust',      magnetic:false, soluble:false, col:'#B08954'},
    chalk  :{label:'chalk',        magnetic:false, soluble:false, col:'#DCE3EA'},
    salt   :{label:'salt',         magnetic:false, soluble:true,  col:'#F2F5F8'},
    sugar  :{label:'sugar',        magnetic:false, soluble:true,  col:'#EFE8DA'}
  };
  const TASKS={
    a:{mix:['iron','sulfur'],           water:false, name:'iron filings + sulfur'},
    b:{mix:['chalk'],                   water:true,  name:'chalk stirred into water'},
    c:{mix:['salt'],                    water:true,  name:'salt solution'},
    d:{mix:['sand','salt'],             water:true,  name:'sand + salt + water'},
    e:{mix:['iron','salt','sawdust'],   water:false, name:'iron filings + salt + sawdust'}
  };

  let task='a', st=null;
  const beakerList=root.querySelector('.pn-beaker'), trayList=root.querySelector('.pn-tray');
  const logBox=root.querySelector('.pn-log'), verdict=root.querySelector('.pn-verdict');
  const waterTag=root.querySelector('.pn-water');

  function fresh(){
    const T=TASKS[task];
    st={ solids:T.mix.slice(), dissolved:[], water:T.water, collected:[], log:[] };
    if(T.water){ st.dissolved=st.solids.filter(s=>SUB[s].soluble); st.solids=st.solids.filter(s=>!SUB[s].soluble); }
    render();
  }
  function chip(k,extra){ return '<span class="pn-chip"><i style="background:'+SUB[k].col+'"></i>'+SUB[k].label+(extra||'')+'</span>'; }

  function render(){
    const T=TASKS[task];
    root.querySelectorAll('.pn-pick button').forEach(b=>b.setAttribute('aria-pressed', b.dataset.t===task?'true':'false'));
    let b='';
    st.solids.forEach(s=>b+=chip(s));
    st.dissolved.forEach(s=>b+=chip(s,' <small>dissolved</small>'));
    if(st.water) b+='<span class="pn-chip pn-w"><i style="background:#9FD0E8"></i>water</span>';
    beakerList.innerHTML = b || '<span class="pn-empty">empty</span>';
    waterTag.textContent = st.water ? 'water present' : 'dry mixture';
    trayList.innerHTML = st.collected.length
      ? st.collected.map(c=>'<span class="pn-got">'+c+'</span>').join('')
      : '<span class="pn-empty">nothing collected yet</span>';
    logBox.innerHTML = st.log.length ? '<ol>'+st.log.map(l=>'<li>'+l+'</li>').join('')+'</ol>' : '';
    const total=TASKS[task].mix.length;
    const gotNames=st.collected.join(' ');
    const done=TASKS[task].mix.every(m=>gotNames.indexOf(SUB[m].label)>-1);
    verdict.innerHTML = done
      ? '<strong>All '+total+' constituents separated.</strong> Notice the order mattered: each step relied on a different physical property.'
      : 'Constituents still to separate: <strong>'+TASKS[task].mix.filter(m=>gotNames.indexOf(SUB[m].label)===-1).map(m=>SUB[m].label).join(', ')+'</strong>';
  }
  function say(msg){ st.log.push(msg); }

  const ACT={
    magnet(){
      const mag=st.solids.filter(s=>SUB[s].magnetic);
      if(!mag.length){ say('Used a <strong>magnet</strong> — nothing was attracted. Nothing here is magnetic.'); return; }
      if(st.water){ say('Used a <strong>magnet</strong> — it still picks up the '+SUB[mag[0]].label+', but they come out wet. Better to use the magnet <em>before</em> adding water.'); }
      st.solids=st.solids.filter(s=>!SUB[s].magnetic);
      mag.forEach(m=>st.collected.push(SUB[m].label));
      if(!st.water) say('Used a <strong>magnet</strong> — attracted the '+mag.map(m=>SUB[m].label).join(' and ')+' and lifted them clear. Everything else is non-magnetic.');
    },
    water(){
      if(st.water){ say('Added more <strong>water</strong> — no change; the soluble solids have already dissolved.'); return; }
      st.water=true;
      const sol=st.solids.filter(s=>SUB[s].soluble);
      st.dissolved=st.dissolved.concat(sol);
      st.solids=st.solids.filter(s=>!SUB[s].soluble);
      say(sol.length
        ? 'Added <strong>water</strong> and stirred — the '+sol.map(s=>SUB[s].label).join(' and ')+' dissolved. The insoluble solids did not.'
        : 'Added <strong>water</strong> and stirred — nothing dissolved, because nothing here is soluble.');
    },
    filter(){
      if(!st.water){ say('Tried to <strong>filter</strong> — but there is no liquid to pour through the funnel. Add water first.'); return; }
      if(!st.solids.length){
        say('<strong>Filtered</strong> — the filter paper is empty and everything passed through. Dissolved particles are as small as water particles, so filtration cannot separate a solution.');
        return;
      }
      const res=st.solids.slice();
      st.solids=[];
      res.forEach(r=>st.collected.push(SUB[r].label+' (residue)'));
      say('<strong>Filtered</strong> — the insoluble '+res.map(r=>SUB[r].label).join(' and ')+' stayed on the filter paper as the <strong>residue</strong>. The '+(st.dissolved.length?'solution':'water')+' passed through as the <strong>filtrate</strong>.');
    },
    evaporate(){
      if(!st.water){ say('Tried to <strong>evaporate</strong> — there is no liquid here to evaporate.'); return; }
      if(st.solids.length){ say('<strong>Evaporated</strong> — but the insoluble '+st.solids.map(s=>SUB[s].label).join(' and ')+' is still in the dish, so what is left is a <em>mixture</em>, not pure solute. Filter first.'); }
      const d=st.dissolved.slice();
      st.dissolved=[]; st.water=false;
      if(d.length && !st.solids.length) d.forEach(x=>st.collected.push(SUB[x].label));
      say(d.length
        ? '<strong>Evaporated</strong> the water — the '+d.map(x=>SUB[x].label).join(' and ')+' is left behind as the residue. The water escaped as vapour and is <em>not</em> collected.'
        : '<strong>Evaporated</strong> the water — nothing was dissolved, so nothing is left behind.');
    },
    distil(){
      if(!st.water){ say('Tried to <strong>distil</strong> — there is no liquid in the flask.'); return; }
      st.collected.push('pure water (distillate)');
      st.water=false;
      say('<strong>Distilled</strong> — the water boiled, passed through the condenser and was collected as pure water. The '+(st.dissolved.length? st.dissolved.map(x=>SUB[x].label).join(' and ')+' stayed behind in the flask' : 'flask is now empty')+'.');
      /* dissolved solute stays in the flask as a solid */
      st.solids=st.solids.concat(st.dissolved); st.dissolved=[];
    }
  };

  root.querySelectorAll('.pn-act button').forEach(b=>{
    b.addEventListener('click',()=>{ ACT[b.dataset.a](); render(); });
  });
  root.querySelectorAll('.pn-pick button').forEach(b=>{
    b.addEventListener('click',()=>{ task=b.dataset.t; fresh(); });
  });
  root.querySelector('.pn-reset').addEventListener('click',fresh);
  fresh();
})();

/* ==============================================================
   waterLab — Four National Taps and the NEWater process
   ============================================================== */
(function waterLab(){
  const root=document.getElementById('waterLab'); if(!root) return;
  const INFO={
    catchment:{t:'Water from local catchment',
      b:'Rainwater is collected through a network of <strong>drains, canals and rivers</strong> and channelled to <strong>17 reservoirs</strong>. At the waterworks it is chemically treated, <strong>filtered</strong> and disinfected — which removes harmful bacteria and makes the water clear, odourless and safe. It is then supplied as tap water, well within WHO guidelines.',
      k:'filtration'},
    imported:{t:'Imported water',
      b:'Singapore imports water from <strong>Johor, Malaysia</strong> to supplement the local catchment. It goes through the same waterworks treatment — chemical treatment, <strong>filtration</strong> and disinfection.',
      k:'filtration'},
    newater:{t:'NEWater',
      b:'Ultra-clean, high-grade <strong>recycled</strong> water made from treated used water in a <strong>three-step</strong> process: <strong>microfiltration → reverse osmosis → ultraviolet disinfection</strong>. It has passed more than 150 000 scientific tests. Mainly supplied to industries; added to reservoirs in dry weather.',
      k:'microfiltration + reverse osmosis'},
    desal:{t:'Desalinated water',
      b:'Pure drinking water obtained from <strong>seawater</strong>. Desalination can be done by distillation or reverse osmosis — but distillation needs a large amount of fuel to heat a big volume of seawater, so it uses a lot of energy and is <strong>unsustainable</strong>. Singapore therefore uses <strong>reverse osmosis</strong>.',
      k:'reverse osmosis'}
  };
  const STEPS={
    micro:{t:'1 · Microfiltration','b':'The treated used water is first purified by <strong>microfiltration</strong>. <strong>Microscopic particles and bacteria</strong> are removed from the water.'},
    ro:{t:'2 · Reverse osmosis',b:'The water is further purified using <strong>reverse osmosis</strong>. Undesirable contaminants, <strong>including viruses</strong>, are removed. The membrane has very small pores that let water particles through but not salt particles, microorganisms or chemical contaminants.'},
    uv:{t:'3 · Ultraviolet disinfection',b:'The water is passed through <strong>ultraviolet light</strong> to destroy any remaining bacteria and viruses. Chemicals are then added so it fully meets water quality requirements.'}
  };
  const panel=root.querySelector('.wl-panel');
  function show(o,key){ panel.innerHTML='<h5>'+o.t+'</h5><p>'+o.b+'</p>'+(o.k?'<p class="wl-key">Separation technique: <strong>'+o.k+'</strong></p>':''); 
    root.querySelectorAll('.wl-btn').forEach(b=>b.setAttribute('aria-pressed', b.dataset.k===key?'true':'false')); }
  root.querySelectorAll('.wl-tap').forEach(b=>b.addEventListener('click',()=>show(INFO[b.dataset.k],b.dataset.k)));
  root.querySelectorAll('.wl-step').forEach(b=>b.addEventListener('click',()=>show(STEPS[b.dataset.k],b.dataset.k)));
  show(INFO.catchment,'catchment');
})();
})();
