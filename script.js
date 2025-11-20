/* =====================================================================
   Unified script.js
   - Profile image modal (scoped)
   - Unified gallery modal (supports multiple thumbnail classes; creates modal if missing)
   - Smooth collapsibles
   - Mobile hamburger nav
   ===================================================================== */

/* ------------ PROFILE IMAGE MODAL (scoped to #imgModal) -------------- */
(function profileModal() {
  const modal = document.getElementById('imgModal');
  const img = document.getElementById('profileImg');
  const modalImg = document.getElementById('modalImg');
  if (!modal || !img || !modalImg) return;

  const closeBtn = modal.querySelector('.close'); // scoped close inside imgModal
  const openProfile = () => {
    modal._previouslyFocused = document.activeElement;
    modal.classList.add('open');
    modal.style.display = 'block';
    modalImg.src = img.src || '';
    modalImg.alt = img.alt || '';
    if (closeBtn) closeBtn.focus();
  };
  const closeProfile = () => {
    modal.classList.remove('open');
    modal.style.display = '';
    const prev = modal._previouslyFocused;
    if (prev && typeof prev.focus === 'function') prev.focus();
  };

  img.addEventListener('click', openProfile);
  img.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProfile(); }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeProfile);
  window.addEventListener('click', (e) => { if (e.target === modal) closeProfile(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeProfile(); });
})();

/* ------------ UNIFIED GALLERY MODAL (create if missing) ------------- */
(function galleryModal() {
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

  let galleryModalEl = document.getElementById('workModal');
  if (!galleryModalEl) galleryModalEl = makeGalleryModal();

  // scoped elements
  const overlay = galleryModalEl.querySelector('.modal-overlay');
  const shell = galleryModalEl.querySelector('.modal-shell');
  const modalImg = galleryModalEl.querySelector('.modal-img');
  const modalCaption = galleryModalEl.querySelector('.modal-caption');
  const closeBtn = galleryModalEl.querySelector('.close');
  const prevBtn = galleryModalEl.querySelector('.modal-nav.prev');
  const nextBtn = galleryModalEl.querySelector('.modal-nav.next');

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

    // fade in after load
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
      galleryModalEl._previouslyFocused = e.currentTarget;
      openAt(idx, e.currentTarget);
    });

    imgEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        galleryModalEl._previouslyFocused = e.currentTarget;
        openAt(idx, e.currentTarget);
      }
    });
  });

  // controls
  if (closeBtn) closeBtn.addEventListener('click', closeGallery);
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

  // overlay / outside click closes
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
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;

  const navItems = navLinks.querySelectorAll('li a');

  hamburger.setAttribute('tabindex','0');
  hamburger.setAttribute('aria-expanded','false');

  const toggle = () => {
    const active = hamburger.classList.toggle('active');
    navLinks.classList.toggle('show', active);
    hamburger.setAttribute('aria-expanded', String(active));
  };

  hamburger.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  hamburger.addEventListener('keydown', (e) => { if (e.key==='Enter' || e.key===' ') { e.preventDefault(); toggle(); } });

  navItems.forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('show');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded','false');
  }));

  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      navLinks.classList.remove('show');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded','false');
    }
  });
})();
