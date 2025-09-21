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

  // Attach click listener to all current and future images with class 'work-img'
  document.querySelectorAll(".work-img").forEach(img => {
    img.addEventListener("click", () => {
      workModal.style.display = "block";
      workModalImg.src = img.src;
      // Keep caption in alt attribute
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
      content.style.maxHeight = null; // collapse
    } else {
      content.style.maxHeight = content.scrollHeight + "px"; // expand
    }
  });
});
