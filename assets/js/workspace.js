/* Local illustrative workspace; no service connection or network requests. */
(() => {
  document.querySelectorAll('[data-workspace]').forEach((workspace) => {
    const tabs = [...workspace.querySelectorAll('[role="tab"]')];
    function selectTab(tab, moveFocus = false) {
      tabs.forEach((item) => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        workspace.querySelector(`#${item.getAttribute('aria-controls')}`).hidden = !selected;
      });
      if (moveFocus) tab.focus();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', (event) => {
        let target = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') target = 0;
        else if (event.key === 'End') target = tabs.length - 1;
        else return;
        event.preventDefault();
        selectTab(tabs[target], true);
      });
    });
    function selectFromHash() {
      const tab = tabs.find(item => '#' + item.getAttribute('aria-controls') === window.location.hash);
      if (tab) selectTab(tab);
    }
    selectFromHash();
    window.addEventListener('hashchange', selectFromHash);
  });

  document.querySelectorAll('[data-review-example]').forEach((example) => {
    const show = example.querySelector('[data-review-show]');
    const reset = example.querySelector('[data-review-reset]');
    const result = example.querySelector('[data-review-result]');
    const stage = example.querySelector('[data-review-stage]');
    const status = example.querySelector('[data-review-status]');
    show.addEventListener('click', () => {
      result.hidden = false;
      show.hidden = true;
      stage.textContent = 'Sample update · checked';
      status.textContent = 'The checked sample update is shown below. No live service has changed.';
      reset.focus();
    });
    reset.addEventListener('click', () => {
      result.hidden = true;
      show.hidden = false;
      stage.textContent = 'Proposed change';
      status.textContent = 'Example reset to the proposed change.';
      show.focus();
    });
  });

  document.querySelectorAll('[data-export-record]').forEach((button) => {
    button.addEventListener('click', () => {
      const record = 'FUSED — SAMPLE CUSTOMER KNOWLEDGE RECORD\n\nFictional information for the website preview.\n\nTitle: Lead with the standard range.\nStatus: Confirmed\nGuidance: Offer the standard range first. Custom work remains available when a standard product does not suit the requirement.\nReason: Shorter lead times matter most to buyers this quarter.\nSource: Operations review — 28 October\nOwner: Commercial team\nPrevious guidance: Lead with the custom product service. Superseded following the confirmed change in commercial priorities.\n\nThis sample is not a live customer export.\n';
      const url = URL.createObjectURL(new Blob([record], {type:'text/plain;charset=utf-8'}));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'FUSED-Sample-Knowledge-Record.txt';
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      button.closest('.workspace-panel').querySelector('[data-export-status]').textContent = 'Sample record prepared for download. No customer data is used.';
    });
  });

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copy);
      const status = button.closest('[data-workspace],aside')?.querySelector('[data-copy-status]');
      const value = target.textContent.trim();
      try {
        await navigator.clipboard.writeText(value);
        if (status) status.textContent = 'Task prompt copied. Ready to adapt for your Colleague.';
      } catch {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(target);
        selection.removeAllRanges();
        selection.addRange(range);
        if (status) status.textContent = 'Automatic copying is unavailable. The text is selected; use your device’s Copy command.';
      }
    });
  });

})();
