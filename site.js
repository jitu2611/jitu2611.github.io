const projects = [...document.querySelectorAll('.project')];
projects.forEach(project => {
  const accent = project.dataset.accent || '#516b3a';
  project.style.setProperty('--project-accent', accent);
  project.addEventListener('pointerenter', () => window.dispatchEvent(new CustomEvent('orb-accent', { detail: accent })));
  project.addEventListener('pointerleave', () => window.dispatchEvent(new CustomEvent('orb-accent', { detail: '#516b3a' })));
});

const revealTargets = document.querySelectorAll('.section-heading, .about-content, .facts, .experience-list > article, .project, .experiment-list > a, .question-list > p, .contact > *');
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
  revealTargets.forEach(element => element.classList.add('visible'));
} else {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px' });
  revealTargets.forEach(element => {
    element.classList.add('reveal');
    observer.observe(element);
  });
}

setTimeout(() => {
  if (!document.documentElement.dataset.orbReady) document.documentElement.classList.add('no-webgl');
}, 2500);
