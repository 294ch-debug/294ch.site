(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const logoLayer = document.querySelector(".bg-logo");
  const logoImage = logoLayer ? logoLayer.querySelector("img") : null;
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-menu-toggle]");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  let rafId = 0;
  let lastScrollY = window.scrollY;
  let smoothY = lastScrollY;

  function animate() {
    if (!logoImage || reduceMotion.matches) {
      return;
    }

    smoothY += (lastScrollY - smoothY) * 0.08;
    const shiftY = smoothY * -0.035;
    logoImage.style.transform = `translate3d(0, ${shiftY.toFixed(2)}px, 0)`;
    rafId = window.requestAnimationFrame(animate);
  }

  function onScroll() {
    lastScrollY = window.scrollY;
  }

  if (logoImage && !reduceMotion.matches) {
    window.addEventListener("scroll", onScroll, { passive: true });
    rafId = window.requestAnimationFrame(animate);
  }

  function startGlitchPulse() {
    if (!logoLayer || reduceMotion.matches) {
      return;
    }

    const delay = 4200 + Math.random() * 9000;
    window.setTimeout(() => {
      const pulses = 1 + Math.floor(Math.random() * 2);
      let count = 0;

      function pulse() {
        logoLayer.classList.add("glitching");
        window.setTimeout(() => logoLayer.classList.remove("glitching"), 95);
        count += 1;
        if (count < pulses) {
          window.setTimeout(pulse, 120);
        } else {
          startGlitchPulse();
        }
      }

      pulse();
    }, delay);
  }

  startGlitchPulse();

  reduceMotion.addEventListener("change", (event) => {
    if (event.matches) {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      if (logoImage) {
        logoImage.style.transform = "translate3d(0, 0, 0)";
      }
      return;
    }

    lastScrollY = window.scrollY;
    smoothY = lastScrollY;
    rafId = window.requestAnimationFrame(animate);
    startGlitchPulse();
  });

  // Expose page identifier for optional telemetry hooks.
  root.dataset.page = root.dataset.page || "unknown";
})();
