// Get the current page URL
var currentPageUrl = window.location.href;

// Get all the navigation links
var navLinks = document.querySelectorAll('.hideOnMobile a');

// Loop through each navigation link
navLinks.forEach(function(link) {
// Check if the href attribute of the link matches the current page URL
if (link.href === currentPageUrl) {
// Add a class to mark it as the current page
link.classList.add('current-page');
}
});

    // Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyDUSE8JAAX8CqJPrG8IP7ZaEpm_6X6GwlA",
      authDomain: "my-fairee.firebaseapp.com",
      databaseURL: "https://my-fairee-default-rtdb.firebaseio.com",
      projectId: "my-fairee",
      storageBucket: "my-fairee.appspot.com",
      messagingSenderId: "542574300076",
      appId: "1:542574300076:web:5d0bc675b5416ee06c0809",
      measurementId: "G-MHESMFGND1"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();

    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        populateServiceFormFields();
        // Fetch the user document from Firestore
        db.collection('users').doc(user.uid).get()
          .then((doc) => {
            if (doc.exists) {
              // Document exists, retrieve the addresses field
              const userData = doc.data();
              const userAddresses = userData.addresses;

              // Get the dropdown element
              const addressDropdown = document.getElementById('addressDropdown');

              // Clear existing options
              addressDropdown.innerHTML = '';

              // Add the first address as an option
              const firstOption = document.createElement('option');
              firstOption.value = userAddresses[0];
              firstOption.textContent = userAddresses[0];
              addressDropdown.appendChild(firstOption);

              // Populate the dropdown with remaining addresses
              for (let i = 1; i < userAddresses.length; i++) {
                const option = document.createElement('option');
                option.value = userAddresses[i];
                option.textContent = userAddresses[i];
                addressDropdown.appendChild(option);
              }

              // Add event listener to update search input when address is selected
              addressDropdown.addEventListener('change', function () {
                const selectedAddress = this.value;
                document.getElementById('searchInput').value = selectedAddress;
              });

              // Set the search input value to the first address
              document.getElementById('searchInput').value = userAddresses[0];
            } else {
              // Document does not exist
              console.error('User document does not exist');
              if (confirm("You are not logged in. Do you still want to proceed with kindly register")) {
                // Proceed with registration if the user confirms
                window.location.href = "auth.html";
              } else {
                // Redirect to login or any other appropriate action
                window.location.href = "cover.html";
              }
            }
          })
          .catch((error) => {
            console.error('Error getting user document:', error);
          });
        // Assuming you have a function to check user roles
        checkUserRole(user.uid)
          .then(role => {
            if (role === 'admin' || role === 'parent') {
              // User is authorized, proceed with booking functionality
              enableBookingFunctionality();
            } else {
              // User is not authorized, ask for confirmation before redirecting
              const confirmRedirect = window.confirm('You are not authorized to proceed to the booking page. Do you want to go back to the login?');
              if (confirmRedirect) {
                // Redirect to homepage
                window.location.href = 'auth.html';
              } else {
                // Stay on the current page
                console.error('User is not authorized to proceed.');
                window.location.href = 'cover.html';
              }
            }
          })
          .catch(error => {
            console.error('Error checking user role:', error);
          });
      } else {
        // No user is signed in.
        window.location.href = "auth.html";
      }
    });


    function checkUserRole(userId) {
      // Implement a function to check user roles based on userId
      // For example, query Firestore to get user role
      return new Promise((resolve, reject) => {
        // Example implementation
        db.collection('users').doc(userId).get()
          .then(doc => {
            if (doc.exists) {
              const userData = doc.data();
              const userRole = userData.role; // Assuming role is stored in user data
              resolve(userRole);
            } else {
              reject(new Error('User document not found.'));
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    }

    // Function to handle logout
    function logout() {
      firebase.auth().signOut().then(function () {
        // Sign-out successful.
        console.log("User signed out successfully");
        // Redirect to the login page or any other appropriate action after sign-out
        window.location.href = "./auth.html"; // Assuming auth.html is your login page
      }).catch(function (error) {
        // An error happened.
        console.error("Error signing out: ", error);
      });
    }


    function showSidebar(){
      const sidebar = document.querySelector('.sidebar')
      sidebar.style.display = 'flex'
    }
    function hideSidebar(){
      const sidebar = document.querySelector('.sidebar')
      sidebar.style.display = 'none'
    }

    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const toggle = header.querySelector('.accordion-toggle');
        content.classList.toggle('hidden');
        toggle.classList.toggle('rotate-180');
      });
    });

    // Function to toggle dropdown menu
    document.getElementById('menuIcon').addEventListener('click', function () {
      var dropdownMenu = document.getElementById('dropdownMenu');
      if (dropdownMenu.style.display === 'block') {
        dropdownMenu.style.display = 'none';
      } else {
        dropdownMenu.style.display = 'block';
      }
    });

    // Close the dropdown menu when clicking outside of it
    window.addEventListener('click', function (event) {
      var dropdownMenu = document.getElementById('dropdownMenu');
      var menuIcon = document.getElementById('menuIcon');
      if (event.target !== dropdownMenu && event.target !== menuIcon) {
        dropdownMenu.style.display = 'none';
      }
    });

    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Function to handle logout
function logout() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        console.log("User signed out successfully");
        // Redirect to the login page or any other appropriate action after sign-out
        window.location.href = "./auth.html"; // Assuming auth.html is your login page
    }).catch(function(error) {
        // An error happened.
        console.error("Error signing out: ", error);
    });
}

  firebase.auth().onAuthStateChanged(function(user) {
if (user) {
  // User is logged in, proceed with role-based redirection
  const userId = user.uid;
  db.collection("users").doc(userId).get().then((doc) => {
      if (doc.exists) {
          const userRole = doc.data().role;
          switch (userRole) {
              case "parent":
                  break;
              case "admin":
                  break;
                  default:
                    // If user role is neither 'parent' nor 'admin', show confirmation dialog
                    const confirmation = window.confirm("You are not authorized to access this page. Do you want to proceed to the authentication page?");
                    if (confirmation) {
                        window.location.href = "cover.html"; // Redirect to authentication page
                    } else {
                        logout(); // Redirect to cover page
                    }
                    break;
          }
      } else {
          console.log("No such document!");
      }
  }).catch((error) => {
      console.log("Error getting document:", error);
  });
} else {
  // No user is logged in, redirect to authentication page
  window.location.href = "auth.html";
}
});

// Function to handle logout
function logout() {
    // Display a confirmation dialog
    if (confirm("Are you sure you want to log out?")) {
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
            console.log("User signed out successfully");
            // Redirect to the login page or any other appropriate action after sign-out
            window.location.href = "./auth.html"; // Assuming auth.html is your login page
        }).catch(function(error) {
            // An error happened.
            console.error("Error signing out: ", error);
        });
    }
}