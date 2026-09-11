const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('.motion-toggle');
function setMotion(paused) {
  document.documentElement.classList.toggle('motion-off', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.textContent = paused ? 'Resume motion' : 'Pause motion';
}
setMotion(motionQuery.matches);
motionQuery.addEventListener('change', event => setMotion(event.matches));
motionButton.addEventListener('click', () => setMotion(!document.documentElement.classList.contains('motion-off')));
const progress = document.querySelector('.scroll-progress');
let pending = false;
function updateProgress() {
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? scrollY / distance : 0})`;
  pending = false;
}
addEventListener('scroll', () => {
  if (!pending) { pending = true; requestAnimationFrame(updateProgress); }
}, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();
document.querySelectorAll('.skill-icon').forEach((icon, index) => { icon.textContent = `0${index + 1}`; });
const hamburger = document.querySelector('#hamburger');
const navLinks = document.querySelector('#navLinks');
hamburger.setAttribute('aria-controls', 'navLinks');
hamburger.setAttribute('aria-expanded', 'false');
new MutationObserver(() => hamburger.setAttribute('aria-expanded', String(navLinks.classList.contains('open')))).observe(navLinks, { attributes: true, attributeFilter: ['class'] });
addEventListener('keydown', event => {
  if (event.key === 'Escape' && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    hamburger.focus();
  }
});
