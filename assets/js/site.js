(function () {
  document.documentElement.classList.remove('no-js');

  var yearNodes = document.querySelectorAll('[data-current-year]');
  yearNodes.forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });

  var menu = document.querySelector('.mobile-menu');
  if (menu) {
    menu.addEventListener('click', function (event) {
      if (event.target.closest('.mobile-panel a')) menu.removeAttribute('open');
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.hasAttribute('open')) {
        menu.removeAttribute('open');
        var summary = menu.querySelector('summary');
        if (summary) summary.focus();
      }
    });
    document.addEventListener('click', function (event) {
      if (menu.hasAttribute('open') && !menu.contains(event.target)) menu.removeAttribute('open');
    });
  }

  var printButtons = document.querySelectorAll('[data-print-page]');
  printButtons.forEach(function (button) {
    button.addEventListener('click', function () { window.print(); });
  });

  var brief = document.querySelector('.role-brief-sheet');
  if (!brief) return;

  var copyButton = brief.querySelector('[data-copy-brief]');
  var copyStatus = brief.querySelector('[data-copy-status]');
  var fallback = brief.querySelector('[data-copy-fallback]');
  var copyOutput = brief.querySelector('[data-copy-output]');
  var fields = [
    ['business', 'Business'], ['date', 'Date'],
    ['purpose', 'Useful difference the role should make'],
    ['capacity-gap', 'Where the work gets stuck'],
    ['first-responsibility', 'Possible first responsibility'],
    ['teachers-and-sources', 'People and approved knowledge'],
    ['role-name', 'Possible role name'], ['reports-to', 'Reports to'],
    ['workplace', 'Likely workplace'], ['human-boundary', 'Decisions that stay human']
  ];

  if (copyButton && copyStatus && fallback && copyOutput) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async function () {
      var completed = fields.map(function (field) {
        var input = brief.querySelector('[name="' + field[0] + '"]');
        return field[1] + ':\n' + ((input && input.value.trim()) || '(To discuss)');
      });
      var text = 'FUSED ID — CLOUD-COLLEAGUE ROLE BRIEF\n\n' + completed.join('\n\n');
      try {
        if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(text);
        fallback.hidden = true;
        copyStatus.textContent = 'Brief copied. Paste it into your email when you are ready. Nothing has been sent.';
      } catch (_) {
        copyOutput.value = text;
        fallback.hidden = false;
        copyOutput.focus();
        copyOutput.select();
        copyStatus.textContent = 'Automatic copying is unavailable. Copy the selected text below. Nothing has been sent.';
      }
    });
  }

  // Print the complete field values, including text beyond a textarea's visible height.
  function clearPrintFields() {
    brief.querySelectorAll('.print-field').forEach(function (node) { node.remove(); });
  }
  window.addEventListener('beforeprint', function () {
    clearPrintFields();
    brief.querySelectorAll('input[name], textarea[name]').forEach(function (input) {
      var value = document.createElement('div');
      value.className = 'print-field';
      value.textContent = input.value || '—';
      input.insertAdjacentElement('afterend', value);
    });
  });
  window.addEventListener('afterprint', clearPrintFields);
})();
