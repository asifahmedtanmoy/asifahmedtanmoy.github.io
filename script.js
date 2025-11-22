/* =====================================================================
   Unified script.js
   - Profile image modal (scoped)
   - Unified gallery modal (supports multiple thumbnail classes; creates modal if missing)
   - Smooth collapsibles
   - Mobile hamburger nav (robust, supports onclick="toggleMenu(this)")
   ===================================================================== */

/* ------------ PROFILE IMAGE MODAL (scoped to #imgModal) -------------- */
(function profileModal() {
  const modal = document.getElementById('imgModal');
  const img = document.getElementById('profileImg');
  const modalImg = document.getElementById('modalImg');
  if (!modal || !img || !modalImg) return;

  const closeBtn = modal.querySelector('.close'); // scoped close inside imgModal
  const overlay = modal.querySelector('.modal-overlay');
  const shell = modal.querySelector('.modal-shell');

  const openProfile = () => {
    modal._previouslyFocused = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'block';
    if (shell) shell.classList.add('visible');
    if (overlay) overlay.classList.add('visible');
    modalImg.src = img.src || '';
    modalImg.alt = img.alt || '';
    if (closeBtn) closeBtn.focus();
  };

  const closeProfile = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = '';
    if (shell) shell.classList.remove('visible');
    if (overlay) overlay.classList.remove('visible');
    const prev = modal._previouslyFocused;
    if (prev && typeof prev.focus === 'function') prev.focus();
  };

  img.addEventListener('click', openProfile);
  img.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProfile(); }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeProfile);
  if (overlay) overlay.addEventListener('click', closeProfile);

  // legacy: clicking directly on the modal container closes if target equals modal
  window.addEventListener('click', (e) => { if (e.target === modal) closeProfile(); });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeProfile(); });
})();

