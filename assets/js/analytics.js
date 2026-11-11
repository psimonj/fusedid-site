/* GA4 configuration: source/metadata.mjs. Deployment checks: docs/ANALYTICS.md. */
(() => {
  'use strict';
  const measurementId = document.currentScript?.dataset.measurementId;
  const { location, navigator } = window;
  if (!/^G-[A-Z0-9]+$/.test(measurementId || '') || window.fusedAnalytics) return;
  if (location.protocol !== 'https:' || !['fusedid.com', 'www.fusedid.com'].includes(location.hostname)) return;
  if (navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1') return;

  // Use the published page path, including on a 404. Do not send arbitrary
  // query strings or fragments. Keep standard campaign tags for attribution.
  const currentUrl = new URL(location.href);
  const canonical = document.querySelector('link[rel="canonical"]');
  const pageUrl = new URL(new URL(canonical?.href || currentUrl.href).pathname, currentUrl.origin);
  for (const key of ['utm_id', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const value = currentUrl.searchParams.get(key);
    if (value && value.length <= 150 && !/[@\r\n]/.test(value)) pageUrl.searchParams.set(key, value);
  }
  let referrer = '';
  try {
    const url = new URL(document.referrer);
    if (['https:', 'http:'].includes(url.protocol)) referrer = url.origin + '/';
  } catch { /* Direct visits may have no referrer. */ }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: pageUrl.href,
    page_referrer: referrer
  });
  window.fusedAnalytics = Object.freeze({
    enquiryReceived() {
      // No names, contact details, message text or other form values.
      gtag('event', 'generate_lead', {
        send_to: measurementId,
        lead_source: 'website_enquiry',
        form_id: 'enquiry-form'
      });
    }
  });
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
  document.head.appendChild(tag);
})();
