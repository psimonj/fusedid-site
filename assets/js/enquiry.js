/* POST endpoint is configured in the form's action. See docs/FORM-SETUP.md. */
(() => {
  'use strict';
  const form = document.querySelector('[data-enquiry-form]');
  if (!form) return;
  const status = form.querySelector('[data-enquiry-status]');
  const button = form.querySelector('button[type="submit"]');
  const originalLabel = button.textContent;
  const fields = [...form.querySelectorAll('input, textarea')];
  let sending = false;

  function announce(message, state, focus = false) {
    status.textContent = message;
    status.dataset.state = state;
    if (focus) status.focus();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    for (const name of ['name', 'company', 'email', 'message']) {
      const field = form.elements.namedItem(name);
      field.setCustomValidity(field.value.trim() ? '' : 'Please complete this field.');
    }
    if (!form.reportValidity()) return;
    const captcha = window.fusedCaptcha;
    const captchaRequired = form.dataset?.captchaRequired === 'true' || captcha?.required === true;
    const captchaToken = captchaRequired ? captcha?.getToken() || '' : '';
    if (captchaRequired && !captchaToken) {
      announce('Please complete the security check before sending your enquiry. Retry the check if needed; your message is still here.', 'error', true);
      return;
    }
    const payload = new URLSearchParams(new FormData(form));
    if (captchaRequired) payload.set('cf-turnstile-response', captchaToken);
    for (const name of ['name', 'company', 'email', 'phone', 'message']) {
      payload.set(name, (payload.get(name) || '').trim());
    }
    sending = true;
    button.disabled = true;
    fields.forEach(field => { field.disabled = true; });
    button.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    announce('Sending your enquiry…', 'pending');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        mode: 'same-origin',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
        body: payload,
        signal: controller.signal
      });
      const isJson = (response.headers.get('content-type') || '').includes('application/json');
      const result = isJson ? await response.json() : null;
      if (!response.ok || result?.ok !== true) {
        const error = new Error('Enquiry not confirmed');
        error.status = response.status;
        throw error;
      }
      form.reset();
      announce('Thanks — we’ve received your enquiry. We’ll be in touch using the details you provided.', 'success', true);
      try {
        window.fusedAnalytics?.enquiryReceived();
      } catch { /* Analytics must never interrupt a successful enquiry. */ }
    } catch (error) {
      const message = error.status === 429
        ? 'Too many attempts just now. Please wait a few minutes before trying again. Your message is still here.'
        : error.status === 403
        ? 'The security check could not be verified. Please complete the new check and try again. Your message is still here.'
        : 'We couldn’t confirm that your enquiry was received. Your message is still here. Please try again in a few minutes.';
      announce(message, 'error', true);
    } finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      fields.forEach(field => { field.disabled = false; });
      button.textContent = originalLabel;
      form.removeAttribute('aria-busy');
      // Tokens are single-use; obtain a fresh check after every attempted POST.
      try { if (captcha?.required) captcha.reset(); } catch { /* The next send still requires a token. */ }
    }
  });
  form.addEventListener('input', (event) => {
    if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity('');
  });
})();
