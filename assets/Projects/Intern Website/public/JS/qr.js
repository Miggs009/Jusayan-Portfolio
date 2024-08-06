document.getElementById("open-modal").addEventListener("click", function() {
  document.getElementById("modal").style.display = "block";
});

document.getElementById("close-modal").addEventListener("click", function() {
  document.getElementById("modal").style.display = "none";
  window.location.href = "bookinghistory.html"; // Redirect to bookinghistory.html
});

document.getElementById("doneBtn").addEventListener("click", function() {
  document.getElementById("myModal2").style.display = "block";
});

document.getElementById("close-modal2").addEventListener("click", function() {
  document.getElementById("myModal2").style.display = "none";
  document.getElementById("modal").style.display = "none";
  window.location.href = "bookinghistory.html"; // Redirect to bookinghistory.html
});

window.onclick = function(event) {
  if (event.target == document.getElementById("modal")) {
      document.getElementById("modal").style.display = "none";
      window.location.href = "bookinghistory.html"; // Redirect to bookinghistory.html
  } else if (event.target == document.getElementById("myModal2")) {
      document.getElementById("myModal2").style.display = "none";
      document.getElementById("modal").style.display = "none";
      window.location.href = "bookinghistory.html"; // Redirect to bookinghistory.html
  }
}
