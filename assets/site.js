(() => {
  const button = document.querySelector('.menu-button');
  const nav = document.querySelector('.site-nav');
  if (button && nav) {
    button.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }));
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');
  const heroArt = document.querySelector('.hero-art');
  const heroCanvas = document.querySelector('.hero-canvas');
  if (hero && heroArt && heroCanvas && !reduced) {
    const context = heroCanvas.getContext('2d', { alpha: false });
    const buffer = document.createElement('canvas');
    const bufferContext = buffer.getContext('2d', { alpha: false });
    let width = 0;
    let height = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;

    const renderSource = () => {
      if (!heroArt.naturalWidth) return;
      const rect = heroCanvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      heroCanvas.width = Math.round(width * ratio);
      heroCanvas.height = Math.round(height * ratio);
      buffer.width = width;
      buffer.height = height;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const scale = Math.max(width / heroArt.naturalWidth, height / heroArt.naturalHeight) * 1.04;
      const drawWidth = heroArt.naturalWidth * scale;
      const drawHeight = heroArt.naturalHeight * scale;
      bufferContext.drawImage(heroArt, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
      hero.classList.add('canvas-ready');
    };

    const draw = now => {
      if (width && height) {
        pointerX += (targetX - pointerX) * 0.035;
        pointerY += (targetY - pointerY) * 0.035;
        context.fillStyle = '#08090d';
        context.fillRect(0, 0, width, height);
        const t = now * 0.00042;
        const band = 9;
        for (let y = 0; y < height; y += band) {
          const waveX = Math.sin(y * 0.018 + t * 3.1) * 7 + Math.sin(y * 0.006 - t * 1.7) * 5 + pointerX;
          const waveY = Math.sin(y * 0.012 - t * 2.3) * 2.5 + pointerY;
          context.drawImage(buffer, 0, y, width, band + 2, waveX - 10, y + waveY, width + 20, band + 2);
        }
      }
      window.requestAnimationFrame(draw);
    };

    if (heroArt.complete) renderSource();
    else heroArt.addEventListener('load', renderSource, { once: true });
    window.addEventListener('resize', renderSource);
    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * -10;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * -7;
    });
    hero.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
    });
    window.requestAnimationFrame(draw);
  }
  const objectLayers = document.querySelectorAll('.object-layer');
  if (hero && objectLayers.length && !reduced) {
    let layerTargetX = 0;
    let layerTargetY = 0;
    let layerCurrentX = 0;
    let layerCurrentY = 0;
    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      layerTargetX = (event.clientX / rect.width - 0.5) * -9;
      layerTargetY = ((event.clientY - rect.top) / rect.height - 0.5) * -7;
    });
    hero.addEventListener('pointerleave', () => {
      layerTargetX = 0;
      layerTargetY = 0;
    });
    const moveLayers = () => {
      layerCurrentX += (layerTargetX - layerCurrentX) * 0.05;
      layerCurrentY += (layerTargetY - layerCurrentY) * 0.05;
      objectLayers.forEach(layer => {
        const depth = Number(layer.dataset.depth || 1);
        layer.style.setProperty('--px', `${(layerCurrentX * depth).toFixed(2)}px`);
        layer.style.setProperty('--py', `${(layerCurrentY * depth).toFixed(2)}px`);
      });
      window.requestAnimationFrame(moveLayers);
    };
    window.requestAnimationFrame(moveLayers);
  }
  if (reduced) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
})();
