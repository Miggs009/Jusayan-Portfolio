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

function showSidebar(){
    const sidebar = document.querySelector('.sidebar')
    sidebar.style.display = 'flex'
  }
  function hideSidebar(){
    const sidebar = document.querySelector('.sidebar')
    sidebar.style.display = 'none'
  }

  // Initialize Firebase
  const firebaseConfig = {
      apiKey: "AIzaSyDUSE8JAAX8CqJPrG8IP7ZaEpm_6X6GwlA",
      authDomain: "my-fairee.firebaseapp.com",
      projectId: "my-fairee",
      storageBucket: "my-fairee.appspot.com",
      messagingSenderId: "542574300076",
      appId: "1:542574300076:web:5d0bc675b5416ee06c0809",
      measurementId: "G-MHESMFGND1"
  };
  firebase.initializeApp(firebaseConfig);

  const db = firebase.firestore();
  const auth = firebase.auth();

  firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
          // User is signed in.
          // Check the user's role
          db.collection('users').doc(user.uid).get()
              .then((doc) => {
                  if (doc.exists) {
                      const userData = doc.data();
                      if (userData.role === 'manager') {
                          // Allow manager users to access user management
                          initializeUserManagement();
                          // Show admin elements
                          document.getElementById('adminElementsContainer').style.display = 'block';
                          
                      } else if (userData.role === 'admin') {
                          // Redirect admin users to admin.html
                          alert(`You cannot access this page you need to be a manager`);
                          window.location.href = "admin.html";
                      } else {
                          // Redirect nanny or parent users to cover.html
                          window.location.href = "cover.html";
                      }
                  } else {
                      console.error('User data not found');
                  }
              })
              .catch((error) => {
                  console.error('Error getting user data:', error);
              });
      } else {
          // User is not signed in. Redirect to login page.
          window.location.href = './auth.html';
      }
  });

  

  // Function to initialize user management
  function initializeUserManagement() {
      const userListContainer = document.getElementById('userList');

      // Function to fetch and display users
      function displayUsers(roleFilter) {
          // Clear previous user list
          userListContainer.innerHTML = '';

          // Query users collection based on role filter
          let query = db.collection('users');
          if (roleFilter !== 'all') {
              query = query.where('role', '==', roleFilter);
          }

          // Get users and display in user list
          query.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                  const userData = doc.data();
                  const userBox = document.createElement('div');
                  userBox.classList.add('user-box');
                  // Convert timestamp to a human-readable format
                  const registeredDate = userData.registration_timestamp ? new Date(userData.registration_timestamp.seconds * 1000 + (8 * 3600 * 1000)) : null;
                  const formattedDate = registeredDate ? registeredDate.toLocaleString('en-US', { timeZone: 'UTC' }) : 'N/A';
                  
                  
                  userBox.innerHTML = `
                  <div class="user-info">
                          ${userData.role === 'nanny' ? `
                                  <strong>Name:</strong> ${userData.firstName} ${userData.lastName} ${userData.middleName}<br>
                              ` : `
                                  <strong>Name:</strong> ${userData.name || ''}<br>
                              `}
                          <strong>Email:</strong> ${userData.email}<br>
                          <strong>Role:</strong> <span class="user-role">${userData.role}</span><br>
                          <strong>Registered Date:</strong> <span class="user-role">${formattedDate}</span><br>
                          
                      </div>
                      <!-- Dropdown for changing user role -->
                      <select class="role-dropdown" data-user-id="${doc.id}">
                          <option value="nanny" ${userData.role === 'nanny' ? 'selected' : ''}>Nanny</option>
                          <option value="parent" ${userData.role === 'parent' ? 'selected' : ''}>Parent</option>
                          <option value="admin" ${userData.role === 'admin' ? 'selected' : ''}>Admin</option>
                          <option value="manager" ${userData.role === 'manager' ? 'selected' : ''}>Manager</option>
                      </select>
                      <button class="save-button" data-user-id="${doc.id}">Save Changes</button>
                  `;
                  userListContainer.appendChild(userBox);
              });
          }).catch((error) => {
              console.error('Error getting users:', error);
          });
      }

      // Display users initially with role filter set to "all"
      displayUsers('all');

      // Add event listener for role filter change
      document.getElementById('roleFilter').addEventListener('change', function() {
          const selectedRole = this.value;
          displayUsers(selectedRole);
      });

      // Add event listener for save button click
      userListContainer.addEventListener('click', function(event) {
          if (event.target.classList.contains('save-button')) {
              const userId = event.target.getAttribute('data-user-id');
              const userBox = event.target.closest('.user-box');
              const roleDropdown = userBox.querySelector('.role-dropdown');
              const newRole = roleDropdown.value;

              // Update user role in Firestore
              db.collection('users').doc(userId).update({
                  role: newRole
              }).then(() => {
                  console.log(`User role updated: ${userId} -> ${newRole}`);

                  // Update the displayed user's role in the DOM
                  const userRoleElement = userBox.querySelector('.user-role');
                  userRoleElement.textContent = newRole; // Update the role text

                  // Display success alert
                   alert(`User role successfully updated to: ${newRole}`);
              }).catch((error) => {
                  console.error('Error updating user role:', error);
              });
          }
      });

  }

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

