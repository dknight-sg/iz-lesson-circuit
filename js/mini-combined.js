(function(){
  const $ = id => document.getElementById(id);
  const root = $('mcWidget');
  if (!root) return;
  const NS = 'http://www.w3.org/2000/svg';
  const paths = {
    main: $('mcMain'),
    br1:  $('mcBr1'),
    br2:  $('mcBr2'),
    ret:  $('mcReturn')
  };
  const len = {};
  for (const k in paths) len[k] = paths[k].getTotalLength();
  const drop = { main:[300,400], br1:[50,140], br2:[150,240], ret:null };

  const state = {emf:12, rs:1, r1:1, r2:2.5};
  let phys = {};
  function compute(){
    const {emf, rs, r1, r2} = state;
    const rp = (r1*r2)/(r1+r2);
    const i = emf/(rs+rp);
    const vs = i*rs, vp = i*rp;
    phys = {emf, rp, i, vs, vp, i1: vp/r1, i2: vp/r2};
  }
  const f1 = n => n.toFixed(1);

  function render(){
    const p = phys;
    $('mcEmfVal').textContent = f1(state.emf)+' V';
    $('mcRsVal').textContent = f1(state.rs)+' Ω';
    $('mcR1Val').textContent = f1(state.r1)+' Ω';
    $('mcR2Val').textContent = f1(state.r2)+' Ω';

    $('mcEmfTag').textContent = f1(state.emf)+' V';
    $('mcVoltTag').textContent = 'reads '+f1(state.emf)+' V';
    $('mcRsTag').textContent = f1(state.rs)+' Ω';
    $('mcVsTag').textContent = 'drops '+f1(p.vs)+' V';
    $('mcR1Tag').textContent = f1(state.r1)+' Ω';
    $('mcR2Tag').textContent = f1(state.r2)+' Ω';
    $('mcI1Tag').textContent = f1(p.i1)+' A';
    $('mcI2Tag').textContent = f1(p.i2)+' A';
    $('mcVpTag').textContent = 'both drop '+f1(p.vp)+' V';
    $('mcItotTag').textContent = f1(p.i)+' A in';

    $('mcRpRead').textContent = p.rp.toFixed(2)+' Ω';
    $('mcIRead').textContent = f1(p.i)+' A';

    $('mcBar1').style.flexGrow = Math.max(p.vs, 0.01);
    $('mcBar2').style.flexGrow = Math.max(p.vp, 0.01);
    $('mcBar1').textContent = 'series '+f1(p.vs)+' V';
    $('mcBar2').textContent = 'parallel '+f1(p.vp)+' V';
    $('mcBarTxt').textContent = f1(p.vs)+' V + '+f1(p.vp)+' V = '+f1(state.emf)+' V';
  }

  $('mcEmf').addEventListener('input', e => { state.emf = parseFloat(e.target.value); compute(); render(); });
  $('mcRs').addEventListener('input', e => { state.rs = parseFloat(e.target.value); compute(); render(); });
  $('mcR1').addEventListener('input', e => { state.r1 = parseFloat(e.target.value); compute(); render(); });
  $('mcR2').addEventListener('input', e => { state.r2 = parseFloat(e.target.value); compute(); render(); });

  // ---- charge dots ---------------------------------------------------
  const layer = $('mcDots');
  const MAX = 90;
  const pool = [];
  for (let k=0;k<MAX;k++){
    const c = document.createElementNS(NS,'circle');
    c.setAttribute('r','5'); c.setAttribute('opacity','0');
    layer.appendChild(c); pool.push(c);
  }
  const dots = [];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function energyColour(frac){
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
    const speed = 24 * currentOn(d.seg);
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
        return false;
      }
    }
    return true;
  }

  let last = performance.now(), acc = 0;
  function frame(now){
    const dt = Math.min((now-last)/1000, 0.05);
    last = now;
    if (!reduced){
      acc += dt * phys.i * 2.4;
      while (acc >= 1){ spawn(); acc -= 1; }
      for (let k=dots.length-1;k>=0;k--){ if (!advance(dots[k], dt)) dots.splice(k,1); }
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

  compute(); render();
  requestAnimationFrame(frame);
})();
