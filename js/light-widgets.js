/* Chapter 5 · Ray Model of Light — interactive widgets.
   Each IIFE guards on its root id so this file is safe on any lesson page. */
(function(){
'use strict';
const D=Math.PI/180;
function el(t,c,h){const n=document.createElement(t); if(c)n.className=c; if(h!=null)n.innerHTML=h; return n;}
function set(n,a){for(const k in a)n.setAttribute(k,a[k]);}

/* ==============================================================
   straightLab — the three-card experiment (Figures 5.3 / 5.4)
   ============================================================== */
(function straightLab(){
  const root=document.getElementById('straightLab'); if(!root) return;
  const slider=root.querySelector('.st-shift'), card=root.querySelector('.st-card2'), hole=root.querySelector('.st-hole2');
  const ray=root.querySelector('.st-ray'), blocked=root.querySelector('.st-blocked'), flame=root.querySelector('.st-flame');
  const eye=root.querySelector('.st-eye'), out=root.querySelector('.st-out'), shiftv=root.querySelector('.st-shiftv');
  const Y=104;                     /* the aligned ray height */
  function render(){
    const s=+slider.value;         /* vertical shift of the middle card, in px */
    card.setAttribute('transform','translate(0 '+s+')');
    const aligned=Math.abs(s)<=6;
    ray.style.opacity=aligned?1:0;
    blocked.style.opacity=aligned?0:1;
    flame.style.opacity=1;
    eye.setAttribute('fill',aligned?'#F0871E':'#C9D3DC');
    shiftv.textContent=(s===0?'aligned':(s>0?'+':'')+s+' px');
    out.innerHTML=aligned
      ? 'The holes are in a <strong>straight line</strong>, so light travels from the flame through all three holes into the eye. <strong>The flame is visible.</strong>'
      : 'The middle card is out of position, so its card body <strong>blocks</strong> the light. <strong>The flame cannot be seen</strong> — which is exactly what shows that light travels in straight lines. It cannot bend around the card to reach the eye.';
  }
  slider.addEventListener('input',render);
  root.querySelector('.st-reset').addEventListener('click',()=>{slider.value=0;render();});
  render();
})();

/* ==============================================================
   seeingLab — luminous, non-luminous, and the totally dark room
   ============================================================== */
(function seeingLab(){
  const root=document.getElementById('seeingLab'); if(!root) return;
  const btn=root.querySelector('.se-toggle');
  const rays=root.querySelectorAll('.se-ray'), glow=root.querySelector('.se-glow');
  const wball=root.querySelector('.se-white'), bball=root.querySelector('.se-black');
  const flameG=root.querySelector('.se-flameg'), dark=root.querySelector('.se-dark');
  const rW=root.querySelector('.se-rw'), rB=root.querySelector('.se-rb'), rC=root.querySelector('.se-rc'), note=root.querySelector('.se-note');
  let on=true;
  function render(){
    btn.textContent=on?'Blow the candle out':'Light the candle';
    dark.style.opacity=on?0:0.9;
    glow.style.opacity=on?1:0;
    flameG.style.opacity=on?1:0;
    rays.forEach(r=>r.style.opacity=on?1:0);
    wball.setAttribute('fill',on?'#F7FAFC':'#2A3540');
    bball.setAttribute('fill',on?'#3E4954':'#2A3540');
    rC.textContent = on ? 'Visible — it is luminous, so its own light enters your eyes.' : 'Not visible — it is no longer emitting light.';
    rW.textContent = on ? 'Visible — it reflects the candle light into your eyes.' : 'Not visible.';
    rB.textContent = on ? 'Visible — it reflects much less light, but still enough to be seen.' : 'Not visible.';
    note.innerHTML = on
      ? 'The candle is <strong>luminous</strong> — it emits its own light. The two balls are <strong>non-luminous</strong>; you see them only because light from the candle <strong>bounces off them</strong> into your eyes.'
      : 'In total darkness you can see <strong>neither ball</strong> — not even the white one. A non-luminous object has no light of its own to give, and there is now nothing for it to reflect. Colour makes no difference when there is no light source at all.';
  }
  btn.addEventListener('click',()=>{on=!on;render();});
  render();
})();

/* ==============================================================
   mirrorLab — characteristics of a plane-mirror image
   ============================================================== */
(function mirrorLab(){
  const root=document.getElementById('mirrorLab'); if(!root) return;
  const dist=root.querySelector('.mi-dist'), hand=root.querySelector('.mi-hand');
  const obj=root.querySelector('.mi-obj'), img=root.querySelector('.mi-img');
  const oArmR=root.querySelector('.mi-oarm-r'), oArmL=root.querySelector('.mi-oarm-l');
  const iArmR=root.querySelector('.mi-iarm-r'), iArmL=root.querySelector('.mi-iarm-l');
  const dO=root.querySelector('.mi-do'), dI=root.querySelector('.mi-di');
  const lblO=root.querySelector('.mi-lo'), lblI=root.querySelector('.mi-li'), note=root.querySelector('.mi-note');
  const MX=230;                    /* mirror x */
  let raised=false;
  function render(){
    const d=+dist.value;                   /* metres */
    const px=d*70;                         /* 70 px per metre */
    obj.setAttribute('transform','translate('+(MX-px)+' 0)');
    img.setAttribute('transform','translate('+(MX+px)+' 0) scale(-1 1)');
    dO.textContent=d.toFixed(1)+' m'; dI.textContent=d.toFixed(1)+' m';
    lblO.setAttribute('x',MX-px); lblI.setAttribute('x',MX+px);
    /* raising the RIGHT arm of the object shows as the LEFT arm of the image */
    oArmR.style.opacity=raised?1:0; oArmL.style.opacity=raised?0:1;
    iArmR.style.opacity=raised?1:0; iArmL.style.opacity=raised?0:1;
    hand.textContent=raised?'Lower the right hand':'Raise the right hand';
    note.innerHTML=raised
      ? 'You raised your <strong>right</strong> hand — but the image raises the hand on the <em>opposite</em> side. A mirror reverses left and right: the image is <strong>laterally inverted</strong>.'
      : 'The image is the <strong>same size</strong> as you, <strong>upright</strong>, and exactly <strong>as far behind the mirror as you are in front</strong>. It is <strong>virtual</strong> — it appears to be inside the mirror and cannot be caught on a screen.';
  }
  dist.addEventListener('input',render);
  hand.addEventListener('click',()=>{raised=!raised;render();});
  render();
})();

/* ==============================================================
   reflectLab — the law of reflection, i = r
   ============================================================== */
(function reflectLab(){
  const root=document.getElementById('reflectLab'); if(!root) return;
  const sl=root.querySelector('.rf-ang');
  const inc=root.querySelector('.rf-inc'), ref=root.querySelector('.rf-ref');
  const arcI=root.querySelector('.rf-arci'), arcR=root.querySelector('.rf-arcr');
  const vi=root.querySelector('.rf-vi'), vr=root.querySelector('.rf-vr'), note=root.querySelector('.rf-note');
  const PX=230, PY=170, L=140;     /* point of incidence, ray length */
  function render(){
    const a=+sl.value;
    const dx=L*Math.sin(a*D), dy=L*Math.cos(a*D);
    set(inc,{x1:PX-dx,y1:PY-dy,x2:PX,y2:PY});
    set(ref,{x1:PX,y1:PY,x2:PX+dx,y2:PY-dy});
    const R=44;
    arcI.setAttribute('d','M '+PX+' '+(PY-R)+' A '+R+' '+R+' 0 0 0 '+(PX-R*Math.sin(a*D))+' '+(PY-R*Math.cos(a*D)));
    arcR.setAttribute('d','M '+PX+' '+(PY-R)+' A '+R+' '+R+' 0 0 1 '+(PX+R*Math.sin(a*D))+' '+(PY-R*Math.cos(a*D)));
    vi.textContent=a+'°'; vr.textContent=a+'°';
    note.innerHTML='Both angles are measured from the <strong>normal</strong> — the dashed line drawn perpendicular to the surface at the point of incidence — <em>never</em> from the surface itself. Whatever you set, <strong>r = i</strong>.';
  }
  sl.addEventListener('input',render); render();
})();

/* ==============================================================
   surfaceLab — smooth vs rough, with i = r true in both
   ============================================================== */
(function surfaceLab(){
  const root=document.getElementById('surfaceLab'); if(!root) return;
  const pick=root.querySelectorAll('.su-pick button');
  const svg=root.querySelector('.su-stage'), note=root.querySelector('.su-note'), verdict=root.querySelector('.su-verdict');
  const SVGNS='http://www.w3.org/2000/svg';
  let mode='smooth';
  /* facet tilts in degrees, left to right */
  const ROUGH=[-14,9,-6,15,-10];
  function render(){
    pick.forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===mode?'true':'false'));
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    const W=420,H=210,BASE=160,N=5,GAP=72,X0=40;
    const inAng=32;                     /* incoming rays all parallel at this angle */
    /* surface */
    let d='M 10 '+BASE;
    for(let k=0;k<N;k++){
      const cx=X0+k*GAP, t=mode==='smooth'?0:ROUGH[k];
      const half=GAP/2, dy=Math.tan(t*D)*half;
      d+=' L '+(cx-half)+' '+(BASE+dy)+' L '+(cx+half)+' '+(BASE-dy);
    }
    d+=' L 415 '+BASE;
    const surf=document.createElementNS(SVGNS,'path');
    set(surf,{d:d,fill:'none',stroke:'#0F2436','stroke-width':2.6,'stroke-linejoin':'round'});
    svg.appendChild(surf);
    const hatch=document.createElementNS(SVGNS,'rect');
    set(hatch,{x:10,y:BASE+2,width:405,height:14,fill:'rgba(15,36,54,.08)'});
    svg.appendChild(hatch);

    const COL=['#D93F2B','#2E7A8C','#4E9E6A','#7A5FBF','#C98A1E'];
    for(let k=0;k<N;k++){
      const cx=X0+k*GAP, t=mode==='smooth'?0:ROUGH[k];
      const py=BASE;                                   /* hit point on the facet centre */
      /* normal direction for this facet */
      const nAng=t;                                    /* normal tilted by the facet tilt */
      /* incoming ray direction is fixed; angle to the normal: */
      const i=inAng-nAng;
      const L=118;
      /* incident ray comes from upper-left along fixed direction inAng from vertical */
      const ix=cx-L*Math.sin(inAng*D), iy=py-L*Math.cos(inAng*D);
      const inc=document.createElementNS(SVGNS,'line');
      set(inc,{x1:ix,y1:iy,x2:cx,y2:py,stroke:COL[k],'stroke-width':2.4,'marker-end':'url(#lgArrow)'});
      svg.appendChild(inc);
      /* Reflect the incoming direction about the facet normal.
         Bearings are measured from vertical, positive clockwise.
         The reverse-incident direction has bearing -inAng, so mirroring it
         about the normal gives outgoing bearing 2*nAng + inAng. */
      const outAng=2*nAng+inAng;
      const rf=document.createElementNS(SVGNS,'line');
      set(rf,{x1:cx,y1:py,x2:cx+L*Math.sin(outAng*D),y2:py-L*Math.cos(outAng*D),
              stroke:COL[k],'stroke-width':2.4,'marker-end':'url(#lgArrow)'});
      svg.appendChild(rf);
      /* normal */
      const nm=document.createElementNS(SVGNS,'line');
      set(nm,{x1:cx,y1:py,x2:cx+58*Math.sin(nAng*D),y2:py-58*Math.cos(nAng*D),
              stroke:'#0F2436','stroke-width':1.4,'stroke-dasharray':'4 3'});
      svg.appendChild(nm);
    }
    /* arrow marker */
    const defs=document.createElementNS(SVGNS,'defs');
    defs.innerHTML='<marker id="lgArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/></marker>';
    svg.insertBefore(defs,svg.firstChild);

    note.innerHTML = mode==='smooth'
      ? 'Every part of the surface faces the same way, so every <strong>normal</strong> points the same way. Parallel rays in → <strong>parallel rays out, all in the same direction</strong>.'
      : 'The surface is uneven, so each facet\'s <strong>normal</strong> points a different way. Parallel rays in → <strong>reflected rays scatter in different directions</strong>.';
    verdict.innerHTML = mode==='smooth'
      ? '<strong>A clear image forms.</strong> Mirrors, polished metal and a calm water surface all work this way.'
      : '<strong>No image forms — the light is scattered.</strong> Paper looks smooth, but under a microscope it is uneven, which is why you cannot see your reflection in it.'
        +'<br><span style="color:var(--charge)">Notice the dashed normals: at every single facet the angle of reflection still equals the angle of incidence. The law is never broken — the surface just keeps changing direction.</span>';
  }
  pick.forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.m;render();}));
  render();
})();

