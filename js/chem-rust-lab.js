(function(){
  const root = document.getElementById('rustLabWidget');
  if (!root) return;

  const daySlider = root.querySelector('.lab-day-slider');
  const dayVal = root.querySelector('.lab-day-val');
  const btnWaterD = root.querySelector('.lab-d-water');
  const btnAirD = root.querySelector('.lab-d-air');

  const SILVER = [183, 198, 212];
  const RUST = [150, 66, 33];
  function lerpColour(t){
    const c = SILVER.map((s, i) => Math.round(s + (RUST[i] - s) * t));
    return 'rgb(' + c.join(',') + ')';
  }

  const stateD = {water: true, air: true};
  let days = 7;

  function paintTube(key, water, air){
    const card = root.querySelector('.lab-tube[data-tube="' + key + '"]');
    const nailParts = card.querySelectorAll('.lab-nail');
    const liquid = card.querySelector('.lab-liquid');
    const flecks = card.querySelectorAll('.lab-fleck');
    const resultEl = card.querySelector('.lab-result');
    const canRust = water && air;
    const amount = canRust ? Math.min(1, days / 14) : 0;

    nailParts.forEach(n => n.setAttribute('fill', lerpColour(amount)));
    if (liquid) liquid.style.opacity = water ? '0.4' : '0';
    flecks.forEach((f, i) => {
      const threshold = 0.15 + i * 0.22;
      f.style.opacity = amount > threshold ? Math.min(1, (amount - threshold) * 4) : 0;
    });

    if (!canRust){
      resultEl.textContent = 'No rust';
      resultEl.style.color = 'var(--cool)';
    } else if (amount < 1){
      resultEl.textContent = 'Rusting…';
      resultEl.style.color = 'var(--hot)';
    } else {
      resultEl.textContent = 'Fully rusted';
      resultEl.style.color = 'var(--hot)';
    }
  }

  function renderAll(){
    dayVal.textContent = 'Day ' + days;
    paintTube('a', true, true);
    paintTube('b', true, false);
    paintTube('c', false, true);
    paintTube('d', stateD.water, stateD.air);

    btnWaterD.textContent = 'Water: ' + (stateD.water ? 'present' : 'absent');
    btnWaterD.setAttribute('aria-pressed', String(stateD.water));
    btnAirD.textContent = 'Air: ' + (stateD.air ? 'present' : 'absent');
    btnAirD.setAttribute('aria-pressed', String(stateD.air));
  }

  daySlider.addEventListener('input', e => { days = parseInt(e.target.value, 10); renderAll(); });
  btnWaterD.addEventListener('click', () => { stateD.water = !stateD.water; renderAll(); });
  btnAirD.addEventListener('click', () => { stateD.air = !stateD.air; renderAll(); });

  renderAll();
})();
