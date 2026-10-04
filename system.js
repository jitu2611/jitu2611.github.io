(() => {
  const system = document.querySelector('.system');
  if (!system) return;
  const nodes = [...system.querySelectorAll('.system-node')];
  const detail = system.querySelector('#system-detail');
  const defaultDetail = detail.textContent;
  let selected = null;
  const showDetail = node => { detail.textContent = node.dataset.detail; };
  const restoreDetail = () => {
    const focused = nodes.find(node => node === document.activeElement);
    detail.textContent = (focused || selected)?.dataset.detail || defaultDetail;
  };
  nodes.forEach(node => {
    node.addEventListener('pointerenter', () => showDetail(node));
    node.addEventListener('pointerleave', restoreDetail);
    node.addEventListener('focus', () => showDetail(node));
    node.addEventListener('blur', restoreDetail);
    node.addEventListener('click', () => { selected = node; showDetail(node); });
  });

  // Keep the diagram and its interactions usable if the animation library fails.
  if (typeof window.anime !== 'function') return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const route = system.querySelector('.system-route');
  const packet = system.querySelector('.system-packet');
  const toggle = system.querySelector('.system-toggle');
  const length = route.getTotalLength();
  const progress = { distance: 0 };
  let visible = false;
  let userPaused = false;
  let introduced = false;
  const clearActive = () => nodes.forEach(node => node.classList.remove('is-active'));
  const flow = anime({
    targets: progress,
    distance: length,
    duration: 4800,
    delay: 700,
    endDelay: 1600,
    easing: 'linear',
    loop: true,
    autoplay: false,
    update: () => {
      const point = route.getPointAtLength(progress.distance);
      packet.setAttribute('cx', point.x);
      packet.setAttribute('cy', point.y);
      packet.style.opacity = progress.distance > 0 && progress.distance < length ? '1' : '0';
      const stops = [0, 220, 345, 470, length];
      nodes.forEach((node, i) => node.classList.toggle('is-active', Math.abs(progress.distance - stops[i]) < 35));
    }
  });
  const intro = anime({
    targets: route,
    strokeDashoffset: [length, 0],
    duration: 1500,
    easing: 'easeInOutSine',
    autoplay: false,
    complete: () => { introduced = true; sync(); }
  });
  function sync() {
    const running = visible && !document.hidden && !reduced.matches && !userPaused;
    toggle.hidden = reduced.matches;
    toggle.textContent = userPaused ? 'Resume animation' : 'Pause animation';
    if (reduced.matches) {
      intro.pause();
      flow.pause();
      route.style.strokeDasharray = 'none';
      route.style.strokeDashoffset = '0';
      packet.style.opacity = '0';
      clearActive();
      introduced = true;
      return;
    }
    if (!running) { intro.pause(); flow.pause(); return; }
    if (introduced) flow.play();
    else { route.style.strokeDasharray = String(length); intro.play(); }
  }
  toggle.addEventListener('click', () => { userPaused = !userPaused; sync(); });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.15 });
    observer.observe(system);
  } else { visible = true; }
  sync();
})();
