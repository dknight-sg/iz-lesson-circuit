/* ============================================================
   Interactive question engine
   Renders declarative questions from a JSON data island into
   the element carrying id="quiz".

   Types: mcq | multi | sort | wordeq | structured
   ============================================================ */
(function(){
  const root = document.getElementById('quiz');
  if (!root) return;
  const dataEl = root.querySelector('script[type="application/json"]');
  if (!dataEl) return;

  const SPEC = JSON.parse(dataEl.textContent);
  const QS = SPEC.questions || [];
  const LETTERS = 'ABCDEFGH';

  // running score ------------------------------------------------
  const state = { earned: 0, possible: 0, done: 0 };
  const bar = document.getElementById('scorebar');
  const scEl = bar && bar.querySelector('.sc');
  const fillEl = bar && bar.querySelector('.bar span');
  const doneEl = bar && bar.querySelector('.dn');

  function totalMarks(){
    return QS.reduce((sum, q) => sum + qMarks(q), 0);
  }
  function qMarks(q){
    if (q.type === 'structured') return q.parts.reduce((s, p) => s + (p.marks || 1), 0);
    if (q.type === 'sort') return q.items.length;
    return q.marks || 1;
  }
  function bump(earned, possible){
    state.earned += earned;
    state.possible += possible;
    state.done += 1;
    paintScore();
  }
  function paintScore(){
    if (!bar) return;
    const tm = totalMarks();
    scEl.textContent = state.earned + ' / ' + tm;
    fillEl.style.width = tm ? Math.round((state.earned / tm) * 100) + '%' : '0%';
    doneEl.textContent = state.done + ' of ' + QS.length + ' answered';
  }

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  function feedback(host, ok, marksGot, marksMax, text){
    const fb = el('div', 'qz-fb ' + (ok ? 'good' : 'bad'));
    const label = ok ? 'Correct' : (marksGot > 0 ? 'Partly right' : 'Not quite');
    fb.appendChild(el('p', null,
      '<span class="mark">' + label + ' · ' + marksGot + '/' + marksMax + '</span>'));
    if (text) fb.appendChild(el('p', null, text));
    host.appendChild(fb);
    return fb;
  }

  // On a wrong attempt, show *why that answer was wrong* and a numbered
  // route to the correct one. Only rendered when the attempt was not fully
  // correct — a right answer just gets the short confirmation.
  function derivation(fb, q, opts){
    opts = opts || {};
    const box = el('div', 'derive');

    if (opts.whyWrong){
      box.appendChild(el('p', 'why',
        '<strong>Why that isn’t right:</strong> ' + opts.whyWrong));
    }

    const steps = q.workthrough || [];
    if (steps.length){
      box.appendChild(el('h5', null, 'How to work it out'));
      const ol = el('ol');
      steps.forEach(s => ol.appendChild(el('li', null, s)));
      box.appendChild(ol);
    }

    if (opts.answerLine){
      box.appendChild(el('p', 'ansline',
        '<strong>Correct answer:</strong> ' + opts.answerLine));
    }

    if (box.children.length) fb.appendChild(box);
  }

  // ---- MCQ / multi ---------------------------------------------
  function buildChoice(q, body, multi){
    const need = multi ? (q.pick || (q.answer || []).length) : 1;
    const answer = multi ? q.answer.slice().sort() : q.answer;
    const chosen = new Set();

    const wrap = el('div', 'opts');
    const btns = q.options.map((text, i) => {
      const b = el('button', 'opt',
        '<span class="key">' + LETTERS[i] + '</span><span>' + text + '</span>');
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        if (b.disabled) return;
        if (multi){
          if (chosen.has(i)) chosen.delete(i);
          else if (chosen.size < need) chosen.add(i);
          b.setAttribute('aria-pressed', String(chosen.has(i)));
          submit.disabled = chosen.size !== need;
        } else {
          chosen.clear(); chosen.add(i);
          btns.forEach(x => x.setAttribute('aria-pressed', 'false'));
          b.setAttribute('aria-pressed', 'true');
          submit.disabled = false;
        }
      });
      wrap.appendChild(b);
      return b;
    });
    body.appendChild(wrap);

    if (multi){
      body.appendChild(el('p', 'note', 'Choose ' + need + '.'));
    }

    const acts = el('div', 'qz-acts');
    const submit = el('button', null, 'Check answer');
    submit.type = 'button';
    submit.disabled = true;
    acts.appendChild(submit);
    body.appendChild(acts);

    submit.addEventListener('click', () => {
      const picked = [...chosen].sort();
      const ok = multi
        ? picked.length === answer.length && picked.every((v, k) => v === answer[k])
        : picked[0] === answer;
      const correctSet = new Set(multi ? answer : [answer]);

      btns.forEach((b, i) => {
        b.disabled = true;
        if (correctSet.has(i)) b.classList.add('correct');
        else if (chosen.has(i)) b.classList.add('wrong');
      });
      submit.remove();
      const marks = qMarks(q);
      const fb = feedback(body, ok, ok ? marks : 0, marks, q.explain);

      if (!ok){
        // name the option(s) they picked, and the one(s) they should have
        const pickedLabel = picked.map(i => LETTERS[i] + ' — ' + q.options[i]).join('; ');
        const rightLabel = (multi ? answer : [answer])
          .map(i => LETTERS[i] + ' — ' + q.options[i]).join('; ');
        let why = q.whyWrong && !multi ? q.whyWrong[String(picked[0])] : null;
        if (!why) why = 'You chose ' + pickedLabel + '.';
        derivation(fb, q, { whyWrong: why, answerLine: rightLabel });
      }
      bump(ok ? marks : 0, marks);
    });
  }

  // ---- sort into bins -------------------------------------------
  function buildSort(q, body){
    const pool = el('div', 'eqbank');
    const bins = el('div', 'bins');
    const binEls = q.bins.map((name, bi) => {
      const b = el('div', 'bin', '<h6>' + name + '</h6>');
      b.dataset.bin = bi;
      bins.appendChild(b);
      return b;
    });

    let idx = 0;
    const placed = [];           // {item, bin}
    const items = q.items.slice();

    const prompt = el('p', 'note', '');
    body.appendChild(prompt);
    body.appendChild(bins);

    const acts = el('div', 'qz-acts');
    const btnRow = el('div', 'picker');
    acts.appendChild(btnRow);
    body.appendChild(acts);

    function showNext(){
      btnRow.innerHTML = '';
      if (idx >= items.length){
        prompt.textContent = 'All sorted — checking…';
        grade();
        return;
      }
      prompt.innerHTML = '<strong>' + items[idx].text + '</strong>';
      q.bins.forEach((name, bi) => {
        const b = el('button', null, name);
        b.type = 'button';
        b.addEventListener('click', () => {
          placed.push({ item: items[idx], bin: bi });
          const chip = el('span', 'chip', items[idx].text);
          binEls[bi].appendChild(chip);
          idx++;
          showNext();
        });
        btnRow.appendChild(b);
      });
    }

    function grade(){
      let got = 0;
      placed.forEach((p, k) => {
        const chip = binEls[p.bin].querySelectorAll('.chip')[
          [...binEls[p.bin].querySelectorAll('.chip')].findIndex(c => c.textContent === p.item.text)
        ];
        const right = p.bin === p.item.bin;
        if (right) got++;
        if (chip) chip.classList.add(right ? 'correct' : 'wrong');
      });
      prompt.textContent = '';
      btnRow.remove();
      const marks = items.length;
      const fb = feedback(body, got === marks, got, marks, null);
      const missed = placed.filter(p => p.bin !== p.item.bin);
      if (missed.length){
        fb.appendChild(el('p', null,
          '<strong>You put ' + missed.length + ' in the wrong place. Here’s why:</strong>'));
      }
      placed.forEach(p => {
        if (p.bin !== p.item.bin && p.item.why){
          fb.appendChild(el('p', null,
            '<strong>' + p.item.text + '</strong> — should be <em>' +
            q.bins[p.item.bin] + '</em>. ' + p.item.why));
        }
      });
      if (missed.length) derivation(fb, q, {});
      bump(got, marks);
    }

    showNext();
  }

  // ---- word equation builder ------------------------------------
  function buildWordEq(q, body){
    const R = q.reactants, P = q.products;
    const slots = [];
    const wrap = el('div', 'eqbuild');
    const line = el('div', 'eqslots');

    function addSlot(side, i){
      const s = el('button', 'eqslot', '?');
      s.type = 'button';
      s.dataset.side = side;
      s.dataset.i = i;
      s.addEventListener('click', () => {
        if (s.disabled || !s.dataset.val) return;
        const t = bankTiles.find(t => t.dataset.val === s.dataset.val);
        if (t) t.classList.remove('used');
        s.dataset.val = '';
        s.textContent = '?';
        s.classList.remove('filled');
        refresh();
      });
      slots.push(s);
      line.appendChild(s);
    }

    R.forEach((_, i) => {
      if (i) line.appendChild(el('span', 'eqop', '+'));
      addSlot('r', i);
    });
    line.appendChild(el('span', 'eqop', '→'));
    P.forEach((_, i) => {
      if (i) line.appendChild(el('span', 'eqop', '+'));
      addSlot('p', i);
    });
    wrap.appendChild(line);

    const bank = el('div', 'eqbank');
    const allTerms = shuffle(R.concat(P).concat(q.bank || []));
    const bankTiles = allTerms.map(term => {
      const t = el('button', 'eqtile', term);
      t.type = 'button';
      t.dataset.val = term;
      t.addEventListener('click', () => {
        if (t.classList.contains('used')) return;
        const free = slots.find(s => !s.dataset.val);
        if (!free) return;
        free.dataset.val = term;
        free.textContent = term;
        free.classList.add('filled');
        t.classList.add('used');
        refresh();
      });
      bank.appendChild(t);
      return t;
    });
    wrap.appendChild(bank);
    body.appendChild(wrap);

    const acts = el('div', 'qz-acts');
    const submit = el('button', null, 'Check equation');
    submit.type = 'button';
    submit.disabled = true;
    acts.appendChild(submit);
    body.appendChild(acts);

    function refresh(){
      submit.disabled = slots.some(s => !s.dataset.val);
    }

    submit.addEventListener('click', () => {
      // order within each side doesn't matter
      const gotR = slots.filter(s => s.dataset.side === 'r').map(s => s.dataset.val);
      const gotP = slots.filter(s => s.dataset.side === 'p').map(s => s.dataset.val);
      const okR = sameSet(gotR, R), okP = sameSet(gotP, P);
      const ok = okR && okP;

      slots.forEach(s => {
        s.disabled = true;
        const target = s.dataset.side === 'r' ? R : P;
        s.classList.add(target.indexOf(s.dataset.val) !== -1 ? 'correct' : 'wrong');
      });
      bankTiles.forEach(t => t.disabled = true);
      submit.remove();

      const marks = qMarks(q);
      const fb = feedback(body, ok, ok ? marks : 0, marks, q.explain);
      if (!ok){
        let why;
        if (!okR && !okP) why = 'Both sides of your equation are wrong.';
        else if (!okR) why = 'Your products are right, but the reactants are not — check what you started with.';
        else why = 'Your reactants are right, but the products are not — check what the reaction actually makes.';
        derivation(fb, q, {
          whyWrong: why,
          answerLine: R.join(' + ') + ' → ' + P.join(' + ')
        });
      }
      bump(ok ? marks : 0, marks);
    });
  }

  function sameSet(a, b){
    if (a.length !== b.length) return false;
    const x = a.slice().sort(), y = b.slice().sort();
    return x.every((v, i) => v === y[i]);
  }
  function shuffle(arr){
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---- structured (self-marked against model answer) ------------
  function buildStructured(q, body){
    const partEls = [];
    q.parts.forEach((part, pi) => {
      const pw = el('div', null);
      pw.style.marginBottom = '16px';
      pw.appendChild(el('p', null,
        '<strong>(' + 'abcdefg'[pi] + ')</strong> ' + part.stem +
        ' <span class="qz-marks">[' + (part.marks || 1) + ']</span>'));
      const ta = el('textarea');
      ta.rows = part.rows || 2;
      ta.placeholder = 'Write your answer here, then check it against the model answer.';
      ta.style.cssText = 'width:100%;font-family:inherit;font-size:14px;padding:9px 11px;' +
        'border:1.5px solid var(--rule);background:#FFF;color:var(--ink);resize:vertical';
      pw.appendChild(ta);
      body.appendChild(pw);
      partEls.push({ part, pw });
    });

    const acts = el('div', 'qz-acts');
    const reveal = el('button', null, 'Show model answer');
    reveal.type = 'button';
    acts.appendChild(reveal);
    body.appendChild(acts);

    reveal.addEventListener('click', () => {
      reveal.remove();
      const boxes = [];
      partEls.forEach(({ part, pw }, pi) => {
        const m = el('details', 'model');
        m.open = true;
        m.appendChild(el('summary', null,
          'Model answer · part (' + 'abcdefg'[pi] + ')'));
        const mb = el('div', 'mbody');
        (part.model || []).forEach((pt, k) => {
          const line = el('label', null);
          line.style.cssText = 'display:flex;gap:9px;align-items:flex-start;margin-bottom:9px;cursor:pointer;font-size:14px';
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.style.cssText = 'margin-top:3px;width:18px;height:18px;flex-shrink:0;accent-color:var(--charge)';
          cb.dataset.marks = String(part.markPer || 1);
          line.appendChild(cb);
          line.appendChild(el('span', null, pt));
          mb.appendChild(line);
          boxes.push(cb);
        });
        if (part.note) mb.appendChild(el('p', 'note', part.note));
        m.appendChild(mb);
        pw.appendChild(m);
      });

      const tick = el('p', 'note', 'Tick each point you actually had, then record your score.');
      body.appendChild(tick);

      const acts2 = el('div', 'qz-acts');
      const record = el('button', null, 'Record my score');
      record.type = 'button';
      acts2.appendChild(record);
      body.appendChild(acts2);

      record.addEventListener('click', () => {
        let got = 0;
        boxes.forEach(cb => { if (cb.checked) got += Number(cb.dataset.marks); cb.disabled = true; });
        const marks = qMarks(q);
        got = Math.min(got, marks);
        record.remove(); tick.remove();
        feedback(body, got === marks, got, marks, q.explain);
        bump(got, marks);
      });
    });
  }

  // ---- render ----------------------------------------------------
  function render(){
    root.innerHTML = '';
    state.earned = 0; state.possible = 0; state.done = 0;

    QS.forEach((q, qi) => {
      const card = el('article', 'qz');
      if (q.tier) card.dataset.tier = q.tier;

      const head = el('div', 'qz-head');
      head.appendChild(el('span', 'qz-num', 'Q' + (qi + 1)));
      if (q.tag) head.appendChild(el('span', 'tier' + (q.tier ? ' ' + q.tier : ''), q.tag));
      head.appendChild(el('span', 'qz-marks', '[' + qMarks(q) + ']'));
      card.appendChild(head);

      const stem = el('div', 'qz-stem', q.stem);
      card.appendChild(stem);

      const body = el('div', 'qz-body');
      card.appendChild(body);
      root.appendChild(card);

      if (q.type === 'mcq') buildChoice(q, body, false);
      else if (q.type === 'multi') buildChoice(q, body, true);
      else if (q.type === 'sort') buildSort(q, body);
      else if (q.type === 'wordeq') buildWordEq(q, body);
      else if (q.type === 'structured') buildStructured(q, body);
    });

    paintScore();
  }

  const resetBtn = bar && bar.querySelector('.qz-reset');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  render();
})();
