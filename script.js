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

  /* ---------- Collapsibles (accessible) ---------- */
  document.querySelectorAll('.collapsible').forEach((button) => {
    const content = button.nextElementSibling;
    if (!content) return;
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('role', 'button');
    button.setAttribute('aria-expanded', String(expanded));
    content.hidden = !(expanded);

    if (!content.style.transition) {
      content.style.transition = 'max-height 0.28s ease';
      content.style.overflow = 'hidden';
    }

    const setOpen = (open) => {
      button.classList.toggle('active', open);
      button.setAttribute('aria-expanded', String(open));
      if (open) {
        content.hidden = false;
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = '0px';
        window.setTimeout(() => { content.hidden = true; }, 300);
      }
    };

    if (expanded) {
      content.style.maxHeight = content.scrollHeight + 'px';
    } else {
      content.style.maxHeight = '0px';
    }

    const toggle = () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      setOpen(!isOpen);
    };

    button.addEventListener('click', toggle);
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });

    window.addEventListener('resize', () => {
      if (button.getAttribute('aria-expanded') === 'true') {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

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