/* ==============================================================
   curvedLab — convex and concave mirrors
   ============================================================== */
(function curvedLab(){
  const root=document.getElementById('curvedLab'); if(!root) return;
  const pick=root.querySelectorAll('.cv-pick button');
  const arc=root.querySelector('.cv-arc'), rays=root.querySelector('.cv-rays');
  const shape=root.querySelector('.cv-shape'), other=root.querySelector('.cv-other');
  const uses=root.querySelector('.cv-uses'), note=root.querySelector('.cv-note');
  const SVGNS='http://www.w3.org/2000/svg';
  const INFO={
    concave:{shape:'curves <strong>inwards</strong>', other:'converging mirror',
      uses:['A dentist\'s mirror — forms a <strong>magnified</strong> image of the teeth','A shaving or make-up mirror — magnifies the face','Car <strong>headlights</strong> — reflect bulb light into a strong forward beam','A <strong>microscope</strong> mirror — reflects lamp light onto the specimen to brighten it'],
      note:'Parallel rays are brought <strong>together</strong>. That is why it is called a converging mirror, and why it can magnify.'},
    convex:{shape:'curves <strong>outwards</strong>', other:'diverging mirror',
      uses:['<strong>Road junctions</strong> — drivers see around blind corners','<strong>Shop corners</strong> — a shopkeeper sees a large area from one spot','<strong>Rear-view and side mirrors</strong> — a large area of traffic behind'],
      note:'Parallel rays are spread <strong>apart</strong>. That is why it is called a diverging mirror, and why it gives a <strong>wider range of vision</strong>.'}
  };
  let mode='concave';
  function render(){
    pick.forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===mode?'true':'false'));
    const CY=110, R=170, APEX=250;
    /* concave: hollow side faces the incoming rays. convex: bulges towards them. */
    arc.setAttribute('d', mode==='concave'
      ? 'M '+APEX+' 26 A '+R+' '+R+' 0 0 0 '+APEX+' 194'
      : 'M 200 26 A '+R+' '+R+' 0 0 1 200 194');
    while(rays.firstChild) rays.removeChild(rays.firstChild);
    [46,78,110,142,174].forEach(y=>{
      const dy=y-CY;
      const sag=R-Math.sqrt(Math.max(0,R*R-dy*dy));
      const hitX = mode==='concave' ? APEX-sag : 200+sag;
      const inc=document.createElementNS(SVGNS,'line');
      set(inc,{x1:44,y1:y,x2:hitX,y2:y,stroke:'#D93F2B','stroke-width':2.2});
      rays.appendChild(inc);
      const rf=document.createElementNS(SVGNS,'line');
      set(rf,{x1:hitX,y1:y,x2:hitX-135,
              y2:(mode==='concave' ? CY+dy*0.10 : y+dy*1.05),
              stroke:'#2E7A8C','stroke-width':2.2});
      rays.appendChild(rf);
    });
    const o=INFO[mode];
    shape.innerHTML=o.shape; other.textContent=o.other;
    uses.innerHTML=o.uses.map(u=>'<li>'+u+'</li>').join('');
    note.innerHTML=o.note;
  }
  pick.forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.m;render();}));
  render();
})();

