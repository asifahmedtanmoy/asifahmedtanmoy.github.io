// ========== Profile Image Modal (only if exists) ==========
const modal = document.getElementById("imgModal");
const img = document.getElementById("profileImg");
const modalImg = document.getElementById("modalImg");
const closeBtn = document.querySelector(".close");

if (modal && img && modalImg && closeBtn) {
  // Open modal on image click
  img.addEventListener("click", () => {
    modal.style.display = "block";
    modalImg.src = img.src;
  });

  // Close modal when clicking the 'x'
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close modal when clicking outside the image
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
