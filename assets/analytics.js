/* GA4 strategy events: only public track titles and fixed enquiry categories.
 * Never pass form values, email addresses, messages or destination query strings.
 * Bandcamp clicks and enquiry attempts are intent, not sales or confirmed leads.
 */
(() => {
  const send = (name, parameters = {}) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, {send_to: 'G-YZG9CEZ5F5', ...parameters});
    }
  };
  const enquiryType = value => ['music', 'vinyl', 'booking'].includes(value) ? value : 'music';
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-enquiry]');
    if (trigger) send('enquiry_open', {enquiry_type: enquiryType(trigger.dataset.enquiry)});

    const link = event.target.closest('a[href]');
    if (link) {
      const url = new URL(link.href, window.location.href);
      if (url.hostname === 'normaldj.bandcamp.com') {
        const row = link.closest('.trk') || document.querySelector('.trk[aria-current="true"]');
        send('bandcamp_click', {
          track_title: link.id === 'npBuy' || link.closest('.trk') ? row?.dataset.title || 'catalogue' : 'catalogue',
          placement: link.id === 'npBuy' ? 'player' : link.closest('.trk') ? 'track_list' : 'site_link'
        });
      }
      return;
    }
    const row = event.target.closest('.trk');
    if (row) send('music_select', {track_title: row.dataset.title});
  });
  document.getElementById('enquiryForm')?.addEventListener('submit', event => {
    // The site's own validation handler runs first; rejected forms do not count.
    if (event.defaultPrevented) return;
    const type = event.target.querySelector('[name="request_type"]:checked')?.value;
    send('enquiry_submit_attempt', {enquiry_type: enquiryType(type)});
  });
})();
