(function(){
  const root = document.getElementById('indicatorWidget');
  if (!root) return;
  const $ = sel => root.querySelector(sel);
  const $$ = sel => root.querySelectorAll(sel);

  const SUBSTANCES = [
    {key:'hcl',   name:'Hydrochloric acid (dilute)', ph:1,  ui:'#D93F2B', cat:'Strong acid'},
    {key:'vin',   name:'Vinegar',                     ph:3,  ui:'#E8843E', cat:'Weak acid'},
    {key:'water', name:'Pure water',                  ph:7,  ui:'#8FBF5C', cat:'Neutral'},
    {key:'soda',  name:'Baking soda solution',        ph:9,  ui:'#4FA0A8', cat:'Weak alkali'},
    {key:'soap',  name:'Soap solution',                ph:10, ui:'#2E7A8C', cat:'Alkali'},
    {key:'naoh',  name:'Sodium hydroxide (dilute)',   ph:13, ui:'#3E4A9C', cat:'Strong alkali'}
  ];

  const buttons = $$('.ind-btn');
  const tubeLiquid = $('.tube-liquid');
  const redSwatch = $('.litmus-red');
  const blueSwatch = $('.litmus-blue');
  const redLabel = $('.litmus-red-label');
  const blueLabel = $('.litmus-blue-label');
  const marker = $('.gauge-marker');
  const readout = $('.ind-readout');
  const nameEl = $('.ind-name');

  function paint(sub){
    tubeLiquid.setAttribute('fill', sub.ui);
    tubeLiquid.setAttribute('opacity', '0.85');

    const redTurnsBlue = sub.ph > 7;
    const blueTurnsRed = sub.ph < 7;
    redSwatch.setAttribute('fill', redTurnsBlue ? '#2E7A8C' : '#D93F2B');
    redLabel.textContent = 'Red litmus: ' + (redTurnsBlue ? 'turns blue' : 'stays red');
    blueSwatch.setAttribute('fill', blueTurnsRed ? '#D93F2B' : '#2E7A8C');
    blueLabel.textContent = 'Blue litmus: ' + (blueTurnsRed ? 'turns red' : 'stays blue');

    const pct = ((sub.ph - 1) / 13) * 100;
    marker.style.left = pct + '%';

    nameEl.textContent = sub.name;
    readout.textContent = 'pH ≈ ' + sub.ph + ' · ' + sub.cat;

    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.key === sub.key)));
  }

  buttons.forEach(b => {
    b.addEventListener('click', () => {
      const sub = SUBSTANCES.find(s => s.key === b.dataset.key);
      paint(sub);
    });
  });

  paint(SUBSTANCES[2]); // start neutral
})();
