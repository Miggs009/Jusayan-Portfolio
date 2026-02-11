function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}


// ===============================
// RESEARCH MODAL SYSTEM
// ===============================

// Get modal elements
const modal = document.getElementById("research-modal");
const iframe = document.getElementById("research-iframe");
const closeBtn = document.getElementById("research-close");

// -------------------------------
// Open Research
// -------------------------------
function openResearch(url) {
  iframe.src = url;
  modal.classList.add("show");
  document.body.style.overflow = "hidden"; // prevent background scroll
}

// -------------------------------
// Close Research
// -------------------------------
function closeResearch() {
  modal.classList.remove("show");

  // Delay clearing iframe for animation smoothness
  setTimeout(() => {
    iframe.src = "";
  }, 300);

  document.body.style.overflow = "auto";
}

// Close button click
closeBtn.addEventListener("click", closeResearch);

// Click outside modal to close
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeResearch();
  }
});

// ESC key to close
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeResearch();
  }
});

// -------------------------------
// Attach buttons automatically
// -------------------------------
document.querySelectorAll(".research-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const url = btn.getAttribute("data-url");
    openResearch(url);
  });
});

// -------------------------------
// Swipe Down to Close (Mobile)
// -------------------------------
let touchStartY = 0;
let touchEndY = 0;

modal.addEventListener("touchstart", (e) => {
  touchStartY = e.changedTouches[0].screenY;
});

modal.addEventListener("touchend", (e) => {
  touchEndY = e.changedTouches[0].screenY;

  // If swipe down more than 100px
  if (touchEndY - touchStartY > 100) {
    closeResearch();
  }
});
