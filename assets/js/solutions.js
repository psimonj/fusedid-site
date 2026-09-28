(function () {
  // Without JavaScript these remain ordinary links and all examples stay visible.
  document.querySelectorAll('[data-solution-explorer]').forEach(function (explorer) {
    var list = explorer.querySelector('[data-solution-tabs]');
    var tabs = Array.from(explorer.querySelectorAll('[data-solution-tab]'));
    var panels = Array.from(explorer.querySelectorAll('[data-solution-panel]'));
    if (!list || !tabs.length || tabs.length !== panels.length) return;
    if (tabs.some(function (tab, i) { return tab.getAttribute('href') !== '#' + panels[i].id; })) return;

    function select(index, focus) {
      tabs.forEach(function (tab, i) {
        tab.setAttribute('aria-selected', String(i === index));
        tab.setAttribute('tabindex', i === index ? '0' : '-1');
        panels[i].hidden = i !== index;
      });
      if (focus) tabs[index].focus();
    }

    list.setAttribute('role', 'tablist');
    tabs.forEach(function (tab, index) {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panels[index].id);
      panels[index].setAttribute('role', 'tabpanel');
      panels[index].setAttribute('aria-labelledby', tab.id);
      panels[index].setAttribute('tabindex', '0');
      tab.addEventListener('click', function (event) {
        // Retain open-in-new-tab and copy-link behaviour on these real links.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        select(index, false);
      });
      tab.addEventListener('keydown', function (event) {
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        var next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else if (event.key === ' ' || event.key === 'Enter') next = index;
        else return;
        event.preventDefault();
        select(next, true);
      });
    });

    function selectedFromHash() {
      return panels.findIndex(function (panel) { return '#' + panel.id === window.location.hash; });
    }
    var initial = selectedFromHash();
    select(initial < 0 ? 0 : initial, false);
    explorer.setAttribute('data-enhanced', 'true');
    window.addEventListener('hashchange', function () {
      var index = selectedFromHash();
      if (index >= 0) select(index, false);
    });
  });
})();
