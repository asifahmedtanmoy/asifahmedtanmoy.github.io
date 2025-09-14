// Enlarge image when clicked
document.addEventListener("DOMContentLoaded", () => {
  const profileImage = document.querySelector(".clickable-image");

  if (profileImage) {
    profileImage.addEventListener("click", () => {
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.background = "rgba(0,0,0,0.8)";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.zIndex = "1000";

      const bigImage = document.createElement("img");
      bigImage.src = profileImage.src;
      bigImage.style.maxWidth = "90%";
      bigImage.style.maxHeight = "90%";
      bigImage.style.borderRadius = "10px";
      bigImage.style.boxShadow = "0 4px 15px rgba(0,0,0,0.5)";

      overlay.appendChild(bigImage);
      document.body.appendChild(overlay);

      // Close overlay on click
      overlay.addEventListener("click", () => {
        document.body.removeChild(overlay);
      });
    });
  }
});
