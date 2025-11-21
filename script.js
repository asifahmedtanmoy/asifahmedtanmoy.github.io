/* --------------------- MOBILE NAV (hamburger) ----------------------- */
(function mobileNav() {
  // find all hamburger controls and nav container(s)
  const hamburgers = Array.from(document.querySelectorAll('.hamburger'));
  // support both a single .nav-links or multiple nav containers via [data-nav]
  const navLinksPrimary = document.querySelector('.nav-links');
  const navContainers = navLinksPrimary ? [navLinksPrimary] : Array.from(document.querySelectorAll('[data-nav], .nav-links'));

  // safe no-op if markup missing
  if (!hamburgers.length || !navContainers.length) {
    window.toggleMenu = window.toggleMenu || function () { return false; };
    return;
  }

  // flatten nav items (all anchors inside any nav container)
  const getNavItems = () => {
    const items = [];
    navContainers.forEach(nc => {
      try {
        nc.querySelectorAll && nc.querySelectorAll('li a').forEach(a => items.push(a));
      } catch (e) { /* ignore */ }
    });
    return items;
  };
  let navItems = getNavItems();

  // helper to test whether a node is inside any hamburger
  const isInsideHamburger = (node) => {
    try {
      return hamburgers.some(h => h && h.contains && h.contains(node));
    } catch (e) {
      return false;
    }
  };

  const toggle = (control) => {
    // determine desired active state
    const active = control ? !(control.classList && control.classList.contains('active')) : !hamburgers[0].classList.contains('active');

    hamburgers.forEach(h => {
      if (active) h.classList.add('active'); else h.classList.remove('active');
      h.setAttribute('aria-expanded', String(active));
    });

    navContainers.forEach(nc => {
      if (active) nc.classList.add('show'); else nc.classList.remove('show');
      nc.setAttribute('aria-hidden', String(!active));
    });
  };

  hamburgers.forEach(hamburger => {
    if (!hamburger.hasAttribute('tabindex')) hamburger.setAttribute('tabindex', '0');
    if (!hamburger.hasAttribute('role')) hamburger.setAttribute('role', 'button');
    if (!hamburger.hasAttribute('aria-expanded')) hamburger.setAttribute('aria-expanded', 'false');

    // Use pointerdown for more reliable mobile responsiveness; keep click as fallback
    hamburger.addEventListener('pointerdown', (e) => {
      // prevent focusing quirks on mobile; stop propagation so document listener doesn't close immediately
      e.stopPropagation();
      e.preventDefault();
      toggle(hamburger);
    });

    // fallback click (some browsers / devices)
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle(hamburger);
    }, { passive: false });

    hamburger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(hamburger);
      }
    });
  });

  // keep inline onclick compatibility
  window.toggleMenu = function (el) {
    try {
      if (!el) toggle();
      else toggle(el);
    } catch (err) {
      toggle();
    }
  };

  // when a nav link is clicked, close all navs
  const handleNavClick = (e) => {
    const target = e.currentTarget || e.target;
    // close navs
    navContainers.forEach(nc => {
      nc.classList.remove('show');
      nc.setAttribute('aria-hidden', 'true');
    });
    hamburgers.forEach(h => { h.classList.remove('active'); h.setAttribute('aria-expanded','false'); });
  };

  // attach click handlers to nav items (recompute list in case nav markup changes)
  const attachNavItems = () => {
    // remove previous listeners safely by cloning nodes (only do if items were present)
    navItems = getNavItems();
    navItems.forEach(a => {
      // ensure we don't duplicate by removing existing handler attributes
      a.addEventListener('click', handleNavClick, { passive: true });
    });
  };
  attachNavItems();

  // clicking outside nav should close it — this handler is passive-friendly
  document.addEventListener('pointerdown', (e) => {
    const target = e.target;
    // if click is inside any nav container or inside any hamburger, ignore
    const insideNav = navContainers.some(nc => nc && nc.contains && nc.contains(target));
    if (insideNav) return;
    if (isInsideHamburger(target)) return;

    // otherwise close
    navContainers.forEach(nc => {
      nc.classList.remove('show');
      nc.setAttribute('aria-hidden', 'true');
    });
    hamburgers.forEach(h => { h.classList.remove('active'); h.setAttribute('aria-expanded','false'); });
  }, { passive: true });

  // keep document click fallback for older devices
  document.addEventListener('click', (e) => {
    const target = e.target;
    const insideNav = navContainers.some(nc => nc && nc.contains && nc.contains(target));
    if (insideNav) return;
    if (isInsideHamburger(target)) return;

    navContainers.forEach(nc => {
      nc.classList.remove('show');
      nc.setAttribute('aria-hidden', 'true');
    });
    hamburgers.forEach(h => { h.classList.remove('active'); h.setAttribute('aria-expanded','false'); });
  }, { passive: true });

  // watch for DOM changes that might add/remove nav items/hamburgers (lightweight)
  const observer = new MutationObserver((mutations) => {
    // if structure changes, re-attach nav items
    let refresh = false;
    for (const m of mutations) {
      if (m.addedNodes.length || m.removedNodes.length) { refresh = true; break; }
    }
    if (refresh) attachNavItems();
  });

  try {
    // observe body for light mutations (childList + subtree)
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (e) {
    // if observer not available, it's fine — nothing critical
  }

})();
