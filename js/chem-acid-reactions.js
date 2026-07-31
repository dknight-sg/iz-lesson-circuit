(function(){
  const root = document.getElementById('acidWidget');
  if (!root) return;
  const $ = sel => root.querySelector(sel);
  const $$ = sel => root.querySelectorAll(sel);

  const MODES = {
    neutral: {
      generic: 'acid + alkali → salt + water',
      example: 'hydrochloric acid + sodium hydroxide → sodium chloride + water',
      note: 'Drag the slider to add alkali, drop by drop. The acid is gradually neutralised — the solution moves from acidic, through neutral, to alkaline.'
    },
    metal: {
      generic: 'acid + metal → salt + hydrogen',
      example: 'dilute sulfuric acid + magnesium → magnesium sulfate + hydrogen',
      note: 'Click "Add acid" — bubbles of hydrogen gas form as the metal dissolves. Test the gas with a lit splint: a squeaky pop confirms hydrogen.'
    },
    carbonate: {
      generic: 'acid + carbonate → salt + water + carbon dioxide',
      example: 'dilute hydrochloric acid + calcium carbonate → calcium chloride + water + carbon dioxide',
      note: 'Click "Add acid" — bubbles of carbon dioxide form. Bubble the gas through limewater to test it: limewater turns cloudy when carbon dioxide is present.'
    }
  };

  const modeBtns = $$('.acid-mode-btn');
  const genericEl = $('.acid-generic');
  const exampleEl = $('.acid-example');
  const noteEl = $('.acid-note');
  const metalRect = $('.acid-metal');
  const bubbles = $$('.acid-bubbles .bubble');
  const limewater = $('.limewater-vial');
  const reactBtn = $('.acid-react-btn');
  const resetBtn = $('.acid-reset-btn');
  const slider = $('.acid-slider');
  const gaugeMarker = $('.acid-gauge .gauge-marker');
  const gaugeWrap = $('.acid-gauge-wrap');
  const reactWrap = $('.acid-react-wrap');
  const metalGroup = $('.acid-metal-group');
  const carbGroup = $('.acid-carb-group');

  let mode = 'neutral';

  function resetVisuals(){
    bubbles.forEach(b => b.classList.remove('on'));
    metalRect.setAttribute('height', '140');
    metalRect.setAttribute('y', '60');
    limewater.setAttribute('fill', 'none');
    if (reactBtn){ reactBtn.disabled = false; reactBtn.textContent = 'Add acid'; }
  }

  // SVGElement has no HTMLElement-style `.hidden` IDL property, and the
  // `hidden` attribute's default `display:none` loses to our global
  // `svg{display:block}` rule at equal specificity in some engines — so
  // set the inline display style directly rather than relying on either.
  function setHidden(el, isHidden){
    if (isHidden) el.setAttribute('hidden', '');
    else el.removeAttribute('hidden');
    el.style.display = isHidden ? 'none' : '';
  }

  function setMode(key){
    mode = key;
    const m = MODES[key];
    genericEl.textContent = m.generic;
    exampleEl.textContent = m.example;
    noteEl.textContent = m.note;
    modeBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === key)));

    setHidden(gaugeWrap, key !== 'neutral');
    setHidden(reactWrap, key === 'neutral');
    setHidden(metalGroup, key !== 'metal');
    setHidden(carbGroup, key !== 'carbonate');

    resetVisuals();
    if (key === 'neutral'){
      slider.value = 0;
      updateGauge(0);
    }
  }

  function updateGauge(v){
    // v: 0 (all acid) to 100 (fully neutralised/alkaline)
    const pct = 8 + (v / 100) * 60; // keep marker in the acidic-to-neutral band of the gauge
    gaugeMarker.style.left = pct + '%';
  }

  slider.addEventListener('input', e => updateGauge(parseFloat(e.target.value)));

  if (reactBtn) reactBtn.addEventListener('click', () => {
    reactBtn.disabled = true;
    reactBtn.textContent = 'Reacting…';
    bubbles.forEach((b, i) => setTimeout(() => b.classList.add('on'), i * 180));
    if (mode === 'metal'){
      metalRect.setAttribute('height', '60');
      metalRect.setAttribute('y', '140');
    }
    if (mode === 'carbonate'){
      setTimeout(() => limewater.setAttribute('fill', 'rgba(220,226,232,0.9)'), 1200);
    }
  });

  if (resetBtn) resetBtn.addEventListener('click', resetVisuals);

  modeBtns.forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));

  setMode('neutral');
})();
