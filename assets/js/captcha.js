/* Add the public site key in source/metadata.mjs. Server verification is mandatory. */
(() => {
  'use strict';
  const sitekey = document.currentScript?.dataset.sitekey?.trim();
  const container = document.querySelector('[data-captcha]');
  if (!container) return;
  container.hidden = false;
  if (!sitekey) return; // Keep the visible pending state until IT activates verification.
  const mount = container.querySelector('[data-captcha-widget]');
  const status = container.querySelector('[data-captcha-status]');
  const retry = container.querySelector('[data-captcha-retry]');
  const badge = container.querySelector('[data-captcha-badge]');
  let token = '', expires = 0, widgetId = null, script, timer, currentSize;
  container.hidden = false;
  function message(text, canRetry = false, state = 'checking') {
    status.textContent = text;
    retry.hidden = !canRetry;
    container.dataset.state = state;
    badge.textContent = { checking: 'Checking', verified: 'Verified', expired: 'Check again', unavailable: 'Check unavailable' }[state];
  }
  function invalidate() { token = ''; expires = 0; }
  function failed() {
    clearTimeout(timer);
    invalidate();
    message('The security check could not finish. Please retry, or call our office using the number below.', true, 'unavailable');
  }
  function size() { return mount.getBoundingClientRect().width < 300 ? 'compact' : 'flexible'; }
  function render() {
    clearTimeout(timer);
    if (!window.turnstile || widgetId !== null) return;
    message('Completing a quick security check…');
    currentSize = size();
    try {
      widgetId = window.turnstile.render(mount, {
        sitekey, action: 'enquiry', theme: 'light', size: currentSize,
        'response-field': false,
        callback(value) {
          token = value; expires = Date.now() + 290000;
          message('Security check complete.', false, 'verified');
        },
        'expired-callback'() { invalidate(); message('The security check has expired. Please retry before sending.', true, 'expired'); },
        'timeout-callback': failed,
        'error-callback': failed
      });
    } catch { failed(); }
  }
  function load() {
    clearTimeout(timer);
    message('Completing a quick security check…');
    if (window.turnstile) { render(); return; }
    if (script) script.remove();
    script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=fusedTurnstileLoaded&render=explicit';
    script.async = true;
    script.onerror = failed;
    timer = setTimeout(failed, 15000);
    document.head.appendChild(script);
  }
  function reset() {
    invalidate();
    message('Completing a quick security check…');
    try {
      if (window.turnstile && widgetId !== null) window.turnstile.reset(widgetId);
      else load();
    } catch { failed(); }
  }
  window.fusedCaptcha = Object.freeze({
    required: true,
    getToken() {
      if (token && Date.now() >= expires) {
        invalidate();
        message('The security check has expired. Please retry before sending.', true, 'expired');
      }
      return token;
    },
    reset
  });
  window.fusedTurnstileLoaded = render;
  retry.addEventListener('click', reset);
  window.addEventListener('resize', () => {
    if (widgetId === null || currentSize === size()) return;
    try {
      window.turnstile.remove(widgetId);
      widgetId = null; invalidate(); render();
    } catch { failed(); }
  });
  load();
})();
