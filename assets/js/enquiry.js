(() => {
  'use strict';

  const form = document.querySelector('[data-enquiry-form]');
  if (!form) return;
  const status = form.querySelector('[data-enquiry-status]');
  const manualCopy = form.querySelector('[data-manual-copy]');
  const copyText = manualCopy.querySelector('textarea');

  function enquiryBody() {
    const value = name => form.elements.namedItem(name).value.trim();
    const contact = [
      'Name: ' + value('name'),
      'Business: ' + value('company'),
      'Email: ' + value('email')
    ];
    if (value('phone')) contact.push('Phone: ' + value('phone'));
    return [...contact, '', value('message')].join('\n').replace(/\r?\n/g, '\r\n');
  }

  function valid() {
    for (const field of form.querySelectorAll('[required]')) {
      field.setCustomValidity(field.value.trim() ? '' : 'Please complete this field.');
    }
    return form.reportValidity();
  }

  function showText(body) {
    manualCopy.hidden = false;
    copyText.value = body;
    copyText.focus();
    copyText.select();
  }

  form.addEventListener('input', event => {
    event.target.setCustomValidity('');
    status.textContent = '';
    manualCopy.hidden = true;
    copyText.value = '';
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!valid()) return;
    const body = enquiryBody();
    const draft = form.action + '?subject=FUSED%20website%20enquiry&body=' + encodeURIComponent(body);
    // Some email apps truncate long URLs. Keep the full enquiry available to copy.
    if (draft.length > 2000) {
      status.textContent = 'This enquiry is too long to open reliably as a draft. Copy the selected text and email it to sales@fusedid.com.';
      showText(body);
      return;
    }
    status.textContent = 'Send the draft from your email app. If it didn’t open, choose Copy enquiry and email it to sales@fusedid.com.';
    window.location.assign(draft);
  });

  form.querySelector('[data-copy-enquiry]').addEventListener('click', async () => {
    if (!valid()) return;
    const body = enquiryBody();
    try {
      await navigator.clipboard.writeText(body);
      status.textContent = 'Enquiry copied. Paste it into an email to sales@fusedid.com.';
    } catch {
      status.textContent = 'Copy the selected text and email it to sales@fusedid.com.';
      showText(body);
    }
  });

  document.querySelector('[data-draft-intro]').hidden = false;
  form.hidden = false;
})();
