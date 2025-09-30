// ========== Profile Image Modal (Home Page) ==========
const modal = document.getElementById("imgModal");
const img = document.getElementById("profileImg");
const modalImg = document.getElementById("modalImg");
const closeBtn = document.querySelector(".close");

if (modal && img && modalImg && closeBtn) {
  img.addEventListener("click", () => {
    modal.style.display = "block";
    modalImg.src = img.src;
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}

// ========== Work Images Modal (Dynamic) ==========
(function() {
  const workModal = document.getElementById("workModal");
  const workModalImg = workModal ? workModal.querySelector(".modal-content") : null;
  const workCloseBtn = workModal ? workModal.querySelector(".close") : null;

  if (!workModal || !workModalImg || !workCloseBtn) return;

  document.querySelectorAll(".work-img").forEach(img => {
    img.addEventListener("click", () => {
      workModal.style.display = "block";
      workModalImg.src = img.src;
      workModalImg.alt = img.nextElementSibling ? img.nextElementSibling.textContent : "";
    });
  });

  workCloseBtn.addEventListener("click", () => {
    workModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === workModal) {
      workModal.style.display = "none";
    }
  });
})();

// ========== Collapsible Buttons ==========
document.querySelectorAll(".collapsible").forEach(button => {
  button.addEventListener("click", function() {
    this.classList.toggle("active");
    const content = this.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});

// ========== Mobile Navigation Toggle ==========
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links li a");

if (hamburger && navLinks) {
  // Toggle menu
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("show");
  });

  // Auto-close when clicking a link
  navItems.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("show");
      hamburger.classList.remove("active");
    });
  });

  // Auto-close when clicking outside the menu
  window.addEventListener("click", (event) => {
    if (!navLinks.contains(event.target) && !hamburger.contains(event.target)) {
      navLinks.classList.remove("show");
      hamburger.classList.remove("active");
    }
  });
}
