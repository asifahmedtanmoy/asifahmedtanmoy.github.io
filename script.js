// ========== Profile Image Modal ==========

// Get modal elements
const modal = document.getElementById("imgModal");
const img = document.getElementById("profileImg");
const modalImg = document.getElementById("modalImg");
const closeBtn = document.getElementsByClassName("close")[0];

// Open modal on image click
img.addEventListener("click", () => {
  modal.style.display = "block";
  modalImg.src = img.src; // show the same image
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

document.addEventListener("DOMContentLoaded", function() {
  const coll = document.querySelectorAll(".collapsible");

  coll.forEach(button => {
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
});




