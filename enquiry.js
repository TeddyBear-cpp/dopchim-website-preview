(function (root) {
  const formatDate = value => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(`${value}T12:00:00`)) : 'Not decided yet';
  const validateStay = (arrival, departure) => arrival && departure && departure <= arrival ? 'Choose a check-out date after your check-in date.' : '';
  const buildFields = (mode, details) => {
    const fields = [['Name', details.get('name')], ['Phone / WhatsApp', details.get('phone')]];
    if (details.get('email')) fields.push(['Email', details.get('email')]);
    if (mode === 'stay') {
      fields.push(['Enquiry', 'Apartment accommodation'], ['Check-in', details.has('stayUndecided') ? 'Not decided yet' : formatDate(details.get('checkin'))], ['Check-out', details.has('stayUndecided') ? 'Not decided yet' : formatDate(details.get('checkout'))], ['Guests', details.get('stayGuests')]);
    } else {
      fields.push(['Event type', details.get('occasion')], ['Event date', details.has('dateUndecided') ? 'Not decided yet' : formatDate(details.get('date'))], ['Venue / location', details.has('needsVenue') ? 'I need a venue' : details.get('venue')], ['Guests', details.get('guests')], ['Services required', details.getAll('services').join(', ')]);
    }
    if (details.get('message')) fields.push(['Additional details', details.get('message')]);
    return fields;
  };
  const whatsappUrl = (mode, fields) => {
    const greeting = mode === 'stay' ? 'Hello Dopchim, I would like to enquire about an apartment stay.' : 'Hello Dopchim, I would like to enquire about an event.';
    const text = `${greeting}\n\n${fields.map(([label, value]) => `${label}: ${value}`).join('\n')}\n\nPlease confirm the available options and pricing.`;
    return `https://wa.me/260977992912?text=${encodeURIComponent(text)}`;
  };
  const api = { formatDate, validateStay, buildFields, whatsappUrl };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DopchimEnquiry = api;
})(globalThis);
