// script.js (improved)
// - Safe DOM guards
// - Ensures workModal image target is an <img>
// - Adds Escape key to close modals
// - Adds aria-expanded and keyboard handling for collapsibles
// - Consolidates outside-click handlers

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Helpers ---------- */
  const isDescendant = (parent, child) => parent && child && parent.contains(child);

  const closeModal = (modalEl) => {
    if (!modalEl) return;
    modalEl.classList.remove('open');
    modalEl.style.display = '';
    const previous = modalEl._previouslyFocused;
    if (previous && typeof previous.focus === 'function') previous.focus();
  };

  const openModal = (modalEl, focusSelector) => {
    if (!modalEl) return;
    modalEl._previouslyFocused = document.activeElement;
    modalEl.classList.add('open');
    modalEl.style.display = 'block';
    const first = focusSelector ? modalEl.querySelector(focusSelector) : modalEl.querySelector('button, a, input, img');
    if (first && typeof first.focus === 'function') first.focus();
  };

  /* ---------- Profile Image Modal ---------- */
  const modal = document.getElementById('imgModal');
  const img = document.getElementById('profileImg');
  const modalImg = document.getElementById('modalImg');
  const modalClose = modal ? modal.querySelector('.close') : null;

  if (modal && img && modalImg) {
    img.addEventListener('click', () => {
      modalImg.src = img.src || '';
      if ('alt' in img) modalImg.alt = img.alt || '';
      openModal(modal, '.close');
    });
    if (modalClose) modalClose.addEventListener('click', () => closeModal(modal));
  }

  /* ---------- Work Images Modal (Dynamic) ---------- */
  (function() {
    const workModal = document.getElementById('workModal');
    if (!workModal) return;

    let workModalImg = workModal.querySelector('.modal-content img');
    const fallbackContent = workModal.querySelector('.modal-content');
    const workClose = workModal.querySelector('.close');

    const setWorkModalImage = (sourceImg) => {
      if (!workModal) return;
      if (workModalImg && (workModalImg.tagName || '').toLowerCase() === 'img') {
        workModalImg.src = sourceImg.src || '';
        workModalImg.alt = sourceImg.alt || (sourceImg.nextElementSibling ? sourceImg.nextElementSibling.textContent : '');
      } else if (fallbackContent) {
        const imgEl = document.createElement('img');
        imgEl.src = sourceImg.src || '';
        imgEl.alt = sourceImg.alt || '';
        fallbackContent.innerHTML = '';
        fallbackContent.appendChild(imgEl);
        workModalImg = imgEl;
      }
    };

    document.querySelectorAll('.work-img').forEach(w => {
      w.addEventListener('click', () => {
        setWorkModalImage(w);
        openModal(workModal, '.close');
      });
      w.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setWorkModalImage(w);
          openModal(workModal, '.close');
        }
      });
    });

    if (workClose) workClose.addEventListener('click', () => closeModal(workModal));
  })();

/* ---------- Reliable smooth collapsibles (handles hidden + animation) ---------- */
(function(){
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
    if (!content) {
      console.warn('collapsible: no .content found for button ->', button);
      return;
    }

    // Ensure ARIA + keyboard
    if (!button.hasAttribute('role')) button.setAttribute('role', 'button');
    if (!button.hasAttribute('tabindex')) button.setAttribute('tabindex', '0');
    if (!button.hasAttribute('aria-expanded')) button.setAttribute('aria-expanded', 'false');

    // initialize state
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    content.setAttribute('aria-hidden', String(!isExpanded));
    // use max-height transitions, not display:none
    content.style.overflow = 'hidden';
    content.style.transition = content.style.transition || 'max-height 0.28s ease';

    // initial visual state without abrupt animation
    if (isExpanded) {
      content.hidden = false;
      content.style.maxHeight = content.scrollHeight + 'px';
      setTimeout(()=>{ if (button.getAttribute('aria-expanded') === 'true') content.style.maxHeight = 'none'; }, 300);
      button.classList.add('active');
    } else {
      content.style.maxHeight = '0px';
      content.hidden = true;
      button.classList.remove('active');
    }

    // open helper
    const open = () => {
      content.hidden = false;                       // <<< important: make it render
      // force reflow so scrollHeight is accurate
      // eslint-disable-next-line no-unused-expressions
      content.offsetHeight;
      const target = content.scrollHeight;
      content.style.maxHeight = target + 'px';
      button.setAttribute('aria-expanded', 'true');
      content.setAttribute('aria-hidden', 'false');
      button.classList.add('active');

      const after = () => {
        if (button.getAttribute('aria-expanded') === 'true') content.style.maxHeight = 'none';
        content.removeEventListener('transitionend', after);
      };
      content.addEventListener('transitionend', after);
    };

    // close helper
    const close = () => {
      if (getComputedStyle(content).maxHeight === 'none') {
        content.style.maxHeight = content.scrollHeight + 'px';
        // force reflow
        // eslint-disable-next-line no-unused-expressions
        content.offsetHeight;
      }
      content.style.maxHeight = '0px';
      button.setAttribute('aria-expanded', 'false');
      content.setAttribute('aria-hidden', 'true');
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

    // attach events
    button.addEventListener('click', toggle);
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e); }
    });

    // keep height correct on resize if open
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
})();


  /* ---------- Mobile Navigation Toggle ---------- */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navItems = navLinks ? navLinks.querySelectorAll('li a') : [];

  if (hamburger && navLinks) {
    // make hamburger keyboard friendly
    hamburger.setAttribute('tabindex', '0');
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
  }

  /* ---------- Global outside-click and Escape handling ---------- */
  document.addEventListener('click', (event) => {
    const clickTarget = event.target;
    if (navLinks && hamburger) {
      if (!isDescendant(navLinks, clickTarget) && !isDescendant(hamburger, clickTarget)) {
        navLinks.classList.remove('show');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    }

    document.querySelectorAll('.modal.open').forEach(m => {
      const content = m.querySelector('.modal-content') || m.querySelector('.modal-body');
      if (m.classList.contains('open')) {
        if (content && !isDescendant(content, clickTarget) && clickTarget !== content) {
          closeModal(m);
        }
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.open').forEach(m => closeModal(m));
      document.querySelectorAll('.collapsible[aria-expanded="true"]').forEach(btn => {
        btn.click();
      });
    }
  });

});
