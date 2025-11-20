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

 /* ---------- Smooth Collapsibles (accessible + buttery animation) ---------- */
document.querySelectorAll('.collapsible').forEach((button) => {
  const content = button.nextElementSibling;
  if (!content) return;

  // Initialize ARIA and state
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('role', 'button');
  button.setAttribute('aria-expanded', String(isExpanded));
  content.setAttribute('aria-hidden', String(!isExpanded));

  // Ensure smooth transition & overflow (CSS already defines transition on max-height)
  content.style.overflow = 'hidden';

  // Smooth open
  const open = () => {
    // get natural height
    const startHeight = content.scrollHeight;
    // set explicit height to kick off transition
    content.style.maxHeight = startHeight + 'px';
    button.classList.add('active');
    button.setAttribute('aria-expanded', 'true');
    content.setAttribute('aria-hidden', 'false');

    // after transition end, clear max-height so content can grow naturally
    const clearMax = () => {
      if (button.getAttribute('aria-expanded') === 'true') {
        content.style.maxHeight = 'none';
      }
      content.removeEventListener('transitionend', clearMax);
    };
    content.addEventListener('transitionend', clearMax);
  };

  // Smooth close
  const close = () => {
    // if maxHeight is 'none', set it to current pixel height first
    const computed = window.getComputedStyle(content).maxHeight;
    if (computed === 'none') {
      content.style.maxHeight = content.scrollHeight + 'px';
      // force reflow
      // eslint-disable-next-line no-unused-expressions
      content.offsetHeight;
    }
    // then collapse to zero
    content.style.maxHeight = '0px';
    button.classList.remove('active');
    button.setAttribute('aria-expanded', 'false');
    content.setAttribute('aria-hidden', 'true');
  };

  // Set initial visual state without abrupt animation on load
  if (isExpanded) {
    content.style.maxHeight = content.scrollHeight + 'px';
    setTimeout(() => { content.style.maxHeight = 'none'; }, 300);
  } else {
    content.style.maxHeight = '0px';
  }

  const toggle = () => {
    const currentlyOpen = button.getAttribute('aria-expanded') === 'true';
    if (currentlyOpen) close(); else open();
  };

  button.addEventListener('click', toggle);
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });

  // Recalculate height on resize while open
  window.addEventListener('resize', () => {
    if (button.getAttribute('aria-expanded') === 'true') {
      if (content.style.maxHeight === 'none' || getComputedStyle(content).maxHeight === 'none') {
        content.style.maxHeight = content.scrollHeight + 'px';
        setTimeout(() => { content.style.maxHeight = 'none'; }, 160);
      } else {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
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
