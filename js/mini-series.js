(function(){
  const $ = id => document.getElementById(id);
  const root = $('mrWidget');
  if (!root) return;
  const NS = 'http://www.w3.org/2000/svg';
  const path = $('mrLoop');
  const len = path.getTotalLength();
  const bands = [
    {range:[120,200], key:'v1'},
    {range:[250,330], key:'v2'}
  ];

  const state = {emf:10, r1:2, r2:3};
  let phys = {};
  function compute(){
    const i = state.emf / (state.r1 + state.r2);
    phys = {emf: state.emf, i, v1: i*state.r1, v2: i*state.r2};
  }
  const f1 = n => n.toFixed(1);

  function render(){
    $('mrEmfVal').textContent = f1(state.emf)+' V';
    $('mrR1Val').textContent = f1(state.r1)+' Ω';
    $('mrR2Val').textContent = f1(state.r2)+' Ω';
    $('mrEmfTag').textContent = f1(state.emf)+' V';
    $('mrR1Tag').textContent = f1(state.r1)+' Ω';
    $('mrR2Tag').textContent = f1(state.r2)+' Ω';
    $('mrV1Tag').textContent = f1(phys.v1)+' V';
    $('mrV2Tag').textContent = f1(phys.v2)+' V';
    $('mrITag').textContent = f1(phys.i)+' A';
    $('mrIRead').textContent = f1(phys.i)+' A';

    $('mrBar1').style.flexGrow = Math.max(phys.v1, 0.01);
    $('mrBar2').style.flexGrow = Math.max(phys.v2, 0.01);
    $('mrBar1').textContent = 'R1 '+f1(phys.v1)+' V';
    $('mrBar2').textContent = 'R2 '+f1(phys.v2)+' V';
    $('mrBarTxt').textContent = f1(phys.v1)+' V + '+f1(phys.v2)+' V = '+f1(state.emf)+' V';
  }

  $('mrEmf').addEventListener('input', e => { state.emf = parseFloat(e.target.value); compute(); render(); });
  $('mrR1').addEventListener('input', e => { state.r1 = parseFloat(e.target.value); compute(); render(); });
  $('mrR2').addEventListener('input', e => { state.r2 = parseFloat(e.target.value); compute(); render(); });

  // ---- charge dots ---------------------------------------------------
  const layer = $('mrDots');
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
    bands.forEach(b => {
      const a = Math.max(before, b.range[0]), bb = Math.min(d.s, b.range[1]);
      if (bb > a){
        d.e -= phys[b.key] * (bb-a)/(b.range[1]-b.range[0]);
        if (d.e < 0) d.e = 0;
      }
    });
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
