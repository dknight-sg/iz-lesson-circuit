/* ============================================================
   Chemical Changes — lesson simulations
   Every widget guards on its own root id, so one file can be
   loaded by every lesson page.
   ============================================================ */
(function(){
'use strict';

const NS = 'http://www.w3.org/2000/svg';
const $ = (sel, ctx) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

// SVGElement has no HTMLElement-style `.hidden` IDL property, and the
// hidden attribute's display:none loses to our global svg{display:block}
// rule in some engines — so drive inline display directly.
function setHidden(node, isHidden){
  if (!node) return;
  if (isHidden) node.setAttribute('hidden', '');
  else node.removeAttribute('hidden');
  node.style.display = isHidden ? 'none' : '';
}
function pressGroup(buttons, activeEl){
  buttons.forEach(b => b.setAttribute('aria-pressed', String(b === activeEl)));
}
function svg(tag, attrs){
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}

/* ============================================================
   1. ATOM LAB — rearrangement of atoms & conservation of mass
   ============================================================ */
(function atomLab(){
  const root = document.getElementById('atomLab');
  if (!root) return;

  const ATOM = {
    C: { r: 15, fill: '#3E4650', label: 'C', text: '#F7FAFC' },
    O: { r: 13, fill: '#D93F2B', label: 'O', text: '#F7FAFC' },
    H: { r: 9,  fill: '#F7FAFC', label: 'H', text: '#0F2436' }
  };

  // molecule templates: atoms at relative positions, bonds between indices
  const MOL = {
    H2:  { w: 46, atoms: [['H',12,23],['H',34,23]], bonds: [[0,1]] },
    O2:  { w: 58, atoms: [['O',16,23],['O',42,23]], bonds: [[0,1]] },
    H2O: { w: 56, atoms: [['O',28,18],['H',10,36],['H',46,36]], bonds: [[0,1],[0,2]] },
    CH4: { w: 62, atoms: [['C',31,23],['H',31,5],['H',31,41],['H',11,23],['H',51,23]],
           bonds: [[0,1],[0,2],[0,3],[0,4]] },
    CO2: { w: 74, atoms: [['C',37,23],['O',11,23],['O',63,23]], bonds: [[0,1],[0,2]] },
    C:   { w: 36, atoms: [['C',18,23]], bonds: [] }
  };

  const RX = {
    water: {
      name: 'hydrogen + oxygen → water',
      reactants: [['H2',2],['O2',1]],
      products:  [['H2O',2]],
      elements: ['H','O'],
      counts: { H: 4, O: 2 },
      note: 'Two hydrogen molecules and one oxygen molecule rearrange into two water molecules.'
    },
    methane: {
      name: 'methane + oxygen → carbon dioxide + water',
      reactants: [['CH4',1],['O2',2]],
      products:  [['CO2',1],['H2O',2]],
      elements: ['C','H','O'],
      counts: { C: 1, H: 4, O: 4 },
      note: 'One methane molecule and two oxygen molecules rearrange into one carbon dioxide molecule and two water molecules.'
    },
    carbon: {
      name: 'carbon + oxygen → carbon dioxide',
      reactants: [['C',1],['O2',1]],
      products:  [['CO2',1]],
      elements: ['C','O'],
      counts: { C: 1, O: 2 },
      note: 'One carbon atom and one oxygen molecule combine to form one carbon dioxide molecule.'
    }
  };

  const leftBox  = $('.al-left', root);
  const rightBox = $('.al-right', root);
  const eqEl     = $('.al-eq', root);
  const tbody    = $('.al-counts tbody', root);
  const noteEl   = $('.al-note', root);
  const btns     = $$('.al-pick', root);
  const checkBtn = $('.al-check', root);
  const showBtn  = $('.al-show', root);
  const fbEl     = $('.al-fb', root);
  let current = 'water';

  function drawMolecule(key){
    const m = MOL[key];
    const s = svg('svg', { viewBox: '0 0 ' + m.w + ' 50', width: m.w, height: 50, class: 'mol' });
    // beat the global `svg{width:100%}` rule — these must stay at natural size
    s.style.cssText = 'display:inline-block;vertical-align:middle;width:' + m.w + 'px;height:50px;flex:none';
    m.bonds.forEach(([a, b]) => {
      const A = m.atoms[a], B = m.atoms[b];
      s.appendChild(svg('line', {
        x1: A[1], y1: A[2], x2: B[1], y2: B[2],
        stroke: '#0F2436', 'stroke-width': 2.5
      }));
    });
    m.atoms.forEach(([sym, x, y]) => {
      const spec = ATOM[sym];
      s.appendChild(svg('circle', {
        cx: x, cy: y, r: spec.r, fill: spec.fill,
        stroke: '#0F2436', 'stroke-width': 1.5
      }));
      const t = svg('text', {
        x: x, y: y + 4, 'text-anchor': 'middle', fill: spec.text,
        'font-family': 'Space Mono, monospace', 'font-size': 11, 'font-weight': 700
      });
      t.textContent = spec.label;
      s.appendChild(t);
    });
    return s;
  }

  function fillSide(box, groups){
    box.innerHTML = '';
    const holder = document.createElement('div');
    holder.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;justify-content:center';
    groups.forEach(([key, n], gi) => {
      if (gi) {
        const plus = document.createElement('span');
        plus.textContent = '+';
        plus.style.cssText = 'font-family:"Space Mono",monospace;font-weight:700;color:var(--charge)';
        holder.appendChild(plus);
      }
      for (let k = 0; k < n; k++) holder.appendChild(drawMolecule(key));
    });
    box.appendChild(holder);
  }

  function buildRows(rx){
    tbody.innerHTML = '';
    rx.elements.forEach(sym => {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><strong>' + sym + '</strong> atoms</td>' +
        '<td><input type="number" min="0" max="20" data-side="r" data-el="' + sym + '" aria-label="' + sym + ' atoms in reactants"></td>' +
        '<td><input type="number" min="0" max="20" data-side="p" data-el="' + sym + '" aria-label="' + sym + ' atoms in products"></td>' +
        '<td class="mk"></td>';
      tbody.appendChild(tr);
    });
  }

  function load(key){
    current = key;
    const rx = RX[key];
    eqEl.textContent = rx.name;
    fillSide(leftBox, rx.reactants);
    fillSide(rightBox, rx.products);
    buildRows(rx);
    noteEl.textContent = '';
    fbEl.textContent = '';
    fbEl.className = 'al-fb';
    setHidden(fbEl, true);
    checkBtn.disabled = false;
    showBtn.disabled = false;
  }

  function check(){
    const rx = RX[current];
    let allRight = true, conserved = true;
    rx.elements.forEach(sym => {
      const ri = $('input[data-side="r"][data-el="' + sym + '"]', root);
      const pi = $('input[data-side="p"][data-el="' + sym + '"]', root);
      const want = rx.counts[sym];
      const rv = Number(ri.value), pv = Number(pi.value);
      const rOk = rv === want, pOk = pv === want;
      ri.classList.toggle('ok', rOk); ri.classList.toggle('no', !rOk && ri.value !== '');
      pi.classList.toggle('ok', pOk); pi.classList.toggle('no', !pOk && pi.value !== '');
      if (!rOk || !pOk) allRight = false;
      if (rv !== pv) conserved = false;
      const mk = ri.closest('tr').querySelector('.mk');
      mk.textContent = (rv === pv && ri.value !== '') ? 'same ✓' : '—';
      mk.className = 'mk ' + ((rv === pv && ri.value !== '') ? 'ok' : 'no');
    });

    setHidden(fbEl, false);
    if (allRight){
      fbEl.className = 'al-fb good';
      fbEl.innerHTML = '<strong>All correct.</strong> The number of atoms of each element is the same ' +
        'before and after, so no atoms were created or destroyed — the equation is balanced and ' +
        '<strong>mass is conserved</strong>.';
    } else if (conserved){
      fbEl.className = 'al-fb warn';
      fbEl.innerHTML = 'Your two columns match each other, so you have the conservation idea right — ' +
        'but at least one count is off. Recount the atoms in the diagrams above.';
    } else {
      fbEl.className = 'al-fb bad';
      fbEl.innerHTML = 'Not yet. Count every atom in the diagram, including the ones inside each molecule. ' +
        'The reactant and product columns must end up identical.';
    }
  }

  function reveal(){
    const rx = RX[current];
    rx.elements.forEach(sym => {
      $('input[data-side="r"][data-el="' + sym + '"]', root).value = rx.counts[sym];
      $('input[data-side="p"][data-el="' + sym + '"]', root).value = rx.counts[sym];
    });
    check();
    noteEl.textContent = rx.note;
  }

  btns.forEach(b => b.addEventListener('click', () => {
    pressGroup(btns, b);
    load(b.dataset.rx);
  }));
  checkBtn.addEventListener('click', check);
  showBtn.addEventListener('click', reveal);

  pressGroup(btns, btns[0]);
  load('water');
})();

/* ============================================================
   2. THERMAL LAB — thermal decomposition of copper carbonate
   ============================================================ */
(function thermalLab(){
  const root = document.getElementById('thermalLab');
  if (!root) return;

  const solid    = $('.tl-solid', root);
  const flame    = $('.tl-flame', root);
  const bubbles  = $$('.tl-bubble', root);
  const limewater= $('.tl-limewater', root);
  const heatBtn  = $('.tl-heat', root);
  const resetBtn = $('.tl-reset', root);
  const stateEl  = $('.tl-state', root);
  const limeEl   = $('.tl-lime', root);
  const concl    = $('.tl-concl', root);
  let heating = false, timer = null;

  function reset(){
    heating = false;
    clearTimeout(timer);
    solid.setAttribute('fill', '#4E9E6A');          // green copper(II) carbonate
    setHidden(flame, true);
    bubbles.forEach(b => b.classList.remove('on'));
    limewater.setAttribute('fill', 'rgba(220,235,240,0.35)');
    stateEl.textContent = 'green solid';
    limeEl.textContent = 'clear and colourless';
    concl.textContent = 'Heat the copper(II) carbonate and watch both the solid and the limewater.';
    heatBtn.disabled = false;
    heatBtn.textContent = 'Heat strongly';
  }

  function heat(){
    if (heating) return;
    heating = true;
    heatBtn.disabled = true;
    heatBtn.textContent = 'Heating…';
    setHidden(flame, false);
    stateEl.textContent = 'green solid — heating';
    concl.textContent = 'Heating…';

    timer = setTimeout(() => {
      bubbles.forEach((b, i) => setTimeout(() => b.classList.add('on'), i * 200));
      stateEl.textContent = 'turning black';
      timer = setTimeout(() => {
        solid.setAttribute('fill', '#22262B');       // black copper(II) oxide
        stateEl.textContent = 'black solid';
        limewater.setAttribute('fill', 'rgba(232,238,242,0.95)');
        limeEl.textContent = 'chalky white precipitate';
        concl.innerHTML = 'The green solid turned <strong>black</strong> and the limewater turned ' +
          '<strong>chalky</strong>. Two new substances have formed, so this is a chemical change: ' +
          '<em>copper carbonate → copper oxide + carbon dioxide</em>. Heat alone broke one compound ' +
          'into two simpler ones — that is thermal decomposition, not melting.';
        heatBtn.textContent = 'Reaction complete';
      }, 1600);
    }, 900);
  }

  heatBtn.addEventListener('click', heat);
  resetBtn.addEventListener('click', reset);
  reset();
})();

/* ============================================================
   3. RUST LAB — conditions required for rusting
   ============================================================ */
(function rustLab(){
  const root = document.getElementById('rustLab');
  if (!root) return;

  const SILVER = [183, 198, 212], RUST = [150, 66, 33];
  const mix = t => 'rgb(' + SILVER.map((s, i) => Math.round(s + (RUST[i] - s) * t)).join(',') + ')';

  const tubes = $$('.rl-tube', root);
  const slider = $('.rl-days', root);
  const dayVal = $('.rl-dayval', root);
  const wBtn = $('.rl-water', root);
  const aBtn = $('.rl-air', root);
  const concl = $('.rl-concl', root);
  const custom = { water: true, air: true };
  let days = 8;

  function paint(tube, water, air){
    const amount = (water && air) ? Math.min(1, days / 14) : 0;
    $$('.rl-nail', tube).forEach(n => n.setAttribute('fill', mix(amount)));
    const liquid = $('.rl-liquid', tube);
    if (liquid) liquid.style.opacity = water ? '0.45' : '0';
    $$('.rl-fleck', tube).forEach((f, i) => {
      const th = 0.18 + i * 0.2;
      f.style.opacity = amount > th ? Math.min(1, (amount - th) * 4) : 0;
    });
    const out = $('.rl-result', tube);
    if (amount === 0){ out.textContent = 'No rust'; out.style.color = 'var(--cool)'; }
    else if (amount < 1){ out.textContent = 'Rusting…'; out.style.color = 'var(--hot)'; }
    else { out.textContent = 'Rusted'; out.style.color = 'var(--hot)'; }
  }

  function render(){
    dayVal.textContent = 'Day ' + days;
    tubes.forEach(t => {
      const id = t.dataset.tube;
      if (id === 'a') paint(t, true, true);
      else if (id === 'b') paint(t, true, false);
      else if (id === 'c') paint(t, false, true);
      else paint(t, custom.water, custom.air);
    });
    wBtn.textContent = 'Water: ' + (custom.water ? 'present' : 'absent');
    wBtn.setAttribute('aria-pressed', String(custom.water));
    aBtn.textContent = 'Air: ' + (custom.air ? 'present' : 'absent');
    aBtn.setAttribute('aria-pressed', String(custom.air));

    if (custom.water && custom.air) concl.textContent = 'Tube D has both water and air — it rusts, just like tube A.';
    else if (!custom.water && !custom.air) concl.textContent = 'Tube D has neither water nor air — nothing for the iron to react with.';
    else if (!custom.water) concl.textContent = 'Tube D has air but no water — no rust, matching tube C.';
    else concl.textContent = 'Tube D has water but no air — no rust, matching tube B.';
  }

  slider.addEventListener('input', e => { days = Number(e.target.value); render(); });
  wBtn.addEventListener('click', () => { custom.water = !custom.water; render(); });
  aBtn.addEventListener('click', () => { custom.air = !custom.air; render(); });
  render();
})();

/* ============================================================
   4. pH LAB — pH scale and indicators
   ============================================================ */
(function phLab(){
  const root = document.getElementById('phLab');
  if (!root) return;

  // pH values as printed in the textbook's Figure 11.20
  const SUBS = [
    { key:'battery', name:'Acid in car battery', ph:0 },
    { key:'lemon',   name:'Lemon juice',         ph:2 },
    { key:'vinegar', name:'Vinegar',             ph:2 },
    { key:'tomato',  name:'Tomato juice',        ph:4 },
    { key:'coffee',  name:'Black coffee',        ph:5 },
    { key:'milk',    name:'Milk',                ph:6.5 },
    { key:'water',   name:'Pure water',          ph:7 },
    { key:'soda',    name:'Baking soda',         ph:9.5 },
    { key:'ammonia', name:'Ammonia',             ph:11.5 },
    { key:'oven',    name:'Oven cleaner',        ph:13.5 }
  ];

  // Universal Indicator colours as tabulated in the revision guide
  function uiColour(ph){
    if (ph < 4)  return { c:'#D62828', n:'Red' };
    if (ph < 5.5)return { c:'#E8702A', n:'Orange' };
    if (ph < 6.5)return { c:'#E8CF3E', n:'Yellow' };
    if (ph < 7.5)return { c:'#4FA85C', n:'Green' };
    if (ph < 8.5)return { c:'#3E7FBF', n:'Blue' };
    if (ph < 10) return { c:'#35479C', n:'Indigo' };
    return { c:'#6B3E9C', n:'Violet' };
  }
  function cabbage(ph){
    if (ph <= 3) return { c:'#C62B3E', n:'Red' };
    if (ph <= 5) return { c:'#8E3C86', n:'Purple' };
    if (ph <= 7) return { c:'#6B4A9E', n:'Violet' };
    if (ph <= 9) return { c:'#3E6FBF', n:'Blue' };
    if (ph <= 11)return { c:'#3E9E93', n:'Blue-green' };
    return { c:'#9EBF3E', n:'Green-yellow' };
  }
  function methylOrange(ph){
    return ph < 3.1 ? { c:'#D62828', n:'Red' }
         : ph > 4.4 ? { c:'#E8C53E', n:'Yellow' }
                    : { c:'#E8843E', n:'Orange' };
  }
  function bromothymol(ph){
    return ph < 6.0 ? { c:'#E8C53E', n:'Yellow' }
         : ph > 7.6 ? { c:'#2E58A8', n:'Blue' }
                    : { c:'#4FA85C', n:'Green' };
  }
  function phenolRed(ph){
    return ph < 6.8 ? { c:'#E8C53E', n:'Yellow' }
         : ph > 8.2 ? { c:'#C62B3E', n:'Red' }
                    : { c:'#E8843E', n:'Orange' };
  }
  const IND = {
    ui:        { label:'Universal Indicator', fn: uiColour },
    cabbage:   { label:'Red cabbage juice',   fn: cabbage },
    methyl:    { label:'Methyl orange',       fn: methylOrange },
    bromo:     { label:'Bromothymol blue',    fn: bromothymol },
    phenol:    { label:'Phenol red',          fn: phenolRed }
  };

  const subBtns = $$('.pl-sub', root);
  const indBtns = $$('.pl-ind', root);
  const liquid  = $('.pl-liquid', root);
  const needle  = $('.pl-needle', root);
  const nameEl  = $('.pl-name', root);
  const phEl    = $('.pl-ph', root);
  const classEl = $('.pl-class', root);
  const indName = $('.pl-indname', root);
  const indCol  = $('.pl-indcolour', root);
  const indSw   = $('.pl-indswatch', root);
  const redStrip= $('.pl-red', root);
  const blueStrip=$('.pl-blue', root);
  const redTxt  = $('.pl-redtxt', root);
  const blueTxt = $('.pl-bluetxt', root);
  const verdict = $('.pl-verdict', root);

  let sub = SUBS.find(s => s.key === 'water');
  let ind = 'ui';

  function render(){
    const spec = IND[ind].fn(sub.ph);
    liquid.setAttribute('fill', spec.c);
    indSw.style.background = spec.c;
    indName.textContent = IND[ind].label;
    indCol.textContent = spec.n;

    needle.style.left = (sub.ph / 14 * 100) + '%';
    nameEl.textContent = sub.name;
    phEl.textContent = 'pH ' + sub.ph;

    const acidic = sub.ph < 7, alkaline = sub.ph > 7;
    classEl.textContent = acidic ? 'Acidic' : alkaline ? 'Alkaline' : 'Neutral';
    classEl.style.color = acidic ? 'var(--hot)' : alkaline ? 'var(--cool)' : 'var(--ink)';

    // litmus: only the pH-7 boundary matters
    redStrip.style.background  = alkaline ? '#2E58A8' : '#C62B3E';
    blueStrip.style.background = acidic   ? '#C62B3E' : '#2E58A8';
    redTxt.textContent  = alkaline ? 'turns blue' : 'stays red';
    blueTxt.textContent = acidic   ? 'turns red'  : 'stays blue';

    verdict.innerHTML = acidic
      ? 'An acidic solution turns <strong>blue litmus red</strong> and leaves red litmus unchanged.'
      : alkaline
        ? 'An alkaline solution turns <strong>red litmus blue</strong> and leaves blue litmus unchanged.'
        : 'A neutral solution has <strong>no effect on either</strong> litmus paper — which is exactly why litmus alone cannot tell water apart from a neutral solution.';
  }

  subBtns.forEach(b => b.addEventListener('click', () => {
    sub = SUBS.find(s => s.key === b.dataset.sub);
    pressGroup(subBtns, b);
    render();
  }));
  indBtns.forEach(b => b.addEventListener('click', () => {
    ind = b.dataset.ind;
    pressGroup(indBtns, b);
    render();
  }));

  pressGroup(subBtns, subBtns.find(b => b.dataset.sub === 'water'));
  pressGroup(indBtns, indBtns[0]);
  render();
})();

/* ============================================================
   5. ACID BENCH — acid + alkali / metal / carbonate, + gas tests
   ============================================================ */
(function acidBench(){
  const root = document.getElementById('acidBench');
  if (!root) return;

  const ACIDS = {
    hydrochloric: { name:'hydrochloric acid', salt:'chloride' },
    sulfuric:     { name:'sulfuric acid',     salt:'sulfate' },
    nitric:       { name:'nitric acid',       salt:'nitrate' }
  };
  const PARTNERS = {
    sodium:    { name:'sodium hydroxide',    kind:'alkali',    metal:'sodium' },
    potassium: { name:'potassium hydroxide', kind:'alkali',    metal:'potassium' },
    magnesium: { name:'magnesium',           kind:'metal',     metal:'magnesium' },
    zinc:      { name:'zinc',                kind:'metal',     metal:'zinc' },
    copper:    { name:'copper',              kind:'metal',     metal:'copper', inert:true },
    calcarb:   { name:'calcium carbonate',   kind:'carbonate', metal:'calcium' },
    coppcarb:  { name:'copper carbonate',    kind:'carbonate', metal:'copper' }
  };

  const acidBtns = $$('.ab-acid', root);
  const partBtns = $$('.ab-part', root);
  const eqEl     = $('.ab-eq', root);
  const obsEl    = $('.ab-obs', root);
  const gasWrap  = $('.ab-gaswrap', root);
  const gasName  = $('.ab-gasname', root);
  const testBtns = $$('.ab-test', root);
  const verdict  = $('.ab-verdict', root);
  const fizz     = $$('.ab-fizz', root);
  const solidEl  = $('.ab-solid', root);
  const liquidEl = $('.ab-liquid', root);

  let acid = 'hydrochloric', part = 'sodium';

  function result(){
    const A = ACIDS[acid], P = PARTNERS[part];
    const salt = P.metal + ' ' + A.salt;
    if (P.kind === 'alkali')
      return { products:[salt, 'water'], gas:null,
               obs:'No bubbles. The mixture warms slightly and the solution becomes neutral.' };
    if (P.kind === 'metal'){
      if (P.inert)
        return { products:null, gas:null,
                 obs:'Nothing happens. Copper is too unreactive to react with a dilute acid, so no hydrogen is produced.' };
      return { products:[salt, 'hydrogen'], gas:'hydrogen',
               obs:'Bubbles of gas form quickly and the metal gradually dissolves.' };
    }
    return { products:[salt, 'water', 'carbon dioxide'], gas:'carbon dioxide',
             obs:'Bubbles of gas fizz off and the solid gradually dissolves.' };
  }

  function render(){
    const A = ACIDS[acid], P = PARTNERS[part], R = result();

    if (!R.products){
      eqEl.innerHTML = '<span class="rx">' + A.name + ' + ' + P.name + '</span>' +
                       '<span class="arrow">→</span><span class="px">no reaction</span>';
    } else {
      eqEl.innerHTML = '<span class="rx">' + A.name + ' + ' + P.name + '</span>' +
                       '<span class="arrow">→</span>' +
                       '<span class="px">' + R.products.join(' + ') + '</span>';
    }
    obsEl.textContent = R.obs;

    const bubbling = !!R.gas;
    fizz.forEach((f, i) => {
      if (bubbling) setTimeout(() => f.classList.add('on'), i * 150);
      else f.classList.remove('on');
    });
    solidEl.style.opacity = (P.kind === 'alkali') ? 0 : 1;
    liquidEl.setAttribute('fill', P.kind === 'alkali' ? '#7FB07F' : '#E8A33E');

    setHidden(gasWrap, !R.gas);
    if (R.gas) gasName.textContent = R.gas;
    verdict.textContent = '';
    verdict.className = 'verdict ab-verdict';
    setHidden(verdict, true);
    testBtns.forEach(b => b.disabled = false);
  }

  function runTest(kind){
    const R = result();
    setHidden(verdict, false);
    let ok = false, msg = '';
    if (kind === 'splint'){
      if (R.gas === 'hydrogen'){ ok = true; msg = 'The lighted splint goes out with a squeaky "pop". That confirms hydrogen.'; }
      else if (R.gas === 'carbon dioxide'){ msg = 'The splint is simply extinguished — no pop. Carbon dioxide puts a flame out, but so do other gases, so this does not identify it. Use limewater instead.'; }
      else { msg = 'No gas was produced, so there is nothing to test.'; }
    } else {
      if (R.gas === 'carbon dioxide'){ ok = true; msg = 'The limewater turns chalky — a white precipitate forms. That confirms carbon dioxide.'; }
      else if (R.gas === 'hydrogen'){ msg = 'The limewater stays clear and colourless. Hydrogen does not turn limewater chalky — test it with a lighted splint instead.'; }
      else { msg = 'No gas was produced, so there is nothing to test.'; }
    }
    verdict.className = 'verdict ab-verdict ' + (ok ? 'good' : 'bad');
    verdict.textContent = msg;
  }

  acidBtns.forEach(b => b.addEventListener('click', () => {
    acid = b.dataset.acid; pressGroup(acidBtns, b); render();
  }));
  partBtns.forEach(b => b.addEventListener('click', () => {
    part = b.dataset.part; pressGroup(partBtns, b); render();
  }));
  testBtns.forEach(b => b.addEventListener('click', () => runTest(b.dataset.test)));

  pressGroup(acidBtns, acidBtns[0]);
  pressGroup(partBtns, partBtns[0]);
  render();
})();

/* ============================================================
   6. TRIGGER LAB — the five ways a chemical change is caused
   ============================================================ */
(function triggerLab(){
  const root = document.getElementById('triggerLab');
  if (!root) return;

  const T = {
    mixing: {
      title:'Mixing',
      eq:'hydrochloric acid + sodium hydroxide → sodium chloride + water',
      body:'Two or more reactants are simply brought together and react irreversibly. Acids reacting with alkalis, metals and carbonates all belong here.'
    },
    heating: {
      title:'Heating',
      eq:'calcium carbonate --heat--> calcium oxide + carbon dioxide',
      body:'Heat, or a rise in temperature, supplies what the reaction needs to start. Both combustion and thermal decomposition are triggered this way.'
    },
    light: {
      title:'Exposure to light',
      eq:'carbon dioxide + water --light--> glucose + oxygen',
      body:'Light energy drives the change. Photosynthesis is the big one, but the same idea explains why clothes and book covers fade in sunlight — UV drives a chemical reaction in the dye.'
    },
    oxygen: {
      title:'Interaction with oxygen',
      eq:'iron + water + oxygen → iron hydroxide (rust)',
      body:'A substance gains oxygen — oxidation. Rusting, cellular respiration and the greening of copper coins are all examples.'
    },
    current: {
      title:'Using an electric current',
      eq:'water --electricity--> hydrogen + oxygen',
      body:'An electric current breaks a compound down, or drives metal from a solution onto an object. This covers electrolysis and electroplating.'
    }
  };

  const btns = $$('.tg-pick', root);
  const titleEl = $('.tg-title', root);
  const eqEl = $('.tg-eq', root);
  const bodyEl = $('.tg-body', root);
  const badge = $('.tg-badge', root);

  function show(key){
    const t = T[key];
    titleEl.textContent = t.title;
    eqEl.textContent = t.eq;
    bodyEl.textContent = t.body;
    setHidden(badge, true);
  }

  btns.forEach(b => b.addEventListener('click', () => {
    pressGroup(btns, b); show(b.dataset.trigger);
  }));
  pressGroup(btns, btns[0]);
  show('mixing');
})();

/* ============================================================
   7. ELECTRO LAB — electrolysis and electroplating
   ============================================================ */
(function electroLab(){
  const root = document.getElementById('electroLab');
  if (!root) return;

  const modeBtns = $$('.el-mode', root);
  const runBtn   = $('.el-run', root);
  const resetBtn = $('.el-reset', root);
  const eqEl     = $('.el-eq', root);
  const negLabel = $('.el-neg-label', root);
  const posLabel = $('.el-pos-label', root);
  const negOut   = $('.el-neg-out', root);
  const posOut   = $('.el-pos-out', root);
  const noteEl   = $('.el-note', root);
  const negBubbles = $$('.el-bub-neg', root);
  const posBubbles = $$('.el-bub-pos', root);
  const plateLayer = $('.el-plate', root);
  const objectEl   = $('.el-object', root);
  const bathEl     = $('.el-bath', root);
  const ions       = $$('.el-ion', root);

  const MODES = {
    water: {
      eq:'water --electricity--> hydrogen + oxygen',
      neg:'negative electrode', pos:'positive electrode',
      negOut:'hydrogen — 2 volumes', posOut:'oxygen — 1 volume',
      bath:'#BBD4E8',
      note:'Twice as much hydrogen is produced as oxygen. Test the oxygen with a glowing splint — it rekindles into a flame.'
    },
    salt: {
      eq:'sodium chloride --electricity--> sodium + chlorine',
      neg:'negative electrode', pos:'positive electrode',
      negOut:'sodium metal', posOut:'chlorine gas',
      bath:'#E8D9A8',
      note:'Molten sodium chloride is split into its two elements. The graphite rods are the electrodes; the iron screen stops the sodium and chlorine meeting and reacting again.'
    },
    plate: {
      eq:'copper is deposited onto the object at the negative electrode',
      neg:'object being plated (negative)', pos:'copper metal (positive)',
      negOut:'copper coating builds up', posOut:'copper dissolves into solution',
      bath:'#5FA3D9',
      note:'The object to be plated is always the negative electrode. The solution stays blue because copper leaves the positive electrode as fast as it is deposited on the object.'
    }
  };

  let mode = 'water', running = false, t = null;

  function reset(){
    running = false;
    clearTimeout(t);
    const M = MODES[mode];
    eqEl.textContent = M.eq;
    negLabel.textContent = M.neg;
    posLabel.textContent = M.pos;
    negOut.textContent = '—';
    posOut.textContent = '—';
    noteEl.textContent = 'Switch the current on to start.';
    bathEl.setAttribute('fill', M.bath);
    negBubbles.forEach(b => b.classList.remove('on'));
    posBubbles.forEach(b => b.classList.remove('on'));
    ions.forEach(i => setHidden(i, true));
    const plating = mode === 'plate';
    setHidden(plateLayer, !plating);
    setHidden(objectEl, !plating);
    if (plating){ plateLayer.setAttribute('height', '0'); plateLayer.setAttribute('y', '92'); }
    runBtn.disabled = false;
    runBtn.textContent = 'Switch current on';
  }

  function run(){
    if (running) return;
    running = true;
    runBtn.disabled = true;
    runBtn.textContent = 'Current flowing…';
    const M = MODES[mode];

    if (mode === 'plate'){
      ions.forEach((i, k) => setTimeout(() => setHidden(i, false), k * 180));
      t = setTimeout(() => {
        plateLayer.setAttribute('height', '46');
        plateLayer.setAttribute('y', '46');
        negOut.textContent = M.negOut;
        posOut.textContent = M.posOut;
        noteEl.textContent = M.note;
        runBtn.textContent = 'Plating complete';
      }, 700);
      return;
    }

    // gas modes: negative electrode bubbles twice as fast as positive
    negBubbles.forEach((b, k) => setTimeout(() => b.classList.add('on'), k * 160));
    posBubbles.forEach((b, k) => setTimeout(() => b.classList.add('on'), k * 320));
    t = setTimeout(() => {
      negOut.textContent = M.negOut;
      posOut.textContent = M.posOut;
      noteEl.textContent = M.note;
      runBtn.textContent = 'Current flowing';
    }, 1100);
  }

  modeBtns.forEach(b => b.addEventListener('click', () => {
    mode = b.dataset.mode; pressGroup(modeBtns, b); reset();
  }));
  runBtn.addEventListener('click', run);
  resetBtn.addEventListener('click', reset);

  pressGroup(modeBtns, modeBtns[0]);
  reset();
})();

/* ============================================================
   8. OCEAN LAB — acidification of the oceans
   ============================================================ */
(function oceanLab(){
  const root = document.getElementById('oceanLab');
  if (!root) return;

  const slider = $('.ol-co2', root);
  const co2El  = $('.ol-co2val', root);
  const phEl   = $('.ol-ph', root);
  const yearEl = $('.ol-year', root);
  const shell  = $('.ol-shell', root);
  const seaEl  = $('.ol-sea', root);
  const noteEl = $('.ol-note', root);

  // Anchored on the two data points printed in the revision guide:
  // 1875 → 280 mg/l, pH 8.2 (thicker shells);  2011 → 400 mg/l, pH 8.1 (thinner shells)
  function phFor(co2){ return 8.2 - (co2 - 280) * (0.1 / 120); }

  function render(){
    const co2 = Number(slider.value);
    const ph = phFor(co2);
    co2El.textContent = co2 + ' mg/l';
    phEl.textContent = ph.toFixed(2);

    yearEl.textContent = co2 <= 290 ? 'about 1875'
      : co2 <= 410 ? 'about 2011'
      : 'a projected future';

    // shell thins as pH falls: 14px at pH 8.2 down to ~3px
    const thick = Math.max(3, 14 - (8.2 - ph) * 40);
    shell.setAttribute('stroke-width', thick.toFixed(1));
    shell.setAttribute('stroke', ph > 8.15 ? '#E8E2D2' : ph > 8.05 ? '#D8CFB8' : '#BFB49A');
    seaEl.setAttribute('fill', ph > 8.15 ? '#2E7A8C' : ph > 8.05 ? '#357A80' : '#3E7A6A');

    noteEl.innerHTML = co2 <= 290
      ? 'Pre-industrial seawater. Carbonate is plentiful, so shells and coral skeletons build up <strong>thick</strong>.'
      : co2 <= 410
        ? 'More carbon dioxide dissolves into the seawater and forms carbonic acid, which lowers the pH. Shells are measurably <strong>thinner</strong> than in 1875.'
        : 'At still higher carbon dioxide levels the seawater becomes more acidic again. Shells and corals made of calcium carbonate react with the acidic seawater and are broken down faster than the organisms can rebuild them.';
  }

  slider.addEventListener('input', render);
  render();
})();

})();
