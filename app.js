(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-navigation');
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    menu.textContent = 'Menu';
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? 'Close' : 'Menu';
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  const form = document.querySelector('#enquiry-form');
  if (!form) return;
  form.classList.add('form-shell');
  form.noValidate = true;
  const serviceNames = ['Event planning', 'Décor & styling', 'Catering', 'Venue hire', 'Furniture & equipment hire'];
  const occasions = ['Wedding', 'Bridal shower', 'Birthday', 'Private celebration', 'Corporate event or conference', 'Product launch', 'Venue viewing', 'Garden viewing', 'Other'];
  const params = new URLSearchParams(location.search);
  let mode = params.get('type') === 'stay' ? 'stay' : 'event';
  let hasPreview = false;
  form.innerHTML = `
    <div class="form-tabs" aria-label="Enquiry type"><a href="?type=event#enquire" data-mode="event">Plan an Event</a><a href="?type=stay#enquire" data-mode="stay">Enquire About a Stay</a></div>
    <p class="form-help">Fields marked * are required. Details stay in this page until you choose to share them through WhatsApp.</p>
    <div class="field-row"><label>Your Name *<input name="name" autocomplete="name" required maxlength="100" placeholder="Your name…"></label><label>Phone / WhatsApp Number *<input name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="40" placeholder="+260…"></label></div>
    <label>Email Address <span>(optional)</span><input name="email" type="email" autocomplete="email" spellcheck="false" maxlength="254" placeholder="you@example.com"></label>
    <fieldset data-event><legend>About Your Event</legend>
      <label>Event Type *<select name="occasion" required><option value="">Choose your occasion…</option>${occasions.map(item => `<option>${item}</option>`).join('')}</select></label>
      <label>Event Date *<input name="date" type="date" required></label>
      <label class="check-label"><input name="dateUndecided" type="checkbox">Date not decided yet</label>
      <label>Venue / Location *<input name="venue" autocomplete="off" required maxlength="160" placeholder="Your venue or preferred location…"></label>
      <label class="check-label"><input name="needsVenue" type="checkbox">I need a venue</label>
      <label>Number of Guests *<input name="guests" type="number" min="1" step="1" inputmode="numeric" required placeholder="Estimated guest count…"></label>
      <fieldset><legend>Services Required * <span>(choose one or more)</span></legend><div class="checkbox-grid">${serviceNames.map(name => `<label class="check-label"><input name="services" type="checkbox" value="${name}">${name}</label>`).join('')}</div></fieldset>
    </fieldset>
    <fieldset data-stay><legend>About Your Stay</legend>
      <div class="field-row"><label>Check-In Date *<input name="checkin" type="date" required></label><label>Check-Out Date *<input name="checkout" type="date" required></label></div>
      <label class="check-label"><input name="stayUndecided" type="checkbox">Dates not decided yet</label>
      <label>Number of Guests *<input name="stayGuests" type="number" min="1" step="1" inputmode="numeric" required placeholder="Number of people staying…"></label>
    </fieldset>
    <label>Anything Else? <span>(optional)</span><textarea name="message" rows="3" maxlength="2000" placeholder="Your ideas, accessibility needs or questions…"></textarea></label>
    <p class="form-error" role="alert" aria-live="polite"></p>
    <button class="button" type="submit">Review Your Enquiry <span aria-hidden="true">↗</span></button>
    <p id="form-status" role="status" aria-live="polite"></p>
    <section class="enquiry-preview" aria-label="Your enquiry preview" tabindex="-1" hidden></section>`;
  const controls = form.elements;
  const preview = form.querySelector('.enquiry-preview');
  const status = form.querySelector('#form-status');
  const error = form.querySelector('.form-error');
  const firstService = form.querySelector('[name="services"]');
  const resetPreview = () => {
    hasPreview = false;
    preview.hidden = true;
    status.textContent = '';
    error.textContent = '';
  };
  const syncDates = () => {
    controls.date.disabled = mode !== 'event' || controls.dateUndecided.checked;
    controls.venue.disabled = mode !== 'event' || controls.needsVenue.checked;
    controls.checkin.disabled = mode !== 'stay' || controls.stayUndecided.checked;
    controls.checkout.disabled = mode !== 'stay' || controls.stayUndecided.checked;
  };
  const setMode = (nextMode, updateUrl = false) => {
    mode = nextMode;
    form.querySelectorAll('[data-event], [data-stay]').forEach(group => {
      const active = group.hasAttribute(mode === 'event' ? 'data-event' : 'data-stay');
      group.hidden = !active;
      group.disabled = !active;
    });
    form.querySelectorAll('[data-mode]').forEach(link => link.setAttribute('aria-current', String(link.dataset.mode === mode)));
    syncDates();
    resetPreview();
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('type', mode);
      try { history.replaceState(null, '', url); } catch {}
    }
  };
  const chooseService = service => {
    if (service === 'Apartments') { setMode('stay'); return; }
    setMode('event');
    const canonical = service === 'Event spaces' ? 'Venue hire' : service;
    const selected = serviceNames.includes(canonical) ? canonical : 'Event planning';
    form.querySelectorAll('[name="services"]').forEach(input => { input.checked = input.value === selected; });
    if (selected === 'Venue hire') controls.needsVenue.checked = true;
    syncDates();
  };
  form.querySelectorAll('[data-mode]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    setMode(link.dataset.mode, true);
  }));
  form.querySelectorAll('input,select,textarea').forEach((input, index) => {
    const message = document.createElement('span');
    message.id = `field-error-${index}`;
    message.className = 'error-field';
    input.closest('label').append(message);
    input.setAttribute('aria-describedby', message.id);
  });
  const clearFieldErrors = () => {
    form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
    form.querySelectorAll('.error-field').forEach(item => { item.textContent = ''; });
    firstService.setCustomValidity('');
    controls.checkout.setCustomValidity('');
  };
  form.addEventListener('input', () => { clearFieldErrors(); resetPreview(); });
  form.addEventListener('change', () => { syncDates(); clearFieldErrors(); resetPreview(); });
  document.querySelectorAll('[data-service], [data-occasion]').forEach(link => link.addEventListener('click', () => {
    chooseService(link.dataset.service || 'Event planning');
    if (occasions.includes(link.dataset.occasion)) controls.occasion.value = link.dataset.occasion;
  }));
  if (params.get('service')) chooseService(params.get('service'));
  if (occasions.includes(params.get('occasion'))) controls.occasion.value = params.get('occasion');
  setMode(mode);
  window.addEventListener('popstate', () => setMode(new URLSearchParams(location.search).get('type') === 'stay' ? 'stay' : 'event'));
  form.addEventListener('submit', event => {
    event.preventDefault();
    clearFieldErrors();
    const details = new FormData(form);
    if (mode === 'event' && !details.getAll('services').length) firstService.setCustomValidity('Choose at least one service.');
    if (mode === 'stay' && !controls.stayUndecided.checked) controls.checkout.setCustomValidity(window.DopchimEnquiry.validateStay(controls.checkin.value, controls.checkout.value));
    const invalid = [...form.querySelectorAll('input,select,textarea')].filter(input => input.willValidate && !input.validity.valid);
    if (invalid.length) {
      resetPreview();
      invalid.forEach(input => {
        input.setAttribute('aria-invalid', 'true');
        document.getElementById(input.getAttribute('aria-describedby')).textContent = input.validationMessage;
      });
      error.textContent = 'Please check the highlighted fields before reviewing your enquiry.';
      invalid[0].focus();
      return;
    }
    const fields = window.DopchimEnquiry.buildFields(mode, details);
    const heading = document.createElement('h3');
    heading.textContent = mode === 'stay' ? 'Your Accommodation Enquiry' : 'Your Event Enquiry';
    const summary = document.createElement('dl');
    fields.forEach(([label, value]) => {
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = label;
      description.textContent = value;
      summary.append(term, description);
    });
    const whatsapp = document.createElement('a');
    whatsapp.className = 'button';
    whatsapp.textContent = 'Continue to WhatsApp ↗';
    whatsapp.href = window.DopchimEnquiry.whatsappUrl(mode, fields);
    whatsapp.target = '_blank';
    whatsapp.rel = 'noopener';
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'underlined';
    edit.textContent = 'Edit Your Details';
    edit.addEventListener('click', () => { resetPreview(); controls.name.focus(); });
    const actions = document.createElement('div');
    actions.className = 'preview-actions';
    actions.append(whatsapp, edit);
    const note = document.createElement('p');
    note.className = 'form-help';
    note.textContent = 'This opens WhatsApp with your details. Press Send there to share your enquiry. Availability and prices are confirmed by the team.';
    preview.replaceChildren(heading, summary, actions, note);
    preview.hidden = false;
    hasPreview = true;
    status.textContent = 'Your enquiry is ready to review. Nothing has been sent.';
    preview.focus({ preventScroll: true });
    const position = preview.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top: position, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  window.addEventListener('pageshow', () => { if (!hasPreview) preview.hidden = true; });
})();
