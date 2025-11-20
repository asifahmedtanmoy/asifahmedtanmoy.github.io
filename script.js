// script.js - complete updated file
// Features:
// - Profile image modal (#imgModal / #profileImg / #modalImg)
// - Work images gallery modal (#workModal created if missing) with prev/next and keyboard
// - Smooth, robust collapsibles (accessible)
// - Mobile hamburger nav toggle with keyboard support
// - Graceful focus management and Esc handling

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Helpers ---------- */
  const isDescendant = (parent, child) => parent && child && parent.contains(child);

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ========== PROFILE IMAGE MODAL (home) ========== */
  (function profileModalBlock(){
    const modal = document.getElementById('imgModal');
    const img = document.getElementById('profileImg');
    const modalImg = document.getElementById('modalImg');
    const closeBtn = modal ? modal.querySelector('.close') : null;

    if (!modal || !img || !modalImg || !closeBtn) return;

    const openProfile = () => {
      modal._previouslyFocused = document.activeElement;
      modal.classList.add('open');
      modal.style.display = 'block';
      modalImg.src = img.src || '';
      modalImg.alt = img.alt || '';
      // focus the close button for accessibility
      closeBtn.focus();
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

    closeBtn.addEventListener('click', closeProfile);

    // click outside to close (click on modal background)
    window.addEventListener('click', (e) => {
      if (e.target === modal) closeProfile();
    });

    // Esc to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeProfile();
      }
    });
  })();


  /* ========== WORK IMAGES GALLERY MODAL (dynamic, prev/next, keyboard) ========== */
  // We'll create or reuse #workModal
  (function galleryModalBlock() {
    // global variable so other handlers can check if gallery is open
    let workModal = document.getElementById('workModal');

    if (!workModal) {
      workModal = document.createElement('div');
      workModal.id = 'workModal';
      workModal.className = 'modal';
      workModal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-shell" role="dialog" aria-modal="true" aria-label="Image gallery">
          <button class="close" aria-label="Close image modal">&times;</button>
          <button class="modal-nav prev" aria-label="Previous image">‹</button>
          <div class="modal-body">
            <img class="modal-img" src="" alt="">
            <div class="modal-caption" aria-live="polite"></div>
          </div>
          <button class="modal-nav next" aria-label="Next image">›</button>
        </div>
      `;
      document.body.appendChild(workModal);
    }

    // Elements
    const overlay = qs('.modal-overlay', workModal);
    const modalShell = qs('.modal-shell', workModal);
    const modalImg = qs('.modal-img', workModal);
    const modalCaption = qs('.modal-caption', workModal);
    const closeBtn = qs('.close', workModal);
    const prevBtn = qs('.modal-nav.prev', workModal);
    const nextBtn = qs('.modal-nav.next', workModal);

    // gallery thumbnails
    const gallery = qsa('.work-img');
    if (gallery.length === 0) return; // nothing to do

    const getCaption = (imgEl) => {
      if (!imgEl) return '';
      if (imgEl.dataset && imgEl.dataset.caption) return imgEl.dataset.caption;
      const fig = imgEl.closest('figure');
      const figcap = fig ? fig.querySelector('figcaption') : null;
      if (figcap && figcap.textContent.trim()) return figcap.textContent.trim();
      return imgEl.alt || '';
    };

    let currentIndex = 0;

    const openAt = (index, openerEl) => {
      currentIndex = (index + gallery.length) % gallery.length;
      const thumb = gallery[currentIndex];
      const src = thumb.getAttribute('data-full') || thumb.src;

      // store opener for focus restore
      workModal._previouslyFocused = openerEl || document.activeElement;

      // show modal with fade logic
      workModal.classList.add('open');
      modalShell.classList.add('visible');
      overlay.classList.add('visible');

      // prepare image
      modalImg.style.opacity = 0;
      modalImg.src = src;
      modalImg.alt = thumb.alt || '';
      modalCaption.textContent = getCaption(thumb);

      // focus close for accessibility
      closeBtn.focus();

      modalImg.onload = () => {
        // fade in
        requestAnimationFrame(() => { modalImg.style.opacity = 1; });
      };
    };

    const closeGallery = () => {
      modalShell.classList.remove('visible');
      overlay.classList.remove('visible');
      modalImg.style.opacity = 0;
      setTimeout(() => {
        workModal.classList.remove('open');
        // restore focus to opener
        const prev = workModal._previouslyFocused;
        if (prev && typeof prev.focus === 'function') prev.focus();
      }, 220);
    };

    const showPrev = () => openAt(currentIndex - 1, workModal._previouslyFocused);
    const showNext = () => openAt(currentIndex + 1, workModal._previouslyFocused);

    // wire thumbnails (click + keyboard)
    gallery.forEach((imgEl, idx) => {
      if (!imgEl.hasAttribute('tabindex')) imgEl.setAttribute('tabindex', '0');

      imgEl.addEventListener('click', (e) => {
        workModal._previouslyFocused = e.currentTarget;
        openAt(idx, e.currentTarget);
      });

      imgEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          workModal._previouslyFocused = e.currentTarget;
          openAt(idx, e.currentTarget);
        }
      });
    });

    // controls
    closeBtn.addEventListener('click', closeGallery);
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

    // clicking overlay or outside shell closes
    overlay.addEventListener('click', closeGallery);
    workModal.addEventListener('click', (e) => {
      if (!modalShell.contains(e.target)) closeGallery();
    });

    // keyboard navigation (Esc, arrows)
    document.addEventListener('keydown', (e) => {
      if (!workModal.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); closeGallery(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); showPrev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); showNext(); }
    });

  })(); // end gallery modal block


  /* ========== Smooth collapsibles (tuned for buttery open/close) ========== */
  (function collapsiblesBlock(){
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

      if (!button.hasAttribute('role')) button.setAttribute('role','button');
      if (!button.hasAttribute('tabindex')) button.setAttribute('tabindex','0');
      if (!button.hasAttribute('aria-expanded')) button.setAttribute('aria-expanded','false');

      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      content.setAttribute('aria-hidden', String(!isExpanded));
      content.style.overflow = 'hidden';
      content.style.transition = 'max-height 0.35s cubic-bezier(.22,.9,.32,1)';

      if (isExpanded) {
        content.hidden = false;
        content.style.maxHeight = content.scrollHeight + 'px';
        setTimeout(()=>{ if (button.getAttribute('aria-expanded')==='true') content.style.maxHeight = 'none'; }, 380);
        button.classList.add('active');
      } else {
        content.style.maxHeight = '0px';
        content.hidden = true;
        button.classList.remove('active');
      }

      const open = () => {
        content.hidden = false;
        // force reflow
        // eslint-disable-next-line no-unused-expressions
        content.offsetHeight;
        content.style.maxHeight = content.scrollHeight + 'px';
        button.setAttribute('aria-expanded','true');
        content.setAttribute('aria-hidden','false');
        button.classList.add('active');

        const onEnd = () => {
          if (button.getAttribute('aria-expanded') === 'true') content.style.maxHeight = 'none';
          content.removeEventListener('transitionend', onEnd);
        };
        content.addEventListener('transitionend', onEnd);
      };

      const close = () => {
        if (getComputedStyle(content).maxHeight === 'none') {
          content.style.maxHeight = content.scrollHeight + 'px';
          // force reflow
          // eslint-disable-next-line no-unused-expressions
          content.offsetHeight;
        }
        content.style.maxHeight = '0px';
        button.setAttribute('aria-expanded','false');
        content.setAttribute('aria-hidden','true');
        button.classList.remove('active');

        const onEndHide = () => {
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

      window.addEventListener('resize', () => {
        if (button.getAttribute('aria-expanded') === 'true') {
          if (content.style.maxHeight === 'none' || getComputedStyle(content).maxHeight === 'none') {
            content.style.maxHeight = content.scrollHeight + 'px';
            setTimeout(()=>{ content.style.maxHeight = 'none'; }, 160);
          } else {
            content.style.maxHeight = content.scrollHeight + 'px';
          }
        }
      });
    });
  })(); // end collapsiblesBlock


  /* ========== Mobile Navigation Toggle ========== */
  (function mobileNavBlock(){
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = navLinks ? navLinks.querySelectorAll('li a') : [];

    if (!hamburger || !navLinks) return;

    // ensure keyboard friendly
    hamburger.setAttribute('tabindex','0');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-controls', 'navList');

    const toggleNav = () => {
      const isActive = hamburger.classList.toggle('active');
      navLinks.classList.toggle('show', isActive);
      hamburger.setAttribute('aria-expanded', String(isActive));
    };

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNav();
    });

    hamburger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleNav();
      }
    });

    navItems.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('show');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // close nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!isDescendant(navLinks, e.target) && !isDescendant(hamburger, e.target)) {
        navLinks.classList.remove('show');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  })();


  /* ========== Small global keyboard fallback: Escape closes profile & gallery modals ========== */
  (function globalEscHandler(){
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      // close profile modal if open
      const imgModal = document.getElementById('imgModal');
      if (imgModal && imgModal.classList.contains('open')) {
        const closeBtn = qs('#imgModal .close');
        if (closeBtn) closeBtn.click();
        return;
      }
      // close gallery if open
      const workModal = document.getElementById('workModal');
      if (workModal && workModal.classList.contains('open')) {
        const closeBtn = qs('#workModal .close');
        if (closeBtn) closeBtn.click();
        return;
      }
      // otherwise collapse any open collapsible (optional)
      const openBtn = document.querySelector('.collapsible[aria-expanded="true"]');
      if (openBtn) openBtn.click();
    });
  })();

}); // end DOMContentLoaded
