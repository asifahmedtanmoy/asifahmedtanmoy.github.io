(function mobileNav() {
  const hamburgers = Array.from(document.querySelectorAll('.hamburger'));
  const navLinksPrimary = document.querySelector('.nav-links');
  const navContainers = navLinksPrimary
    ? [navLinksPrimary]
    : Array.from(document.querySelectorAll('[data-nav], .nav-links'));

  if (!hamburgers.length || !navContainers.length) {
    window.toggleMenu = window.toggleMenu || function () { return false; };
    return;
  }

  const getNavItems = () => {
    const items = [];
    navContainers.forEach(nc => {
      try {
        nc.querySelectorAll && nc.querySelectorAll('li a').forEach(a => items.push(a));
      } catch (e) {
        console.warn('menu nav container query failed', e, nc);
      }
    });
    return items;
  };

  const toggle = (e) => {
    if (e && (e.target.tagName === 'A' || (e.target.closest && e.target.closest('a')))) return;
    const control = e && e.currentTarget;
    const isOpen = control && control.getAttribute('aria-expanded') === 'true';
    // Close all first
    navContainers.forEach(nc => {
      nc.classList.remove('show');
      nc.setAttribute('aria-hidden', 'true');
    });
    hamburgers.forEach(h => {
      h.classList.remove('active');
      h.setAttribute('aria-expanded','false');
    });
    if (!isOpen) {
      // Open clicked
      if (control) {
        const navAttr = control.getAttribute('data-nav');
        const targetNav = navAttr
          ? document.querySelector(navAttr)
          : control.nextElementSibling || navContainers[0];
        if (targetNav) {
          targetNav.classList.add('show');
          targetNav.setAttribute('aria-hidden','false');
        }
        control.classList.add('active');
        control.setAttribute('aria-expanded','true');
      }
    }
  };

  hamburgers.forEach(hamburger => {
    if (!hamburger.hasAttribute('tabindex')) hamburger.setAttribute('tabindex', '0');
    if (!hamburger.hasAttribute('role')) hamburger.setAttribute('role', 'button');
    if (!hamburger.hasAttribute('aria-expanded')) hamburger.setAttribute('aria-expanded', 'false');

    hamburger.addEventListener('pointerdown', (e) => {
      e.stopPropagation();            
      toggle(hamburger);
    });

    hamburger.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      toggle(hamburger);
    }, { passive: true });

    // ✅ Fixed: Removed this block to prevent double-toggle on mobile
    // hamburger.addEventListener('click', (e) => {
    //   e.stopPropagation();
    //   toggle(hamburger);
    // }, { passive: true });

    hamburger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(hamburger);
      }
    });
  });

  window.toggleMenu = function (el) {
    try {
      if (!el) toggle();
      else toggle(el);
    } catch (err) {
      toggle();
    }
  };

  const closeAll = () => {
    navContainers.forEach(nc => { nc.classList.remove('show'); nc.setAttribute('aria-hidden','true'); });
    hamburgers.forEach(h => { h.classList.remove('active'); h.setAttribute('aria-expanded','false'); });
  };

  document.addEventListener('pointerdown', (e) => {
    const inside = hamburgers.some(h => h.contains && h.contains(e.target));
    if (!inside) closeAll();
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
})();
