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
  const tunnelCanvas = document.querySelector('.tunnel-canvas');

  if (hero && tunnelCanvas) {
    const context = tunnelCanvas.getContext('2d', { alpha: false });
    let width = 1;
    let height = 1;
    let ratio = 1;
    let frame = 0;
    let running = true;

    const resizeTunnel = () => {
      const rect = tunnelCanvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      ratio = Math.min(window.devicePixelRatio || 1, 2.25);
      tunnelCanvas.width = Math.round(width * ratio);
      tunnelCanvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const tunnelPoint = (depth, angle, now) => {
      const travel = Math.pow(Math.max(depth, 0), 1.47);
      const bendX = Math.sin(now * 0.00016) * width * 0.012 * travel;
      const bendY = Math.cos(now * 0.00013) * height * 0.011 * travel;
      const centerX = width * 0.69 - width * 0.075 * travel + bendX;
      const centerY = height * 0.68 - height * 0.055 * travel + bendY;
      const ripple = 1 + Math.sin(angle * 3 + depth * 5.2 + now * 0.00048) * 0.055;
      const radiusX = width * 0.76 * travel * ripple;
      const radiusY = height * 0.72 * travel * (1 + Math.cos(angle * 2 - now * 0.00036) * 0.045);
      return {
        x: centerX + Math.cos(angle) * radiusX,
        y: centerY + Math.sin(angle) * radiusY
      };
    };

    const addRingPath = (depth, now) => {
      const segments = 64;
      for (let step = 0; step <= segments; step += 1) {
        const angle = (step / segments) * Math.PI * 2;
        const point = tunnelPoint(depth, angle, now);
        if (step === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      }
      context.closePath();
    };

    const drawTunnel = now => {
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const vanishingX = width * 0.69;
      const vanishingY = height * 0.68;
      const background = context.createRadialGradient(vanishingX, vanishingY, 1, vanishingX, vanishingY, Math.max(width, height));
      background.addColorStop(0, '#000006');
      background.addColorStop(0.16, '#09071a');
      background.addColorStop(0.48, '#060815');
      background.addColorStop(1, '#020307');
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);

      const glow = context.createRadialGradient(vanishingX, vanishingY, 0, vanishingX, vanishingY, Math.min(width, height) * 0.26);
      glow.addColorStop(0, 'rgba(139,105,255,.15)');
      glow.addColorStop(0.34, 'rgba(62,103,255,.07)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      context.lineJoin = 'round';
      context.lineCap = 'round';

      const rays = 26;
      for (let ray = 0; ray < rays; ray += 1) {
        const angle = (ray / rays) * Math.PI * 2;
        context.beginPath();
        for (let step = 0; step <= 46; step += 1) {
          const depth = 0.018 + (step / 46) * 1.18;
          const point = tunnelPoint(depth, angle, now);
          if (step === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        }
        const accent = ray % 7 === 0;
        context.strokeStyle = accent ? 'rgba(126,119,255,.34)' : 'rgba(236,239,255,.22)';
        context.lineWidth = accent ? 1.05 : 0.72;
        context.stroke();
      }

      const ringCount = 25;
      const progress = reduced ? 0.22 : (now * 0.000075) % 1;
      for (let ring = 0; ring < ringCount; ring += 1) {
        const normalized = ((ring / ringCount) + progress) % 1;
        const depth = 0.025 + normalized * 1.17;
        context.beginPath();
        addRingPath(depth, now);
        const opacity = 0.09 + normalized * 0.36;
        if (ring % 8 === 0) context.strokeStyle = `rgba(155,119,255,${Math.min(0.5, opacity + 0.1)})`;
        else if (ring % 11 === 0) context.strokeStyle = `rgba(71,157,255,${Math.min(0.48, opacity + 0.08)})`;
        else context.strokeStyle = `rgba(242,244,255,${opacity})`;
        context.lineWidth = 0.55 + normalized * 0.9;
        context.stroke();
      }

      context.beginPath();
      context.arc(vanishingX, vanishingY, Math.max(2, width * 0.003), 0, Math.PI * 2);
      context.fillStyle = 'rgba(205,193,255,.75)';
      context.shadowBlur = 13;
      context.shadowColor = '#8f70ff';
      context.fill();
      context.shadowBlur = 0;

      if (!reduced && running) frame = window.requestAnimationFrame(drawTunnel);
    };

    resizeTunnel();
    drawTunnel(0);
    window.addEventListener('resize', () => {
      resizeTunnel();
      if (reduced) drawTunnel(0);
    });
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running && !reduced) {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(drawTunnel);
      }
    });
  }

  const objectLayers = document.querySelectorAll('.object-layer');
  if (hero && objectLayers.length && !reduced) {
    let layerTargetX = 0;
    let layerTargetY = 0;
    let layerCurrentX = 0;
    let layerCurrentY = 0;
    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      layerTargetX = ((event.clientX - rect.left) / rect.width - 0.5) * -9;
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
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }
})();