/* ------------ UNIFIED GALLERY MODAL (create if missing) ------------- */
(function galleryModal() {
  try {
    // helper to create the standard gallery modal HTML
    function makeGalleryModal() {
      const container = document.createElement('div');
      container.id = 'workModal';
      container.className = 'modal';
      container.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-shell" role="dialog" aria-modal="true" aria-label="Image gallery">
          <button class="modal-nav prev" aria-label="Previous image">‹</button>
          <div class="modal-body">
            <img class="modal-img" src="" alt="">
            <div class="modal-caption" aria-live="polite"></div>
          </div>
          <button class="modal-nav next" aria-label="Next image">›</button>
          <button class="close" aria-label="Close image modal">&times;</button>
        </div>
      `;
      document.body.appendChild(container);
      return container;
    }

    // find existing modal or create one
    let galleryModalEl = document.getElementById('workModal');
    if (!galleryModalEl) galleryModalEl = makeGalleryModal();

    // scoped elements (guarded)
    let overlay = galleryModalEl.querySelector('.modal-overlay');
    let shell = galleryModalEl.querySelector('.modal-shell');
    let modalImg = galleryModalEl.querySelector('.modal-img');
    let modalCaption = galleryModalEl.querySelector('.modal-caption');
    let closeBtn = galleryModalEl.querySelector('.close');
    let prevBtn = galleryModalEl.querySelector('.modal-nav.prev');
    let nextBtn = galleryModalEl.querySelector('.modal-nav.next');

    // if any of these critical elements are missing, abort gracefully
    if (!overlay || !shell || !modalImg) return;

    // Collect thumbnails from multiple possible classes so both pages work
    const thumbSelector = '.gallery-img, .work-img, .gallery-thumb, .work-thumb';
    const thumbs = Array.from(document.querySelectorAll(thumbSelector));

    // if no thumbs anywhere, nothing to wire
    if (!thumbs.length) return;

    // helper: get caption from data-caption, figcaption or alt
    const getCaption = (imgEl) => {
      if (!imgEl) return '';
      if (imgEl.dataset && imgEl.dataset.caption) return imgEl.dataset.caption;
      const fig = imgEl.closest('figure');
      const fc = fig ? fig.querySelector('figcaption') : null;
      if (fc && fc.textContent.trim()) return fc.textContent.trim();
      return imgEl.alt || '';
    };

    let currentIndex = 0;

    // open at index
    const openAt = (index, opener) => {
      currentIndex = (index + thumbs.length) % thumbs.length;
      const thumb = thumbs[currentIndex];
      const src = thumb.getAttribute('data-full') || thumb.src;
      const caption = getCaption(thumb);

      // store opener element to restore focus
      galleryModalEl._previouslyFocused = opener || document.activeElement;

      // show modal
      galleryModalEl.classList.add('open');
      shell.classList.add('visible');
      overlay.classList.add('visible');

      // set image + caption (fade in)
      modalImg.style.opacity = '0';
      modalImg.src = src;
      modalImg.alt = thumb.alt || '';
      modalCaption.textContent = caption;

      // focus close button for keyboard users
      if (closeBtn) closeBtn.focus();

      // fade in after load (guard the onload)
      modalImg.onload = () => { requestAnimationFrame(()=>{ modalImg.style.opacity = '1'; }); };
    };

    const closeGallery = () => {
      shell.classList.remove('visible');
      overlay.classList.remove('visible');
      modalImg.style.opacity = '0';
      setTimeout(() => {
        galleryModalEl.classList.remove('open');
        const prev = galleryModalEl._previouslyFocused;
        if (prev && typeof prev.focus === 'function') prev.focus();
      }, 220);
    };

    const showPrev = () => openAt(currentIndex - 1, galleryModalEl._previouslyFocused);
    const showNext = () => openAt(currentIndex + 1, galleryModalEl._previouslyFocused);

    // wire thumbnails (click + keyboard)
    thumbs.forEach((imgEl, idx) => {
      if (!imgEl.hasAttribute('tabindex')) imgEl.setAttribute('tabindex', '0');

      imgEl.addEventListener('click', (e) => {
        e.preventDefault();
        // defensive: if gallery modal element was removed after page load recreate it
        if (!document.getElementById('workModal')) {
          galleryModalEl = makeGalleryModal();
          // re-query scoped elements (the new modal)
          overlay = galleryModalEl.querySelector('.modal-overlay');
          shell = galleryModalEl.querySelector('.modal-shell');
          modalImg = galleryModalEl.querySelector('.modal-img');
          modalCaption = galleryModalEl.querySelector('.modal-caption');
          closeBtn = galleryModalEl.querySelector('.close');
          prevBtn = galleryModalEl.querySelector('.modal-nav.prev');
          nextBtn = galleryModalEl.querySelector('.modal-nav.next');
        }
        galleryModalEl._previouslyFocused = e.currentTarget;
        openAt(idx, e.currentTarget);
      });

      imgEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!document.getElementById('workModal')) {
            galleryModalEl = makeGalleryModal();
            overlay = galleryModalEl.querySelector('.modal-overlay');
            shell = galleryModalEl.querySelector('.modal-shell');
            modalImg = galleryModalEl.querySelector('.modal-img');
            modalCaption = galleryModalEl.querySelector('.modal-caption');
            closeBtn = galleryModalEl.querySelector('.close');
            prevBtn = galleryModalEl.querySelector('.modal-nav.prev');
            nextBtn = galleryModalEl.querySelector('.modal-nav.next');
          }
          galleryModalEl._previouslyFocused = e.currentTarget;
          openAt(idx, e.currentTarget);
        }
      });
    });

    // controls (guarded)
    if (closeBtn) closeBtn.addEventListener('click', closeGallery);
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

    // overlay / outside click closes (guard for overlay)
    overlay.addEventListener('click', closeGallery);
    galleryModalEl.addEventListener('click', (e) => {
      if (!shell.contains(e.target)) closeGallery();
    });

    // keyboard navigation while open
    document.addEventListener('keydown', (e) => {
      if (!galleryModalEl.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); closeGallery(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); showPrev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); showNext(); }
    });

  } catch (err) {
    // fail gracefully and report to console for debugging
    console.error('Gallery modal initialization failed:', err);
  }
})(); // end gallery modal block


/* ---------------- SMOOTH COLLAPSIBLES (accessible) ------------------ */
(function collapsibles() {
  const findNextContent = (startEl) => {
    let el = startEl.nextElementSibling;
    while (el) {
      if (el.classList && el.classList.contains('content')) return el;
      el = el.nextElementSibling;
    }
    return null;
  };

  const buttons = Array.from(document.querySelectorAll('.collapsible'));
  buttons.forEach((button) => {
    const content = findNextContent(button);
    if (!content) return;

    if (!button.hasAttribute('role')) button.setAttribute('role', 'button');
    if (!button.hasAttribute('tabindex')) button.setAttribute('tabindex', '0');
    if (!button.hasAttribute('aria-expanded')) button.setAttribute('aria-expanded', 'false');

    // initial state
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    content.setAttribute('aria-hidden', String(!isExpanded));
    content.style.overflow = 'hidden';
    content.style.transition = 'max-height 0.28s cubic-bezier(.22,.9,.32,1)';
    content.style.willChange = 'max-height';

    if (isExpanded) {
      content.hidden = false;
      content.style.maxHeight = content.scrollHeight + 'px';
      // after expand finish, let it be flexible
      content.addEventListener('transitionend', function _openEnd(e) {
        if (e.propertyName === 'max-height' && button.getAttribute('aria-expanded') === 'true') {
          content.style.maxHeight = 'none';
        }
        content.removeEventListener('transitionend', _openEnd);
      });
      button.classList.add('active');
    } else {
      content.style.maxHeight = '0px';
      content.hidden = true;
      button.classList.remove('active');
    }

    const open = () => {
      // make visible
      content.hidden = false;
      // force a computed pixel start value to ensure a clean transition
      content.style.maxHeight = content.scrollHeight + 'px';
      // allow the browser to paint and then clear to 'none' after completed
      requestAnimationFrame(() => {
        // if the element was previously 'none', keep it numeric for the animation
        content.style.maxHeight = content.scrollHeight + 'px';
      });

      button.setAttribute('aria-expanded','true');
      content.setAttribute('aria-hidden','false');
      button.classList.add('active');

      const onEnd = (e) => {
        if (e.propertyName !== 'max-height') return;
        if (button.getAttribute('aria-expanded') === 'true') {
          content.style.maxHeight = 'none';
        }
        content.removeEventListener('transitionend', onEnd);
      };
      content.addEventListener('transitionend', onEnd);
    };

    const close = () => {
      // If currently 'none', set it to actual height so collapse animates
      const computedMax = getComputedStyle(content).maxHeight;
      if (computedMax === 'none') {
        // set to current pixel height to create a numeric starting point
        content.style.maxHeight = content.scrollHeight + 'px';
        // force reflow to lock that value
        void content.offsetHeight;
      }

      // Now collapse: ensure we start from a pixel height (already set), then set to 0
      // Use rAF to ensure the style change is separated into a new frame so transition runs
      requestAnimationFrame(() => {
        // Small extra rAF helps in some browsers to ensure the transition is triggered
        requestAnimationFrame(() => {
          content.style.maxHeight = '0px';
        });
      });

      button.setAttribute('aria-expanded','false');
      content.setAttribute('aria-hidden','true');
      button.classList.remove('active');

      const onEndHide = (e) => {
        if (e.propertyName !== 'max-height') return;
        // only hide after the collapse finished
        if (button.getAttribute('aria-expanded') === 'false') content.hidden = true;
        content.removeEventListener('transitionend', onEndHide);
      };
      content.addEventListener('transitionend', onEndHide);
    };

    const toggle = (e) => {
      if (e && (e.target.tagName === 'A' || e.target.closest && e.target.closest('a'))) return;
      const cur = button.getAttribute('aria-expanded') === 'true';
      if (cur) close(); else open();
    };

    button.addEventListener('click', toggle);
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e); }
    });

    // on window resize keep open content flexible without jump
    window.addEventListener('resize', () => {
      if (button.getAttribute('aria-expanded') === 'true') {
        // temporarily set numeric height then allow 'none' after repaint
        content.style.maxHeight = content.scrollHeight + 'px';
        requestAnimationFrame(() => {
          content.style.maxHeight = 'none';
        });
      }
    });
  });
})(); // end collapsibles




/* --------------------- MOBILE NAV (hamburger) ----------------------- */
(function mobileNav() {
  const hamburgers = Array.from(document.querySelectorAll('.hamburger'));
  const navLinksPrimary = document.querySelector('.nav-links');
  const navContainers = navLinksPrimary ? [navLinksPrimary] : Array.from(document.querySelectorAll('[data-nav], .nav-links'));

  if (!hamburgers.length || !navContainers.length) {
    window.toggleMenu = window.toggleMenu || function () { return false; };
    return;
  }

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

  const isInsideHamburger = (node) => {
    try {
      return hamburgers.some(h => h && h.contains && h.contains(node));
    } catch (e) {
      return false;
    }
  };

  const toggle = (control) => {
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

    // pointerdown: DO NOT preventDefault() — that can stop some browsers from registering the tap properly
    hamburger.addEventListener('pointerdown', (e) => {
      e.stopPropagation();            // prevent immediate document handler from closing
      // don't call e.preventDefault() here
      console.log('hamburger pointerdown'); // tiny debug to confirm handler fires on mobile (remove if desired)
      toggle(hamburger);
    });

    // touchstart fallback for older devices that may not support pointer events
    hamburger.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      // don't preventDefault so the accessibility/tap behaviour remains native
      toggle(hamburger);
    }, { passive: true });

    // click fallback
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle(hamburger);
    }, { passive: true });

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

  const handleNavClick = (e) => {
    navContainers.forEach(nc => {
      nc.classList.remove('show');
      nc.setAttribute('aria-hidden', 'true');
    });
    hamburgers.forEach(h => { h.classList.remove('active'); h.setAttribute('aria-expanded','false'); });
  };

  const attachNavItems = () => {
    navItems = getNavItems();
    navItems.forEach(a => {
      a.addEventListener('click', handleNavClick, { passive: true });
    });
  };
  attachNavItems();

  document.addEventListener('pointerdown', (e) => {
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

  const observer = new MutationObserver((mutations) => {
    let refresh = false;
    for (const m of mutations) {
      if (m.addedNodes.length || m.removedNodes.length) { refresh = true; break; }
    }
    if (refresh) attachNavItems();
  });

  try {
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (e) { /* ignore */ }

})();
