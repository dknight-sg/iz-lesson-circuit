(function(){
  const root = document.getElementById('quizWidget');
  if (!root) return;
  const dataEl = root.querySelector('script[type="application/json"]');
  const items = JSON.parse(dataEl.textContent);
  const labelA = root.dataset.btnA;
  const labelB = root.dataset.btnB;

  const $ = sel => root.querySelector(sel);
  const count = $('.quiz-count');
  const prompt = $('.quiz-prompt');
  const btnA = $('.quiz-btn-a');
  const btnB = $('.quiz-btn-b');
  const feedback = $('.quiz-feedback');
  const score = $('.quiz-score');
  const next = $('.quiz-next');
  const done = $('.quiz-done');
  const body = $('.quiz-body');

  btnA.textContent = labelA;
  btnB.textContent = labelB;

  function shuffle(arr){
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  let order = shuffle(items);
  let idx = 0, correct = 0, answered = false;

  function renderQuestion(){
    answered = false;
    const item = order[idx];
    count.textContent = 'Question ' + (idx + 1) + ' of ' + order.length;
    prompt.textContent = item.text;
    feedback.hidden = true;
    feedback.className = 'quiz-feedback';
    next.hidden = true;
    btnA.disabled = false;
    btnB.disabled = false;
    score.textContent = 'Score: ' + correct + '/' + idx;
  }

  function answer(choice){
    if (answered) return;
    answered = true;
    const item = order[idx];
    const isCorrect = choice === item.answer;
    if (isCorrect) correct++;
    btnA.disabled = true;
    btnB.disabled = true;
    feedback.hidden = false;
    feedback.classList.add(isCorrect ? 'correct' : 'wrong');
    feedback.textContent = (isCorrect ? 'Correct. ' : 'Not quite. ') + item.explain;
    score.textContent = 'Score: ' + correct + '/' + (idx + 1);
    next.hidden = false;
    next.textContent = (idx + 1 < order.length) ? 'Next →' : 'See your score →';
  }

  function advance(){
    idx++;
    if (idx >= order.length){
      body.hidden = true;
      done.hidden = false;
      done.querySelector('.big').textContent = correct + ' / ' + order.length;
    } else {
      renderQuestion();
    }
  }

  function restart(){
    order = shuffle(items);
    idx = 0; correct = 0;
    body.hidden = false;
    done.hidden = true;
    renderQuestion();
  }

  btnA.addEventListener('click', () => answer('a'));
  btnB.addEventListener('click', () => answer('b'));
  next.addEventListener('click', advance);
  done.querySelector('.quiz-retry').addEventListener('click', restart);

  renderQuestion();
})();
