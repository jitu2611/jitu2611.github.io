(() => {
  const panel = document.querySelector('.universe-console');
  const canvas = document.querySelector('#neural-space');
  const ctx = canvas.getContext('2d');
  const modes = {
    neural: ['01 / NEURAL NETWORK', 'Everything is connected.', 'Individual signals. Shared intelligence. A visual study of the connections that make complex systems possible.', [216,250,115]],
    orbit: ['02 / ORBITAL SYSTEM', 'Ideas have their own gravity.', 'A small universe in constant motion. Independent paths, held together by a shared center of possibility.', [183,163,245]],
    signal: ['03 / SIGNAL PROCESSING', 'Find meaning in the noise.', 'Waves become patterns. Patterns become understanding. Explore a visual rhythm inspired by signal processing.', [124,229,224]]
  };
  let mode = 'neural', width = 0, height = 0, frame = 0, time = 0, previous = 0, visible = false;
  const pointer = { x: -1000, y: -1000 };
  const points = Array.from({length:64}, (_, i) => ({ x: Math.random(), y: Math.random(), phase: i * 2.39996, speed: .3 + Math.random() * .7 }));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const paused = () => reduced.matches || document.documentElement.classList.contains('motion-off');
  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const color = modes[mode][3].join(',');
    const positions = points.map((p, i) => {
      if (mode === 'orbit') {
        const angle = p.phase + time * .2 * p.speed;
        const radius = 75 + i * 3;
        return {x: width * .61 + Math.cos(angle) * radius, y: height * .42 + Math.sin(angle) * radius * .55};
      }
      if (mode === 'signal') return {x: i / 63 * width, y: height * .4 + Math.sin(i * .22 + time * 1.2) * 65 + Math.sin(i * .7 - time) * 20};
      return { x: (p.x * width + Math.sin(time * .15 + p.phase) * 25 + width) % width, y: (p.y * height + Math.cos(time * .12 + p.phase) * 20 + height) % height };
    });
    positions.forEach((p, i) => {
      for (let j = i + 1; j < positions.length; j++) {
        const q = positions[j], distance = Math.hypot(p.x - q.x, p.y - q.y);
        if (distance < 105) {
          ctx.strokeStyle = `rgba(${color},${(1-distance/105)*.23})`;
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
        }
      }
      const distance = Math.hypot(p.x-pointer.x,p.y-pointer.y);
      if (distance < 160) {
        ctx.strokeStyle = `rgba(${color},${(1-distance/160)*.6})`;
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(pointer.x,pointer.y); ctx.stroke();
      }
      ctx.fillStyle = `rgba(${color},${distance < 160 ? .95 : .5})`;
      ctx.beginPath(); ctx.arc(p.x,p.y,i % 5 === 0 ? 2 : 1,0,Math.PI*2); ctx.fill();
    });
  }
  function animate(stamp) {
    frame = 0;
    if (!visible || document.hidden || paused()) { previous = 0; return; }
    if (previous) time += Math.min((stamp - previous) / 1000, .05);
    previous = stamp; draw(); frame = requestAnimationFrame(animate);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; previous = 0; draw();
    if (visible && !document.hidden && !paused()) frame = requestAnimationFrame(animate);
  }
  new ResizeObserver(() => {
    width = panel.clientWidth; height = panel.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    if (ctx) ctx.setTransform(ratio,0,0,ratio,0,0);
    draw();
  }).observe(panel);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(panel);
  new MutationObserver(sync).observe(document.documentElement, {attributes:true, attributeFilter:['class']});
  reduced.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  panel.addEventListener('pointermove', event => {
    if (paused()) return;
    const rect = panel.getBoundingClientRect(); pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top;
  });
  panel.addEventListener('pointerleave', () => {pointer.x = pointer.y = -1000;});
  panel.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.mode; panel.dataset.mode = mode;
    panel.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    panel.querySelector('.readout-label').textContent = modes[mode][0];
    document.querySelector('#mode-title').textContent = modes[mode][1];
    document.querySelector('#mode-description').textContent = modes[mode][2];
    draw();
  }));
})();
