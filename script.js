/* ============================================================
   LOADING SCREEN
   ============================================================ */
const loader = document.getElementById('loader');

window.addEventListener('load', () => {
  loader.classList.add('hidden');
});

// Fallback: garante que o loader some mesmo se alguma imagem falhar
setTimeout(() => loader.classList.add('hidden'), 8000);

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

// Cria corações periodicamente
setInterval(createHeart, 900);

// Burst inicial ao carregar a página
for (let i = 0; i < 6; i++) {
  setTimeout(createHeart, i * 250);
}

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
