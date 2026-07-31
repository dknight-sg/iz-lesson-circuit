(function(){
  const root = document.getElementById('atomsWidget');
  if (!root) return;
  const $ = sel => root.querySelector(sel);

  const REACTIONS = {
    carbon: {
      eq: 'carbon + oxygen → carbon dioxide',
      before: 'Before: 2 carbon atoms + 2 oxygen molecules (4 O atoms) = 6 atoms total',
      after: 'After: 2 carbon dioxide molecules (2 C + 4 O) = 6 atoms total'
    },
    hydrogen: {
      eq: 'hydrogen + oxygen → water',
      before: 'Before: 2 hydrogen molecules (4 H atoms) + 1 oxygen molecule (2 O atoms) = 6 atoms total',
      after: 'After: 2 water molecules (4 H + 2 O) = 6 atoms total'
    }
  };

  const eqEl = $('.atoms-eq');
  const beforeText = $('.atoms-before-text');
  const afterText = $('.atoms-after-text');
  const btnC = $('.atoms-btn-carbon');
  const btnH = $('.atoms-btn-hydrogen');
  const panelBeforeC = $('.panel-before-carbon');
  const panelAfterC = $('.panel-after-carbon');
  const panelBeforeH = $('.panel-before-hydrogen');
  const panelAfterH = $('.panel-after-hydrogen');

  // SVGElement has no HTMLElement-style `.hidden` IDL property, and the
  // `hidden` attribute's default `display:none` loses to our global
  // `svg{display:block}` rule at equal specificity in some engines — so
  // set the inline display style directly rather than relying on either.
  function setHidden(el, isHidden){
    if (isHidden) el.setAttribute('hidden', '');
    else el.removeAttribute('hidden');
    el.style.display = isHidden ? 'none' : '';
  }

  function show(key){
    const r = REACTIONS[key];
    eqEl.textContent = r.eq;
    beforeText.textContent = r.before;
    afterText.textContent = r.after;
    btnC.setAttribute('aria-pressed', String(key === 'carbon'));
    btnH.setAttribute('aria-pressed', String(key === 'hydrogen'));
    setHidden(panelBeforeC, key !== 'carbon');
    setHidden(panelAfterC, key !== 'carbon');
    setHidden(panelBeforeH, key !== 'hydrogen');
    setHidden(panelAfterH, key !== 'hydrogen');
  }

  btnC.addEventListener('click', () => show('carbon'));
  btnH.addEventListener('click', () => show('hydrogen'));
  show('carbon');
})();
