(function(){
  const $ = id => document.getElementById(id);
  const svgEl = document.querySelector('svg');
  const paths = {
    main:  $('pMain'),
    br1:   $('pBr1'),
    br2:   $('pBr2'),
    ret:   $('pReturn')
  };
  const len = {};
  for (const k in paths) len[k] = paths[k].getTotalLength();

  // where energy is dropped, as distance along each path
  const drop = {
    main: [300, 400],   // series resistor
    br1:  [50, 140],
    br2:  [150, 240],
    ret:  null
  };

  const state = {emf:12, rs:1, r1:1, r2:2.5, seriesOpen:false, br1Open:false, br2Open:false};
  let phys = {};

  function compute(){
    const {emf, rs, r1, r2, seriesOpen, br1Open, br2Open} = state;
    let rp, i, vs, vp, i1, i2;
    if (seriesOpen || (br1Open && br2Open)){
      rp = (r1*r2)/(r1+r2);
      i = 0; vs = 0;
      vp = seriesOpen ? 0 : emf;
      i1 = 0; i2 = 0;
    } else if (br1Open){
      rp = r2; i = emf/(rs+rp); vs = i*rs; vp = i*rp; i1 = 0; i2 = i;
    } else if (br2Open){
      rp = r1; i = emf/(rs+rp); vs = i*rs; vp = i*rp; i1 = i; i2 = 0;
    } else {
      rp = (r1*r2)/(r1+r2); i = emf/(rs+rp); vs = i*rs; vp = i*rp; i1 = vp/r1; i2 = vp/r2;
    }
    phys = {emf, rp, i, vs, vp, i1, i2};
  }

  const f1 = n => n.toFixed(1);

  function breakNote(){
    const {seriesOpen, br1Open, br2Open} = state;
    if (seriesOpen) return 'Series link cut — there is no closed loop anywhere, so every scoop of charge freezes in place, even in the branch that was otherwise fine.';
    if (br1Open && br2Open) return 'Both branches cut. The parallel section is a dead end: no current flows, and the full '+f1(state.emf)+' V appears across the gap instead of being shared with the series resistor.';
    if (br1Open) return 'Top branch cut. All the current now squeezes through the bottom branch alone: '+f1(phys.i2)+' A instead of splitting between two roads.';
    if (br2Open) return 'Bottom branch cut. All the current now squeezes through the top branch alone: '+f1(phys.i1)+' A instead of splitting between two roads.';
    return 'Everything connected — current flows as normal. Try cutting a branch, then the series link, and compare what happens.';
  }

  function render(){
    const p = phys;
    $('vEmf').textContent = f1(state.emf)+' V';
    $('vRs').textContent  = f1(state.rs)+' Ω';
    $('vR1').textContent  = f1(state.r1)+' Ω';
    $('vR2').textContent  = f1(state.r2)+' Ω';

    $('tEmf').textContent = f1(state.emf)+' V';
    $('tVolt').textContent= 'reads '+f1(state.emf)+' V';
    $('tRs').textContent  = f1(state.rs)+' Ω';
    $('tR1').textContent  = f1(state.r1)+' Ω';
    $('tR2').textContent  = f1(state.r2)+' Ω';
    $('tVs').textContent  = state.seriesOpen ? 'open — no drop' : 'drops '+f1(p.vs)+' V';
    $('tVp').textContent  = (state.br1Open && state.br2Open) ? 'open — no current' : 'both drop '+f1(p.vp)+' V';
    $('tI1').textContent  = state.br1Open ? 'cut' : f1(p.i1)+' A';
    $('tI2').textContent  = state.br2Open ? 'cut' : f1(p.i2)+' A';
    $('tItot').textContent= f1(p.i)+' A in';

    $('rV').textContent  = f1(state.emf)+' V';
    $('rI').textContent  = f1(p.i)+' A';
    $('rVs').textContent = f1(p.vs)+' V';
    $('rVp').textContent = f1(p.vp)+' V';
    $('rI1').textContent = state.br1Open ? 'cut' : f1(p.i1)+' A';
    $('rI2').textContent = state.br2Open ? 'cut' : f1(p.i2)+' A';
    $('rRp').textContent = p.rp.toFixed(2)+' Ω';

    $('rSplit').textContent = Math.abs(state.r1-state.r2) < 0.05
      ? 'Equal resistances, so the current splits exactly in half.'
      : (state.r1 < state.r2
          ? 'The top branch has less resistance, so more charge takes it.'
          : 'The bottom branch has less resistance, so more charge takes it.');

    $('barS').style.flexGrow = Math.max(p.vs, 0.01);
    $('barP').style.flexGrow = Math.max(p.vp, 0.01);
    $('barS').textContent = 'series '+f1(p.vs)+' V';
    $('barP').textContent = 'parallel '+f1(p.vp)+' V';
    $('barTxt').textContent = f1(p.vs)+' V + '+f1(p.vp)+' V = '+f1(state.emf)+' V supplied by the battery.';

    $('swSeries').textContent = 'Series link: '+(state.seriesOpen?'cut':'connected');
    $('swSeries').setAttribute('aria-pressed', state.seriesOpen);
    $('swBr1').textContent = 'Top branch: '+(state.br1Open?'cut':'connected');
    $('swBr1').setAttribute('aria-pressed', state.br1Open);
    $('swBr2').textContent = 'Bottom branch: '+(state.br2Open?'cut':'connected');
    $('swBr2').setAttribute('aria-pressed', state.br2Open);
    $('breakNote').textContent = breakNote();

    switchEls.forEach(se => {
      const open = state[se.cfg.key];
      se.eraser.setAttribute('opacity', open ? '1' : '0');
      se.lever.setAttribute('transform', open ? ('rotate(-26 '+(se.cfg.cx-15)+' '+se.cfg.cy+')') : '');
      se.hit.setAttribute('aria-pressed', open);
    });

    if (guideActive) refreshGuideText();
  }

  // ---- switches (break the circuit) --------------------------------
  const NS = 'http://www.w3.org/2000/svg';
  const gSwitches = $('gSwitches');
  const SWITCH_CFG = [
    {key:'seriesOpen', cx:395, cy:100, label:'Series link switch'},
    {key:'br1Open',    cx:592, cy:100, label:'Top branch switch'},
    {key:'br2Open',    cx:592, cy:210, label:'Bottom branch switch'}
  ];
  const switchEls = SWITCH_CFG.map(cfg => {
    const g = document.createElementNS(NS,'g');
    const eraser = document.createElementNS(NS,'rect');
    eraser.setAttribute('x', cfg.cx-16); eraser.setAttribute('y', cfg.cy-4);
    eraser.setAttribute('width','32'); eraser.setAttribute('height','8');
    eraser.setAttribute('fill','var(--paper-2)'); eraser.setAttribute('opacity','0');
    const c1 = document.createElementNS(NS,'circle');
    c1.setAttribute('class','switch-contact');
    c1.setAttribute('cx', cfg.cx-15); c1.setAttribute('cy', cfg.cy); c1.setAttribute('r','3.5');
    const c2 = document.createElementNS(NS,'circle');
    c2.setAttribute('class','switch-contact');
    c2.setAttribute('cx', cfg.cx+15); c2.setAttribute('cy', cfg.cy); c2.setAttribute('r','3.5');
    const lever = document.createElementNS(NS,'line');
    lever.setAttribute('class','switch-lever');
    lever.setAttribute('x1', cfg.cx-15); lever.setAttribute('y1', cfg.cy);
    lever.setAttribute('x2', cfg.cx+15); lever.setAttribute('y2', cfg.cy);
    const hit = document.createElementNS(NS,'circle');
    hit.setAttribute('class','switch-hit');
    hit.setAttribute('cx', cfg.cx); hit.setAttribute('cy', cfg.cy); hit.setAttribute('r','26');
    hit.setAttribute('tabindex','0'); hit.setAttribute('role','button');
    hit.setAttribute('aria-label', cfg.label);
    g.append(eraser, c1, c2, lever, hit);
    gSwitches.appendChild(g);
    const toggle = () => { state[cfg.key] = !state[cfg.key]; compute(); render(); };
    hit.addEventListener('click', toggle);
    hit.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); }
    });
    return {g, eraser, lever, hit, cfg};
  });

  // ---- charge dots -------------------------------------------------
  const layer = $('dots');
  const MAX = 130;
  const pool = [];
  for (let k=0;k<MAX;k++){
    const c = document.createElementNS(NS,'circle');
    c.setAttribute('r','5'); c.setAttribute('opacity','0');
    layer.appendChild(c); pool.push(c);
  }
  const dots = [];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function energyColour(frac){
    // amber when loaded, slate when spent
    const h = 32 + (1-frac)*(205-32);
    const s = 20 + frac*70;
    const l = 62 - frac*14;
    return 'hsl('+h+' '+s+'% '+l+'%)';
  }

  function currentOn(seg){
    if (seg==='main' || seg==='ret') return phys.i;
    if (seg==='br1') return phys.i1;
    return phys.i2;
  }

  function spawn(){
    if (dots.length >= MAX) return;
    dots.push({seg:'main', s:0, e:phys.emf});
  }

  function advance(d, dt){
    const speed = 24 * currentOn(d.seg);      // px per second
    const before = d.s;
    d.s += speed*dt;
    const band = drop[d.seg];
    if (band){
      const a = Math.max(before, band[0]), b = Math.min(d.s, band[1]);
      if (b > a){
        const spend = (d.seg==='main') ? phys.vs : phys.vp;
        d.e -= spend * (b-a)/(band[1]-band[0]);
        if (d.e < 0) d.e = 0;
      }
    }
    if (d.s >= len[d.seg]){
      const over = d.s - len[d.seg];
      if (d.seg === 'main'){
        const goTop = Math.random() < phys.i1/(phys.i1+phys.i2);
        d.seg = goTop ? 'br1' : 'br2';
        d.s = over;
      } else if (d.seg === 'br1' || d.seg === 'br2'){
        d.seg = 'ret'; d.s = over;
      } else {
        return false;              // home — recycled by the battery
      }
    }
    return true;
  }

  let last = performance.now(), acc = 0;
  function frame(now){
    const dt = Math.min((now-last)/1000, 0.05);
    last = now;

    if (!reduced){
      acc += dt * phys.i * 2.4;                 // spawn rate follows total current
      while (acc >= 1){ spawn(); acc -= 1; }
      for (let k=dots.length-1;k>=0;k--){
        if (!advance(dots[k], dt)) dots.splice(k,1);
      }
      const g = Math.max(0, 0.5 - (now%700)/1400);
      $('pump').setAttribute('opacity', (g*0.35).toFixed(3));
    }

    for (let k=0;k<MAX;k++){
      const c = pool[k], d = dots[k];
      if (!d){ c.setAttribute('opacity','0'); continue; }
      const pt = paths[d.seg].getPointAtLength(d.s);
      const frac = phys.emf ? d.e/phys.emf : 0;
      c.setAttribute('cx', pt.x.toFixed(1));
      c.setAttribute('cy', pt.y.toFixed(1));
      c.setAttribute('r', (3.6 + frac*3.2).toFixed(2));
      c.setAttribute('fill', energyColour(frac));
      c.setAttribute('opacity','1');
    }
    requestAnimationFrame(frame);
  }

  if (reduced){
    for (let k=0;k<26;k++) dots.push({seg:'main', s:k*18, e:phys.emf});
  }

  // ---- guided walkthrough -------------------------------------------
  const GUIDE_STEPS = [
    {
      title: 'The battery loads every charge',
      lit: ['#gBattery', '#pMain'],
      text: p => 'Every scoop of charge leaves the battery carrying '+f1(state.emf)+' V worth of energy — like a backpack the battery fills before sending it out on the loop.'
    },
    {
      title: 'Charge splits at the junction',
      lit: ['#gJunction', '#pBr1', '#pBr2'],
      text: p => 'At the junction, the charge has to pick a road. Right now the top branch carries '+f1(p.i1)+' A and the bottom carries '+f1(p.i2)+' A — the smaller resistance gets the bigger share.'
    },
    {
      title: 'Both branches feel the same push',
      lit: ['#gBranch1', '#gBranch2', '#tVp'],
      text: p => 'However the current splits, the p.d. across the top and bottom branches is identical — both read '+f1(p.vp)+' V. Same push, different-sized roads, so different amounts of current get through.'
    },
    {
      title: 'The series resistor spends volts first',
      lit: ['#gSeries'],
      text: p => 'Before charge even reaches the junction, the series resistor takes '+f1(p.vs)+' V of energy from it — that’s why the parallel section only ever sees what’s left over.'
    },
    {
      title: 'It all adds back up',
      lit: ['#gMeter', '.budget'],
      text: p => f1(p.vs)+' V spent on the series resistor + '+f1(p.vp)+' V spent in the parallel section = '+f1(state.emf)+' V — exactly what the battery supplied. The voltmeter, wired straight across the battery, always reads the full '+f1(state.emf)+' V.'
    }
  ];

  let guideActive = false, guideStep = 0;
  const guidePanel = $('guidePanel');

  function clearGuideMarks(){
    svgEl.querySelectorAll('.lit').forEach(el => el.classList.remove('lit'));
    document.querySelectorAll('.lit-external').forEach(el => el.classList.remove('lit-external'));
  }

  function applyGuideStep(){
    clearGuideMarks();
    const step = GUIDE_STEPS[guideStep];
    step.lit.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (svgEl.contains(el)) el.classList.add('lit');
        else el.classList.add('lit-external');
      });
    });
  }

  function refreshGuideText(){
    const step = GUIDE_STEPS[guideStep];
    $('guideStepNum').textContent = 'Step '+(guideStep+1)+' of '+GUIDE_STEPS.length;
    $('guideTitle').textContent = step.title;
    $('guideBody').textContent = step.text(phys);
    $('guidePrev').disabled = guideStep === 0;
    $('guideNext').textContent = guideStep === GUIDE_STEPS.length-1 ? 'Done' : 'Next →';
  }

  function updateGuideDOM(){
    if (!guideActive){
      svgEl.classList.remove('guide-dim');
      clearGuideMarks();
      guidePanel.hidden = true;
      $('bGuide').setAttribute('aria-pressed','false');
      return;
    }
    svgEl.classList.add('guide-dim');
    guidePanel.hidden = false;
    $('bGuide').setAttribute('aria-pressed','true');
    applyGuideStep();
    refreshGuideText();
    history.replaceState(null, '', '#step-'+(guideStep+1));
  }

  function openGuide(step){
    guideActive = true;
    guideStep = Math.min(Math.max(step, 0), GUIDE_STEPS.length-1);
    updateGuideDOM();
    guidePanel.scrollIntoView({block:'nearest', behavior:'smooth'});
  }
  function closeGuide(){
    guideActive = false;
    updateGuideDOM();
    history.replaceState(null, '', location.pathname + location.search);
  }
  function nextStep(){
    if (guideStep >= GUIDE_STEPS.length-1){ closeGuide(); return; }
    guideStep++; updateGuideDOM();
  }
  function prevStep(){
    if (guideStep > 0){ guideStep--; updateGuideDOM(); }
  }

  $('bGuide').addEventListener('click', () => guideActive ? closeGuide() : openGuide(0));
  $('guideClose').addEventListener('click', closeGuide);
  $('guideNext').addEventListener('click', nextStep);
  $('guidePrev').addEventListener('click', prevStep);

  document.addEventListener('keydown', e => {
    if (!guideActive) return;
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT') return;
    if (e.key === 'ArrowRight'){ e.preventDefault(); nextStep(); }
    else if (e.key === 'ArrowLeft'){ e.preventDefault(); prevStep(); }
    else if (e.key === 'Escape'){ e.preventDefault(); closeGuide(); }
  });

  // ---- wiring ------------------------------------------------------
  const bind = (slider, key) => $(slider).addEventListener('input', e => {
    state[key] = parseFloat(e.target.value); compute(); render();
  });
  bind('sEmf','emf'); bind('sRs','rs'); bind('sR1','r1'); bind('sR2','r2');

  function setAll(v){
    state.emf=v.emf; state.rs=v.rs; state.r1=v.r1; state.r2=v.r2;
    if ('seriesOpen' in v) state.seriesOpen = v.seriesOpen;
    if ('br1Open' in v) state.br1Open = v.br1Open;
    if ('br2Open' in v) state.br2Open = v.br2Open;
    $('sEmf').value=v.emf; $('sRs').value=v.rs; $('sR1').value=v.r1; $('sR2').value=v.r2;
    compute(); render();
  }
  $('bReset').addEventListener('click', () => setAll({emf:12, rs:1, r1:1, r2:2.5, seriesOpen:false, br1Open:false, br2Open:false}));
  $('bMatch').addEventListener('click', () => setAll({emf:state.emf, rs:state.rs, r1:2, r2:2, seriesOpen:state.seriesOpen, br1Open:false, br2Open:false}));

  $('swSeries').addEventListener('click', () => { state.seriesOpen = !state.seriesOpen; compute(); render(); });
  $('swBr1').addEventListener('click', () => { state.br1Open = !state.br1Open; compute(); render(); });
  $('swBr2').addEventListener('click', () => { state.br2Open = !state.br2Open; compute(); render(); });

  compute(); render();
  requestAnimationFrame(frame);

  const m = location.hash.match(/^#step-(\d)$/);
  if (m){
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= GUIDE_STEPS.length) openGuide(n-1);
  }
})();