/* ==============================================================
   refractLab — bending towards or away from the normal
   ============================================================== */
(function refractLab(){
  const root=document.getElementById('refractLab'); if(!root) return;
  const sl=root.querySelector('.re-ang'), pick=root.querySelectorAll('.re-pick button');
  const inc=root.querySelector('.re-inc'), out=root.querySelector('.re-out');
  const topLbl=root.querySelector('.re-top'), botLbl=root.querySelector('.re-bot'), band=root.querySelector('.re-band');
  const vi=root.querySelector('.re-vi'), vr=root.querySelector('.re-vr'), speed=root.querySelector('.re-speed'), note=root.querySelector('.re-note');
  const PX=210, PY=120, L=110, N=1.5;
  let dir='in';                       /* in = air→glass, out = glass→air */
  function render(){
    const maxA = dir==='in' ? 80 : 40;
    if(+sl.value>maxA) sl.value=maxA;
    sl.max=maxA;
    const i=+sl.value;
    const sr = dir==='in' ? Math.sin(i*D)/N : Math.sin(i*D)*N;
    const r = Math.asin(Math.min(1,sr))/D;
    pick.forEach(b=>b.setAttribute('aria-pressed',b.dataset.d===dir?'true':'false'));
    /* top medium is air when going in, glass when coming out */
    topLbl.textContent = dir==='in' ? 'air' : 'glass';
    botLbl.textContent = dir==='in' ? 'glass' : 'air';
    band.setAttribute('fill', dir==='in' ? 'rgba(159,208,232,.35)' : 'rgba(159,208,232,.12)');
    set(inc,{x1:PX-L*Math.sin(i*D),y1:PY-L*Math.cos(i*D),x2:PX,y2:PY});
    set(out,{x1:PX,y1:PY,x2:PX+L*Math.sin(r*D),y2:PY+L*Math.cos(r*D)});
    vi.textContent=i+'°'; vr.textContent=r.toFixed(1)+'°';
    speed.textContent = dir==='in' ? 'slows down' : 'speeds up';
    note.innerHTML = dir==='in'
      ? 'Air is <strong>optically less dense</strong> than glass. Entering the glass the light <strong>slows down</strong>, so it bends <strong>towards the normal</strong> — the angle shrinks from '+i+'° to '+r.toFixed(1)+'°.'
      : 'Glass is <strong>optically denser</strong> than air. Leaving the glass the light <strong>speeds up</strong>, so it bends <strong>away from the normal</strong> — the angle grows from '+i+'° to '+r.toFixed(1)+'°.';
  }
  sl.addEventListener('input',render);
  pick.forEach(b=>b.addEventListener('click',()=>{dir=b.dataset.d;render();}));
  render();
})();

