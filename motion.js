(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const signature = document.body.dataset.page === 'services' ? document.querySelector('.page-intro h1') : null;
  if (signature) {
    signature.setAttribute('aria-label', signature.innerText.replace(/\s+/g, ' ').trim());
    const walker = document.createTreeWalker(signature, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    let wordIndex = 0;
    textNodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).filter(Boolean).forEach(part => {
        if (/^\s+$/.test(part)) { fragment.append(document.createTextNode(part)); return; }
        const mask = document.createElement('span');
        mask.className = 'headline-word-mask';
        mask.setAttribute('aria-hidden', 'true');
        const word = document.createElement('span');
        word.className = 'headline-word';
        word.textContent = part;
        word.style.setProperty('--word-delay', `${wordIndex * 125 + (node.parentElement.closest('em') ? 150 : 0)}ms`);
        wordIndex++;
        mask.append(word);
        fragment.append(mask);
      });
      node.replaceWith(fragment);
    });
    signature.classList.add('signature-headline');
  }
  const images = [...document.querySelectorAll('.photo-grid figure > img, .stack-card > img, .venue-grid figure > img, .apartment-images > img, .detail-row > img, .home-preview-image > img')];
  const photos = images.map(image => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'photo-frame';
    button.setAttribute('aria-label', `Enlarge photograph: ${image.alt}`);
    button.setAttribute('aria-haspopup', 'dialog');
    if (image.parentElement.classList.contains('apartment-images')) {
      button.className += ` ${image.className}`;
      image.className = '';
    }
    image.before(button);
    button.append(image);
    return { button, image };
  });
  if (photos.length) {
    const viewer = document.createElement('dialog');
    viewer.className = 'photo-viewer';
    viewer.setAttribute('aria-label', 'Photograph viewer');
    viewer.innerHTML = '<div class="viewer-toolbar"><span>DOPCHIM / <span data-viewer-count></span></span><button type="button" class="viewer-close" autofocus>Close <span aria-hidden="true">×</span></button></div><div class="viewer-stage"><button type="button" class="viewer-arrow viewer-prev" aria-label="Previous photograph">←</button><img alt=""><button type="button" class="viewer-arrow viewer-next" aria-label="Next photograph">→</button></div><p class="viewer-caption" aria-live="polite"></p>';
    document.body.append(viewer);
    const fullImage = viewer.querySelector('img');
    const caption = viewer.querySelector('.viewer-caption');
    const count = viewer.querySelector('[data-viewer-count]');
    let index = 0;
    let trigger;
    const show = next => {
      index = (next + photos.length) % photos.length;
      const image = photos[index].image;
      fullImage.src = image.currentSrc || image.src;
      fullImage.alt = image.alt;
      caption.textContent = image.alt;
      count.textContent = `${index + 1} / ${photos.length}`;
      fullImage.classList.remove('viewer-image-enter');
      if (!reduceMotion.matches) requestAnimationFrame(() => fullImage.classList.add('viewer-image-enter'));
    };
    photos.forEach((photo, position) => photo.button.addEventListener('click', () => {
      trigger = photo.button;
      show(position);
      viewer.showModal();
      document.body.classList.add('viewer-open');
    }));
    viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
    viewer.querySelector('.viewer-prev').addEventListener('click', () => show(index - 1));
    viewer.querySelector('.viewer-next').addEventListener('click', () => show(index + 1));
    viewer.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        show(index + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
    viewer.addEventListener('close', () => {
      document.body.classList.remove('viewer-open');
      trigger?.focus({ preventScroll: true });
    });
  }

  if (reduceMotion.matches || !('IntersectionObserver' in window)) return;
  const items = document.querySelectorAll('.section-heading > *, .introduction > *, .detail-row > *, .photo-grid figure, .venue-grid figure, .apartment-copy, .process-grid article, .facts-grid article, .page-intro > *, .enquiry > div:first-child, .page-cta .wrap > *, .home-preview, .home-next-inner > *');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  items.forEach((item, index) => {
    if (item === signature) return;
    if (item.getBoundingClientRect().bottom < 0) return;
    item.style.setProperty('--reveal-delay', `${(index % 2) * 80}ms`);
    item.classList.add('reveal-ready');
    observer.observe(item);
  });
  reduceMotion.addEventListener('change', event => {
    if (event.matches) {
      observer.disconnect();
      items.forEach(item => item.classList.add('is-visible'));
    }
  });
})();
