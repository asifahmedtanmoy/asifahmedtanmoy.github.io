/* ============================================================
   PROFILE IMAGE MODAL (Home Page)
   ============================================================ */
const modal = document.getElementById("imgModal");
const img = document.getElementById("profileImg");
const modalImg = document.getElementById("modalImg");
const closeBtn = document.querySelector(".close");

if (modal && img && modalImg && closeBtn) {
  img.addEventListener("click", () => {
    modal.classList.add("open");
    modalImg.src = img.src;
  });

  closeBtn.addEventListener("click", () => modal.classList.remove("open"));

  window.addEventListener("click", (event) => {
    if (event.target === modal) modal.classList.remove("open");
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") modal.classList.remove("open");
  });
}

/* ============================================================
   GLOBAL GALLERY MODAL (Projects + Work Experiences)
   ============================================================ */

(function () {
  const galleryModal = document.querySelector("#workModal");
  if (!galleryModal) return;

  const overlay = galleryModal.querySelector(".modal-overlay");
  const shell = galleryModal.querySelector(".modal-shell");
  const imgBox = galleryModal.querySelector(".modal-img");
  const captionBox = galleryModal.querySelector(".modal-caption");
  const closeButton = galleryModal.querySelector(".close");
  const prevButton = galleryModal.querySelector(".prev");
  const nextButton = galleryModal.querySelector(".next");

  // All clickable gallery images
  const images = Array.from(document.querySelectorAll(".gallery-img"));
  let currentIndex = 0;

  const openGalleryModal = (index) => {
    currentIndex = index;
    const src = images[index].getAttribute("src");
    const caption = images[index].dataset.caption || "";

    imgBox.style.opacity = "0";
    imgBox.src = src;

    overlay.classList.add("visible");
    shell.classList.add("visible");
    galleryModal.classList.add("open");

    setTimeout(() => {
      imgBox.style.opacity = "1";
    }, 100);

    captionBox.textContent = caption;
  };

  const closeGalleryModal = () => {
    overlay.classList.remove("visible");
    shell.classList.remove("visible");
    galleryModal.classList.remove("open");
  };

  const showNext = () => {
    currentIndex = (currentIndex + 1) % images.length;
    openGalleryModal(currentIndex);
  };

  const showPrev = () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    openGalleryModal(currentIndex);
  };

  // Click on image → open modal
  images.forEach((image, idx) => {
    image.addEventListener("click", () => openGalleryModal(idx));
  });

  // Close button
  closeButton.addEventListener("click", closeGalleryModal);

  // Click outside modal
  overlay.addEventListener("click", closeGalleryModal);

  // Arrow navigation
  nextButton.addEventListener("click", (e) => {
    e.stopPropagation();
    showNext();
  });
  prevButton.addEventListener("click", (e) => {
    e.stopPropagation();
    showPrev();
  });

  // Keyboard navigation
  window.addEventListener("keydown", (e) => {
    if (!galleryModal.classList.contains("open")) return;
    if (e.key === "Escape") closeGalleryModal();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  });
})();

/* ============================================================
   SMOOTH COLLAPSIBLES (Accessible + Animated)
   ============================================================ */

(function () {
  const findNextContent = (startEl) => {
    let el = startEl.nextElementSibling;
    while (el) {
      if (el.classList && el.classList.contains("content")) return el;
      el = el.nextElementSibling;
    }
    return null;
  };

  const buttons = Array.from(document.querySelectorAll(".collapsible"));
  buttons.forEach((button) => {
    const content = findNextContent(button);
    if (!content) return;

    button.setAttribute("role", "button");
    button.setAttribute("tabindex", "0");

    if (!button.hasAttribute("aria-expanded"))
      button.setAttribute("aria-expanded", "false");

    const isExpanded = button.getAttribute("aria-expanded") === "true";
    content.setAttribute("aria-hidden", String(!isExpanded));
    content.style.overflow = "hidden";

    // Initialize
    if (isExpanded) {
      content.hidden = false;
      content.style.maxHeight = content.scrollHeight + "px";
      setTimeout(() => {
        if (button.getAttribute("aria-expanded") === "true")
          content.style.maxHeight = "none";
      }, 300);
      button.classList.add("active");
    } else {
      content.style.maxHeight = "0px";
      content.hidden = true;
      button.classList.remove("active");
    }

    const open = () => {
      content.hidden = false;
      content.offsetHeight;
      content.style.maxHeight = content.scrollHeight + "px";

      button.setAttribute("aria-expanded", "true");
      content.setAttribute("aria-hidden", "false");
      button.classList.add("active");

      const clearMax = () => {
        if (button.getAttribute("aria-expanded") === "true") {
          content.style.maxHeight = "none";
        }
        content.removeEventListener("transitionend", clearMax);
      };
      content.addEventListener("transitionend", clearMax);
    };

    const close = () => {
      if (getComputedStyle(content).maxHeight === "none") {
        content.style.maxHeight = content.scrollHeight + "px";
        content.offsetHeight;
      }

      content.style.maxHeight = "0px";
      button.classList.remove("active");
      button.setAttribute("aria-expanded", "false");
      content.setAttribute("aria-hidden", "true");

      const hideAfter = () => {
        if (button.getAttribute("aria-expanded") === "false") content.hidden = true;
        content.removeEventListener("transitionend", hideAfter);
      };
      content.addEventListener("transitionend", hideAfter);
    };

    const toggle = () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      if (expanded) close();
      else open();
    };

    button.addEventListener("click", toggle);

    button.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });

    // Resize handling
    window.addEventListener("resize", () => {
      if (button.getAttribute("aria-expanded") === "true") {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });
})();

/* ============================================================
   MOBILE NAVIGATION
   ============================================================ */

const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links li a");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("show");
  });

  navItems.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("show");
      hamburger.classList.remove("active");
    });
  });

  window.addEventListener("click", (event) => {
    if (!navLinks.contains(event.target) && !hamburger.contains(event.target)) {
      navLinks.classList.remove("show");
      hamburger.classList.remove("active");
    }
  });
}
