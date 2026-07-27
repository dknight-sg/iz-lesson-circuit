(function(){
  const $ = id => document.getElementById(id);
  const root = $('mpWidget');
  if (!root) return;
  const NS = 'http://www.w3.org/2000/svg';
  const paths = {
    main: $('mpMain'),
    br1:  $('mpBr1'),
    br2:  $('mpBr2'),
    ret:  $('mpReturn')
  };
  const len = {};
  for (const k in paths) len[k] = paths[k].getTotalLength();
  const drop = { main:null, br1:[50,140], br2:[250,340], ret:null };

  const state = {emf:6, r1:1, r2:2.5};
  let phys = {};
  function compute(){
    const {emf, r1, r2} = state;
    const rp = (r1*r2)/(r1+r2);
    const i1 = emf/r1, i2 = emf/r2;
    phys = {emf, rp, i1, i2, i: i1+i2};
  }
  const f1 = n => n.toFixed(1);

  function render(){
    $('mpEmfVal').textContent = f1(state.emf)+' V';
    $('mpR1Val').textContent = f1(state.r1)+' Ω';
    $('mpR2Val').textContent = f1(state.r2)+' Ω';
    $('mpEmfTag').textContent = f1(state.emf)+' V';
    $('mpR1Tag').textContent = f1(state.r1)+' Ω';
    $('mpR2Tag').textContent = f1(state.r2)+' Ω';
    $('mpI1Tag').textContent = f1(phys.i1)+' A';
    $('mpI2Tag').textContent = f1(phys.i2)+' A';
    $('mpVTag').textContent = f1(state.emf)+' V';
    $('mpITag').textContent = f1(phys.i)+' A';
    $('mpIRead').textContent = f1(phys.i)+' A';
  }

  $('mpEmf').addEventListener('input', e => { state.emf = parseFloat(e.target.value); compute(); render(); });
  $('mpR1').addEventListener('input', e => { state.r1 = parseFloat(e.target.value); compute(); render(); });
  $('mpR2').addEventListener('input', e => { state.r2 = parseFloat(e.target.value); compute(); render(); });

  // ---- charge dots ---------------------------------------------------
  const layer = $('mpDots');
  const MAX = 60;
  const pool = [];
  for (let k=0;k<MAX;k++){
    const c = document.createElementNS(NS,'circle');
    c.setAttribute('r','4.6'); c.setAttribute('opacity','0');
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
    const speed = 20 * currentOn(d.seg);
    const before = d.s;
    d.s += speed*dt;
    const band = drop[d.seg];
    if (band){
      const a = Math.max(before, band[0]), b = Math.min(d.s, band[1]);
      if (b > a){
        d.e -= state.emf * (b-a)/(band[1]-band[0]);
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
      acc += dt * phys.i * 2.2;
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
      c.setAttribute('r', (3.2 + frac*2.8).toFixed(2));
      c.setAttribute('fill', energyColour(frac));
      c.setAttribute('opacity','1');
    }
    requestAnimationFrame(frame);
  }

  compute(); render();
  requestAnimationFrame(frame);
})();
