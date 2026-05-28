/* ============================================================
   LOADING SCREEN
   ============================================================ */
const loader = document.getElementById('loader');
let heartsStarted = false;

function hideLoader() {
  if (loader.classList.contains('hidden')) return;
  loader.classList.add('hidden');
  // Aguarda a transição de saída do loader (~400ms) antes de lançar o confete
  setTimeout(() => {
    launchConfetti();
    // Inicia os corações após o confete (0 s)
    setTimeout(startHearts, 0);
  }, 400);
}

window.addEventListener('load', hideLoader);

// Fallback: garante que o loader some mesmo se alguma imagem falhar
setTimeout(hideLoader, 8000);

/* ============================================================
   CORAÇÕES FLUTUANTES
   ============================================================ */
const heartsContainer = document.getElementById('hearts-container');
const HEART_CHARS = ['💛', '💜', '🩷', '💛', '💛', '💜'];

function createHeart() {
  const heart = document.createElement('span');
  heart.classList.add('heart');
  heart.textContent = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];

  const xPos  = Math.random() * 94;           // % horizontal
  const dur   = 3.5 + Math.random() * 4.5;   // segundos
  const size  = 13 + Math.random() * 14;      // px
  const delay = Math.random() * 1.5;          // segundos

  heart.style.left        = xPos + '%';
  heart.style.fontSize    = size + 'px';
  heart.style.setProperty('--dur', dur + 's');
  heart.style.animationDelay = delay + 's';

  heartsContainer.appendChild(heart);
  setTimeout(() => heart.remove(), (dur + delay) * 1000 + 200);
}

/* ============================================================
   CONFETE PÓS-LOADING
   ============================================================ */
function launchConfetti() {
  if (typeof confetti === 'undefined') { startHearts(); return; }

  const colors = ['#FFB6D9', '#C084FC', '#FDE047', '#F472B6', '#A855F7', '#ffffff'];

  // Explosão central
  confetti({ particleCount: 130, spread: 90, origin: { y: 0.55 }, colors, scalar: 1.2 });

  // Canhões laterais (300 ms depois)
  setTimeout(() => {
    confetti({ particleCount: 70, angle: 60,  spread: 60, origin: { x: 0,   y: 0.65 }, colors });
    confetti({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1,   y: 0.65 }, colors });
  }, 300);

  // Segundo burst para mais impacto (700 ms depois)
  setTimeout(() => {
    confetti({ particleCount: 90, spread: 110, origin: { y: 0.45 }, colors, scalar: 0.9 });
  }, 700);
}

// Inicia os corações (chamado após o confete)
function startHearts() {
  if (heartsStarted) return;
  heartsStarted = true;
  // Burst inicial
  for (let i = 0; i < 8; i++) {
    setTimeout(createHeart, i * 200);
  }
  // Fluxo contínuo
  setInterval(createHeart, 900);
}

/* ============================================================
   ESTRELAS DE FUNDO
   ============================================================ */
(function createStars() {
  const container = document.getElementById('stars-container');
  if (!container) return;

  const COLORS = ['#ffffff', '#FFE8F5', '#F3E8FF', '#FFF8E0'];
  const COUNT  = 60;

  for (let i = 0; i < COUNT; i++) {
    const star = document.createElement('span');
    star.classList.add('star');

    const size = 1.5 + Math.random() * 3;          // 1.5 – 4.5 px
    const dur  = 2 + Math.random() * 5;            // 2 – 7 s
    const del  = Math.random() * 9;                // 0 – 9 s delay
    const max  = 0.7 + Math.random() * 0.3;        // 0.7 – 1.0 opacidade máx

    star.style.left    = Math.random() * 96 + '%';
    star.style.top     = Math.random() * 96 + '%';
    star.style.width   = size + 'px';
    star.style.height  = size + 'px';
    star.style.boxShadow = `0 0 ${size * 3}px ${size * 1.5}px rgba(255,255,255,0.9)`;
    star.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
    star.style.setProperty('--tdur', dur + 's');
    star.style.setProperty('--tdel', del + 's');
    star.style.setProperty('--tmax', max);

    container.appendChild(star);
  }
}());

