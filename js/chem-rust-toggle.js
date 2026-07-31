(function(){
  const root = document.getElementById('rustWidget');
  if (!root) return;
  const $ = sel => root.querySelector(sel);

  const state = {water: true, air: true, days: 7};

  const SILVER = [183, 198, 212];   // --grid
  const RUST = [150, 66, 33];       // rust brown

  function lerpColour(t){
    const c = SILVER.map((s, i) => Math.round(s + (RUST[i] - s) * t));
    return 'rgb(' + c.join(',') + ')';
  }

  const nail = $('.nail-body');
  const flecks = root.querySelectorAll('.rust-fleck');
  const btnWater = $('.rust-btn-water');
  const btnAir = $('.rust-btn-air');
  const daySlider = $('.rust-day-slider');
  const dayVal = $('.rust-day-val');
  const readout = $('.rust-readout');
  const note = $('.rust-note');

  function render(){
    const canRust = state.water && state.air;
    const amount = canRust ? Math.min(1, state.days / 14) : 0;

    nail.setAttribute('fill', lerpColour(amount));
    flecks.forEach((f, i) => {
      const threshold = 0.15 + i * 0.11;
      f.style.opacity = amount > threshold ? Math.min(1, (amount - threshold) * 4) : 0;
    });

    btnWater.textContent = 'Water: ' + (state.water ? 'present' : 'absent');
    btnWater.setAttribute('aria-pressed', String(state.water));
    btnAir.textContent = 'Air (oxygen): ' + (state.air ? 'present' : 'absent');
    btnAir.setAttribute('aria-pressed', String(state.air));
    dayVal.textContent = 'Day ' + state.days;

    const pct = Math.round(amount * 100);
    readout.textContent = 'Rust: ' + pct + '%';

    if (!state.water && !state.air) note.textContent = 'No water and no air — nothing for the iron to react with. The nail stays bare metal.';
    else if (!state.water) note.textContent = 'Air is there, but no water — rusting needs both at once. The nail stays bare metal.';
    else if (!state.air) note.textContent = 'Water is there, but no air (no oxygen) — rusting needs both at once. The nail stays bare metal.';
    else if (amount === 0) note.textContent = 'Both water and air are present — give it a few days and rust will start to form.';
    else if (amount < 1) note.textContent = 'Both water and air are present — rust is forming.';
    else note.textContent = 'Both water and air are present — the nail is fully rusted.';
  }

  btnWater.addEventListener('click', () => { state.water = !state.water; render(); });
  btnAir.addEventListener('click', () => { state.air = !state.air; render(); });
  daySlider.addEventListener('input', e => { state.days = parseInt(e.target.value, 10); render(); });

  render();
})();
