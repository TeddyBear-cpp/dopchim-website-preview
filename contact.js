(() => {
  const widget = document.createElement('aside');
  widget.className = 'contact-widget';
  widget.setAttribute('aria-label', 'Quick contact');
  widget.innerHTML = '<button type="button" class="contact-toggle" aria-expanded="false" aria-controls="quick-contact"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z"/><path d="M7 10h8M7 14h5"/></svg><span>Contact Us</span><span class="contact-toggle-mark" aria-hidden="true">+</span></button><section id="quick-contact" class="quick-contact" aria-labelledby="quick-contact-heading" hidden><p class="eyebrow">YOUR MOMENT. OUR COMMITMENT.</p><h2 id="quick-contact-heading">Let’s Talk.</h2><p>Choose how you’d like to get in touch.</p><a class="quick-contact-primary" href="https://wa.me/260977992912" target="_blank" rel="noopener">Chat on WhatsApp <span aria-hidden="true">↗</span><small>+260 977 992 912</small></a><a href="tel:+260977992912">Call Our Team <span aria-hidden="true">↗</span></a><a href="https://web.facebook.com/DopchimEvents/" target="_blank" rel="noopener">Facebook <span aria-hidden="true">↗</span></a><a href="https://www.instagram.com/dopchim/" target="_blank" rel="noopener">Instagram <span aria-hidden="true">↗</span></a><a href="contact.html">All Contact Options <span aria-hidden="true">↗</span></a></section>';
  document.body.append(widget);
  const button = widget.querySelector('button');
  button.setAttribute('aria-label', 'Contact Us');
  const panel = widget.querySelector('section');
  const close = () => {
    button.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
  };
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  });
  document.addEventListener('pointerdown', event => {
    if (!widget.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      close();
      button.focus({ preventScroll: true });
    }
  });
  panel.addEventListener('click', event => {
    if (event.target.closest('a')) close();
  });
})();