/* ============================================================
   SCROLL REVEAL (IntersectionObserver)
   ============================================================ */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ============================================================
   ENVIO DO FORMULÁRIO (Fetch API → Formspree)
   ============================================================ */
const form        = document.getElementById('rsvp-form');
const successMsg  = document.getElementById('form-success');

if (form) {
  const nomeInput = document.getElementById('nome');

  async function enviarFormulario(radio) {
    const box          = radio.closest('.fchoice').querySelector('.fchoice-box');
    const emojiEl      = box.querySelector('.fchoice-emoji');
    const textoEl      = box.querySelector('.fchoice-text');
    const origEmoji    = emojiEl.textContent;
    const origTexto    = textoEl.textContent;

    // Captura o FormData ANTES de desabilitar os campos
    const formData = new FormData(form);

    // Desabilita todas as opções durante envio
    form.querySelectorAll('input[name="presenca"]').forEach(r => r.disabled = true);
    emojiEl.textContent = '⏳';
    textoEl.textContent = 'Enviando...';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const vai = radio.value.startsWith('Sim');
        document.getElementById('fs-anim').textContent  = vai ? '🦄✨🎉' : '💜🥺💜';
        document.getElementById('fs-title').textContent = vai ? 'Recebido! Obrigada!' : 'Recebido! Que pena...';
        document.getElementById('fs-msg').textContent   = vai
          ? 'Mal podemos esperar para celebrar com você! 💜'
          : 'Sentiremos sua falta! Mandamos um beijo especial. 💜';
        form.classList.add('hidden');
        successMsg.classList.remove('hidden');
        for (let i = 0; i < 14; i++) setTimeout(createHeart, i * 120);
      } else {
        emojiEl.textContent = '⚠️';
        textoEl.textContent = 'Tente novamente';
        form.querySelectorAll('input[name="presenca"]').forEach(r => r.disabled = false);
        radio.checked = false;
        setTimeout(() => { emojiEl.textContent = origEmoji; textoEl.textContent = origTexto; }, 3500);
      }
    } catch (_) {
      emojiEl.textContent = '⚠️';
      textoEl.textContent = 'Sem conexão';
      form.querySelectorAll('input[name="presenca"]').forEach(r => r.disabled = false);
      radio.checked = false;
      setTimeout(() => { emojiEl.textContent = origEmoji; textoEl.textContent = origTexto; }, 3500);
    }
  }

  form.querySelectorAll('input[name="presenca"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (!nomeInput.value.trim()) {
        // Nome vazio — sacudir o input e desmarcar
        nomeInput.classList.add('shake');
        setTimeout(() => nomeInput.classList.remove('shake'), 600);
        radio.checked = false;
        return;
      }
      enviarFormulario(radio);
    });
  });
}

/* ============================================================
   BALÃO — Corações ao tocar
   ============================================================ */
const tapTarget = document.getElementById('tap-target');
if (tapTarget) {
  tapTarget.addEventListener('click', () => {
    for (let i = 0; i < 8; i++) {
      setTimeout(createHeart, i * 100);
    }
  });
}

/* ============================================================
   SEGREDO ADMIN
   Toque 5x no botão invisível no canto inferior direito
   para abrir o painel de confirmações.
   ============================================================ */
const secretBtn  = document.getElementById('secret-btn');
const adminModal = document.getElementById('admin-modal');
const amodalClose = document.getElementById('amodal-close');

let tapCount = 0;
let tapTimer = null;

if (secretBtn && adminModal) {
  secretBtn.addEventListener('click', () => {
    tapCount++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { tapCount = 0; }, 2200);

    if (tapCount >= 5) {
      tapCount = 0;
      adminModal.classList.remove('hidden');
    }
  });

  amodalClose.addEventListener('click', () => {
    adminModal.classList.add('hidden');
  });

  adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) adminModal.classList.add('hidden');
  });

  // Fechar com Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') adminModal.classList.add('hidden');
  });
}
