function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

const floatingToggle=document.getElementById("floating-toggle");
const floatingNav = document.getElementById("floating-nav");
floatingToggle.addEventListener("click",()=>{floatingNav.classList.toggle("show");});

document.addEventListener("click", () => {
  floatingNav.classList.toggle("show");
  floatingToggle.innerHTML = floatingNav.classList.contains("show") ? '&#9205;':'&#9204;';
});