/* ==============================================================
   dispersionLab — splitting white light with a prism
   ============================================================== */
(function dispersionLab(){
  const root=document.getElementById('dispersionLab'); if(!root) return;
  const go=root.querySelector('.dp-go'), reset=root.querySelector('.dp-reset');
  const bands=[...root.querySelectorAll('.dp-band')], white=root.querySelector('.dp-white');
  const stage=root.querySelector('.dp-stage'), order=root.querySelector('.dp-order');
  let t=null;
  function setP(p){
    white.style.opacity=1;
    bands.forEach((b,k)=>{
      b.style.opacity=p>0.25?1:0;
      const spread=parseFloat(b.dataset.spread);
      b.setAttribute('transform','translate(0 '+(spread*p*1).toFixed(2)+')');
    });
    stage.innerHTML = p<=0 ? 'White light is about to enter the prism.'
      : p<0.25 ? 'The white light enters the glass and slows down…'
      : p<1 ? 'Each colour slows by a <strong>different</strong> amount, so each bends by a different angle.'
      : 'The white light has been split into its seven component colours. This is <strong>dispersion</strong>.';
    order.innerHTML = p>=1
      ? '<strong>Violet bends the most; red bends the least.</strong> That is why violet ends up at the bottom of the spectrum and red at the top. The seven colours in order are <strong>R O Y G B I V</strong> — red, orange, yellow, green, blue, indigo, violet.'
      : '';
  }
  go.addEventListener('click',()=>{
    if(t) clearInterval(t); const st=performance.now();
    t=setInterval(()=>{const p=Math.min(1,(performance.now()-st)/2400); setP(p); if(p>=1){clearInterval(t);t=null;}},40);
  });
  reset.addEventListener('click',()=>{if(t)clearInterval(t);t=null;setP(0);});
  setP(0);
})();

