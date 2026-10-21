/*
  NASTYA BIRTHDAY ISSUE №26
  Настройка главного видео:
  1. Положите видео в assets/videos/main-greeting.mp4
  2. Замените пустую строку ниже на "assets/videos/main-greeting.mp4".
  При загрузке из браузера видео показывается лишь временно — для постоянной публикации пользуйтесь пунктами выше.
*/
const MAIN_GREETING_PATH = '';

(function () {
  'use strict';

  /* Живая фотоплёнка: наведение с компьютера / активный кадр с телефона. */
  const filmTrack = document.getElementById('filmTrack');
  const filmRail = document.querySelector('.film-rail');
  const cells = Array.from(filmTrack.querySelectorAll('.film-cell'));
  const videos = cells.map((cell) => cell.querySelector('video'));
  const counter = document.getElementById('filmIndex');
  const progress = document.getElementById('filmProgress');
  const prev = document.getElementById('filmPrev');
  const next = document.getElementById('filmNext');
  const sound = document.getElementById('filmSound');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeFilm = 0;
  let hoveredFilm = null;
  let filmVisible = false;
  let soundOn = false;
  let scrollTimer = 0;

  function switchPlayback() {
    const playingIndex = hoveredFilm === null ? activeFilm : hoveredFilm;
    videos.forEach((video, i) => {
      const shouldPlay = filmVisible && !reducedMotion.matches && i === playingIndex;
      video.muted = !soundOn;
      if (shouldPlay) {
        const playAttempt = video.play();
        if (playAttempt && typeof playAttempt.then === 'function') {
          playAttempt.then(() => cells[i].classList.add('is-playing')).catch(() => cells[i].classList.remove('is-playing'));
        }
      } else {
        video.pause();
        cells[i].classList.remove('is-playing');
        if (video.currentTime > 0 && hoveredFilm !== i) {
          try { video.currentTime = 0; } catch (_) { /* media not loaded yet */ }
        }
      }
    });
  }

  function updateIndex(i) {
    activeFilm = Math.max(0, Math.min(cells.length - 1, i));
    counter.textContent = String(activeFilm + 1).padStart(2, '0');
    progress.style.width = `${((activeFilm + 1) / cells.length) * 100}%`;
    prev.disabled = activeFilm === 0;
    next.disabled = activeFilm === cells.length - 1;
    prev.style.opacity = prev.disabled ? '.45' : '1';
    next.style.opacity = next.disabled ? '.45' : '1';
    switchPlayback();
  }

  function goToFilm(i) {
    const nextIndex = Math.max(0, Math.min(cells.length - 1, i));
    const offset = cells[nextIndex].offsetLeft - cells[0].offsetLeft;
    filmTrack.scrollTo({ left: offset, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    updateIndex(nextIndex);
  }

  prev.addEventListener('click', () => goToFilm(activeFilm - 1));
  next.addEventListener('click', () => goToFilm(activeFilm + 1));
  filmTrack.addEventListener('scroll', () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      const x = filmTrack.scrollLeft;
      const closest = cells.reduce((best, cell, i) => {
        const off = cell.offsetLeft - cells[0].offsetLeft;
        return Math.abs(off - x) < Math.abs(cells[best].offsetLeft - cells[0].offsetLeft - x) ? i : best;
      }, 0);
      updateIndex(closest);
    }, 110);
  }, { passive: true });

  cells.forEach((cell, i) => {
    cell.addEventListener('pointerenter', (ev) => {
      if (ev.pointerType === 'mouse') { hoveredFilm = i; switchPlayback(); }
    });
    cell.addEventListener('pointerleave', () => { hoveredFilm = null; switchPlayback(); });
    cell.addEventListener('click', () => {
      if (!filmVisible) return;
      updateIndex(i);
      if (window.matchMedia('(pointer: coarse)').matches) goToFilm(i);
    });
  });
  sound.addEventListener('click', () => {
    soundOn = !soundOn;
    sound.setAttribute('aria-pressed', String(soundOn));
    sound.textContent = soundOn ? '♪ Выключить звук' : '♪ Включить звук';
    switchPlayback();
  });
  if ('IntersectionObserver' in window) {
    const filmObserver = new IntersectionObserver((entries) => {
      filmVisible = entries[0].isIntersecting;
      switchPlayback();
    }, { threshold: .2 });
    filmObserver.observe(filmRail);
  } else {
    filmVisible = true;
  }
  reducedMotion.addEventListener?.('change', switchPlayback);
  updateIndex(0);

  /* Видеопослание: намеренно оставлено место для финального ролика. */
  const greetingInput = document.getElementById('greetingInput');
  const greetingVideo = document.getElementById('greetingVideo');
  const greetingEmpty = document.getElementById('greetingEmpty');
  const greetingMessage = document.getElementById('uploadMessage');
  let greetingObjectUrl = null;

  function showGreeting(src, isPreview) {
    greetingVideo.pause();
    greetingVideo.src = src;
    greetingVideo.hidden = false;
    greetingEmpty.hidden = true;
    greetingEmpty.style.display = 'none';
    greetingVideo.load();
    if (greetingMessage) greetingMessage.textContent = isPreview
      ? 'Это только предпросмотр на твоём устройстве. Чтобы видео появлялось у всех, скопируй его в папку сайта и укажи путь в js/main.js (см. README).'
      : 'Главное поздравление от друзей. Приятного просмотра.';
  }
  document.getElementById('chooseGreeting').addEventListener('click', () => greetingInput.click());
  greetingInput.addEventListener('change', () => {
    const file = greetingInput.files && greetingInput.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      if (greetingMessage) greetingMessage.textContent = 'Пожалуйста, выбери видеофайл (лучше MP4).';
      return;
    }
    if (greetingObjectUrl) URL.revokeObjectURL(greetingObjectUrl);
    greetingObjectUrl = URL.createObjectURL(file);
    showGreeting(greetingObjectUrl, true);
  });
  if (MAIN_GREETING_PATH) showGreeting(MAIN_GREETING_PATH, false);

  /* Цельные редакционные образы из единой иллюстрации: без несовместимых накладок. */
  const lookButtons = [...document.querySelectorAll('[data-look]')];
  const garmentLayer = document.getElementById('garmentLayer');
  const dollCanvas = document.getElementById('dollCanvas');
  const lookResult = document.getElementById('lookResult');
  const lookCounter = document.querySelector('.dresser-panel-title small');
  const lookPlace = document.getElementById('lookPlace');
  const lookDescription = document.getElementById('lookDescription');
  const looks = ['home', 'party', 'rock'];
  const lookData = {
    home: {
      name: 'Домашняя богиня',
      place: 'дома: уютно, спокойно и красиво',
      description: 'Для уютного дня дома: мягкий худи, удобные брюки и настроение без спешки.',
      verdict: 'Вердикт: идеальна для домашнего праздника, кино и десертов.'
    },
    party: {
      name: 'Королева вечеринки',
      place: 'ресторан: красивый выход и много комплиментов',
      description: 'Для праздничного ужина: летящее платье, светлое пальто и собранный элегантный образ.',
      verdict: 'Вердикт: тот самый образ для ресторана и главных тостов вечера.'
    },
    rock: {
      name: 'Поп-звезда 2000-х',
      place: 'клуб: блеск, музыка и эффектное появление',
      description: 'Для яркой ночи: сияющий топ, тёмные брюки и настроение настоящей поп-звезды 2000-х.',
      verdict: 'Вердикт: готова забирать внимание в клубе и на каждом фото.'
    }
  };
  let currentLook = 'party';
  looks.forEach(name => { const img = new Image(); img.src = `assets/graphics/paper-doll/editorial-${name}.png`; });
  function setLook(name) {
    if (!looks.includes(name)) return;
    currentLook = name;
    const info = lookData[name];
    lookButtons.forEach(btn => {const selected=btn.dataset.look===name;btn.classList.toggle('selected',selected);btn.setAttribute('aria-pressed',String(selected));});
    garmentLayer.src=`assets/graphics/paper-doll/editorial-${name}.png`;
    garmentLayer.alt=info.name;
    dollCanvas.setAttribute('aria-label',`Настя, образ «${info.name}»`);
    if(lookCounter) lookCounter.textContent=`${String(looks.indexOf(name)+1).padStart(2,'0')} / 03`;
    if(lookPlace) lookPlace.textContent = info.place;
    if(lookDescription) lookDescription.textContent = info.description;
    lookResult.textContent = info.verdict;
  }
  lookButtons.forEach(btn=>btn.addEventListener('click',()=>setLook(btn.dataset.look)));
  document.getElementById('randomLook').addEventListener('click',()=>{
    const options=looks.filter(name=>name!==currentLook);
    setLook(options[Math.floor(Math.random()*options.length)]);
  });
  setLook(currentLook);

  /* Задуй свечи: праздничный финал и мини-салют. */
  const blowButton = document.getElementById('blowCandles');
  const cake = document.getElementById('cakeScene');
  const wishReveal = document.getElementById('wishReveal');
  const confettiLayer = document.getElementById('confettiLayer');
  let blown = false;

  function showerConfetti() {
    if (reducedMotion.matches) return;
    const colors = ['#ac2b45', '#e9b66f', '#f9e8cf', '#823246', '#d37983', '#32201e'];
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 90; i++) {
      const dot = document.createElement('i');
      dot.className = 'confetti';
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.width = `${Math.random() * 8 + 5}px`;
      dot.style.height = `${Math.random() * 14 + 7}px`;
      dot.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      dot.style.borderRadius = Math.random() > .6 ? '50%' : '1px';
      dot.style.animationDelay = `${Math.random() * .9}s`;
      dot.style.setProperty('--duration', `${Math.random() * 2 + 2.1}s`);
      dot.style.setProperty('--drift', `${Math.random() * 330 - 165}px`);
      fragment.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove(), { once: true });
    }
    confettiLayer.appendChild(fragment);
  }
  blowButton.addEventListener('click', () => {
    blown = !blown;
    cake.classList.toggle('blown', blown);
    wishReveal.classList.toggle('visible', blown);
    blowButton.innerHTML = blown ? 'Зажечь свечи снова <span>↺</span>' : 'Задуть свечи <span>✧</span>';
    if (blown) showerConfetti();
  });
})();
