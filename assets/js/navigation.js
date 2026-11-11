/* Native details provide click/touch/Enter/Space; desktop pointers also get hover. */
(() => {
  const products = [...document.querySelectorAll('[data-products-menu]')];
  const mobile = document.querySelector('.mobile-menu');
  const desktop = document.querySelector('.desktop-nav [data-products-menu]');
  const hover = window.matchMedia('(min-width: 1121px) and (hover: hover) and (pointer: fine)');
  let leaveTimer, openedByHover = false, suppressHover = false;
  const cancelLeave = () => { window.clearTimeout(leaveTimer); leaveTimer = undefined; };
  const close = panel => {
    if (!panel) return;
    if (panel === desktop) { cancelLeave(); openedByHover = false; }
    panel.open = false;
  };
  const closeAll = () => { products.forEach(close); close(mobile); };
  products.forEach(panel => panel.addEventListener('toggle', () => {
    if (panel.open) products.filter(other => other !== panel).forEach(close);
  }));
  if (desktop) {
    desktop.addEventListener('mouseenter', () => {
      cancelLeave();
      if (!hover.matches || suppressHover) return;
      if (!desktop.open) openedByHover = true;
      products.filter(panel => panel !== desktop).forEach(close);
      desktop.open = true;
    });
    desktop.addEventListener('mouseleave', () => {
      suppressHover = false;
      cancelLeave();
      if (!hover.matches) return;
      // Let the pointer cross to the panel without collapsing it. Keep keyboard focus usable.
      leaveTimer = window.setTimeout(() => {
        if (!desktop.contains(document.activeElement)) close(desktop);
      }, 220);
    });
    desktop.querySelector('summary').addEventListener('click', event => {
      // A first pointer click pins a menu already opened by rollover instead of shutting it.
      if (hover.matches && openedByHover && desktop.open && event.detail > 0) {
        event.preventDefault();
        openedByHover = false;
      }
    });
  }
  document.addEventListener('click', event => {
    if (event.target.closest('.site-header a')) { closeAll(); return; }
    products.forEach(panel => { if (!panel.contains(event.target)) close(panel); });
    if (mobile && !mobile.contains(event.target)) close(mobile);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const panel = products.find(item => item.open && item.contains(event.target)) || products.find(item => item.open);
    if (panel) {
      if (panel === desktop) suppressHover = true;
      close(panel); panel.querySelector('summary').focus(); event.preventDefault();
    } else if (mobile?.open) { close(mobile); mobile.querySelector('summary').focus(); event.preventDefault(); }
  });
  document.addEventListener('focusin', event => {
    products.forEach(panel => { if (panel.open && !panel.contains(event.target)) close(panel); });
    if (mobile?.open && !mobile.contains(event.target)) close(mobile);
  });
  const reset = () => { closeAll(); suppressHover = false; };
  window.matchMedia('(min-width: 1121px)').addEventListener('change', reset);
  hover.addEventListener('change', reset);
})();