/* ==============================================================
   emLab — infrared, ultraviolet and visible light
   ============================================================== */
(function emLab(){
  const root=document.getElementById('emLab'); if(!root) return;
  const INFO={
    infrared:{t:'Infrared radiation', vis:'Invisible to us — but snakes can see it.',
      app:['<strong>Thermal imaging cameras</strong> in airports, public buildings and offices detect the infrared a person emits, forming an image of their body temperature. Used during <strong>COVID-19</strong> to screen for fever.','<strong>Robotic vacuum cleaners</strong> use infrared sensors to avoid falling down stairs — signals reflected by the floor are lost suddenly at a step, so the cleaner moves away.','<strong>Vehicles</strong> use infrared sensors to detect a drowsy driver and adjust lighting and temperature, or activate self-driving to stop safely.'],
      harm:['Overexposure harms us. In industry it is released in <strong>welding, cutting and brazing</strong>, and in furnaces and molten metal production — workers must wear <strong>goggles</strong> to protect their eyes.','Infrared trapped in the atmosphere contributes to <strong>climate change</strong>, raising temperatures and changing weather patterns in ways that harm living things.']},
    uv:{t:'Ultraviolet (UV) radiation', vis:'Invisible to us — but bees can see it, which is how they find nectar.',
      app:['A small amount is <strong>good for health</strong> — it increases the production of <strong>vitamin D</strong> in our bodies.','Used in <strong>medical treatment for skin diseases</strong> such as psoriasis, reproducing the action of sunlight in a controlled way.','<strong>UV sterilisation</strong> disinfects medical equipment, food and water — an environmentally friendly method that uses no harmful chemicals and releases no harmful by-products.'],
      harm:['Overexposure can <strong>harm our eyes</strong> and cause <strong>skin cancer</strong>.','Wearing <strong>sunscreen</strong> outdoors helps, because it filters out UV radiation.']},
    visible:{t:'Visible light', vis:'The only part of the EM spectrum we can see — the rainbow colours.',
      app:['Plants use its energy to make sugars from carbon dioxide and water through <strong>photosynthesis</strong>.','It lets us carry out <strong>daily activities</strong> — reading, driving safely at night, living normally after dark.','From Edison\'s <strong>incandescent bulb</strong> (1879) we have moved to energy-saving <strong>fluorescent lamps and LEDs</strong>.'],
      harm:['It can cause <strong>chemical changes</strong> in some materials, spoiling their quality — which is why flash photography is banned in some museums and old documents are stored in the dark.','<strong>Light pollution</strong> — too much artificial light — disrupts living things that depend on the day–night cycle for migration, reproduction, feeding, sleeping and escaping predators.','<strong>Migratory birds</strong> gauge the seasons by sunlight; artificial light makes them migrate too early or too late, which can be fatal.','<strong>Turtle hatchlings</strong> are guided to the sea by natural light in the sky; artificial lamps draw them away and they die.','Lighting the streets also <strong>uses a lot of electricity</strong>. Energy-efficient <strong>LEDs and CFLs</strong> cut both light pollution and energy use.']}
  };
  const panel=root.querySelector('.em-panel');
  function show(k){
    const o=INFO[k];
    panel.innerHTML='<h5>'+o.t+'</h5><p class="em-vis">'+o.vis+'</p>'
      +'<h6 class="em-good">Applications</h6><ul>'+o.app.map(x=>'<li>'+x+'</li>').join('')+'</ul>'
      +'<h6 class="em-bad">Harmful effects</h6><ul>'+o.harm.map(x=>'<li>'+x+'</li>').join('')+'</ul>';
    root.querySelectorAll('.em-btn').forEach(b=>b.setAttribute('aria-pressed',b.dataset.k===k?'true':'false'));
  }
  root.querySelectorAll('.em-btn').forEach(b=>b.addEventListener('click',()=>show(b.dataset.k)));
  show('infrared');
})();
})();
