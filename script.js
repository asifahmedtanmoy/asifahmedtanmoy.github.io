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

// ========== Work Page Images Modal ==========
const workImages = document.querySelectorAll(".work-images img");
const workModal = document.getElementById("imgModal"); // Reusing the same modal
const workModalImg = document.getElementById("modalImg");

workImages.forEach(img => {
  img.addEventListener("click", () => {
    workModal.style.display = "block";
    workModalImg.src = img.src;
  });
});
