(function(){
  const $ = id => document.getElementById(id);
  const root = $('msWidget');
  if (!root) return;
  const NS = 'http://www.w3.org/2000/svg';
  const path = $('msLoop');
  const len = path.getTotalLength();
  const drop = [150, 240]; // distance-along-path band covered by the resistor

  const state = {emf:6, r:3};
  let phys = {};
  function compute(){
    const i = state.emf / state.r;
    phys = {emf: state.emf, r: state.r, i, v: i*state.r};
  }
  const f1 = n => n.toFixed(1);

  function render(){
    $('msEmfVal').textContent = f1(state.emf)+' V';
    $('msRVal').textContent = f1(state.r)+' Ω';
    $('msEmfTag').textContent = f1(state.emf)+' V';
    $('msRTag').textContent = f1(state.r)+' Ω';
    $('msITag').textContent = f1(phys.i)+' A';
    $('msVTag').textContent = f1(phys.v)+' V';
    $('msIRead').textContent = f1(phys.i)+' A';
    $('msVRead').textContent = f1(phys.v)+' V';
  }

  $('msEmf').addEventListener('input', e => { state.emf = parseFloat(e.target.value); compute(); render(); });
  $('msR').addEventListener('input', e => { state.r = parseFloat(e.target.value); compute(); render(); });

  // ---- charge dots ---------------------------------------------------
  const layer = $('msDots');
  const MAX = 36;
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

  function spawn(){
    if (dots.length >= MAX) return;
    dots.push({s:0, e:phys.emf});
  }
  function advance(d, dt){
    const speed = 20 * phys.i;
    const before = d.s;
    d.s += speed*dt;
    const a = Math.max(before, drop[0]), b = Math.min(d.s, drop[1]);
    if (b > a){
      d.e -= phys.v * (b-a)/(drop[1]-drop[0]);
      if (d.e < 0) d.e = 0;
    }
    if (d.s >= len) return false;
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
      const pt = path.getPointAtLength(d.s);
      const frac = phys.emf ? d.e/phys.emf : 0;
      c.setAttribute('cx', pt.x.toFixed(1));
      c.setAttribute('cy', pt.y.toFixed(1));
      c.setAttribute('r', (3.2 + frac*2.8).toFixed(2));
      c.setAttribute('fill', energyColour(frac));
      c.setAttribute('opacity','1');
    }
    requestAnimationFrame(frame);
  }
  if (reduced){
    for (let k=0;k<10;k++) dots.push({s:k*(len/10), e:0});
  }

  compute(); render();
  requestAnimationFrame(frame);
})();
