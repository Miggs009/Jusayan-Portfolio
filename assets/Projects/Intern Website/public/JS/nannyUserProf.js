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

    // Firebase configuration
    const firebaseConfig = {
    apiKey: "AIzaSyDUSE8JAAX8CqJPrG8IP7ZaEpm_6X6GwlA",
    authDomain: "my-fairee.firebaseapp.com",
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

    // Function to fetch and display user profile data
    function displayUserProfile(user) {
    if (user) {
        // User is signed in, get their user ID
        const currentUserID = user.uid;

        // Reference to the user document in Firestore
        const userRef = db.collection("users").doc(currentUserID);

        // Fetch the user document
        userRef.get().then((doc) => {
            if (doc.exists) {
                // Retrieve user data from the document
                const userData = doc.data();

                // Populate HTML elements with user data
                document.getElementById("profileName").textContent = `${userData.firstName} ${userData.middleName} ${userData.lastName}`;
                document.getElementById("profEmail").textContent = userData.email;
                document.getElementById("profGender").textContent = userData.gender;
                document.getElementById("profPhoneNumber").textContent = userData.phoneNumber;

                // Address details
                const addressList = document.getElementById("profAddresses");
                addressList.innerHTML = ""; // Clear previous addresses if any
                const addressHTML = `<li>${userData.houseNo}, ${userData.barangay}, ${userData.city}, ${userData.province}, ${userData.region}</li>`;
                addressList.insertAdjacentHTML("beforeend", addressHTML);

                // Other details like date of birth
                // Assuming you have an element with id 'dob' to display date of birth
                document.getElementById("dob").textContent = userData.dob;
            } else {
                console.log("No such document!");
                if (confirm("You are not logged in. Do you still want to proceed with registration?")) {
                    // Proceed with registration if the user confirms
                    window.location.href = "auth.html";
                } else {
                    // Redirect to login or any other appropriate action
                    window.location.href = "cover.html";
                }
            }
        }).catch((error) => {
            console.error("Error getting document:", error);
        });
    } else {
        console.log("No user is currently signed in.");
    }
}

// Call the function to display user profile when the page loads
auth.onAuthStateChanged(displayUserProfile);

// Debugging: Log authentication state changes
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("User is signed in:", user.uid);
    } else {
        console.log("No user is currently signed in.");
    }
});

// Function to fetch and populate edit profile input fields with user data from Firestore
function populateEditProfileFields(user) {
    if (user) {
        // User is signed in, get their user ID
        const currentUserID = user.uid;

        // Reference to the user document in Firestore
        const userRef = db.collection("users").doc(currentUserID);

        // Fetch the user document
        userRef.get().then((doc) => {
            if (doc.exists) {
                // Retrieve user data from the document
                const userData = doc.data();

                // Populate edit profile input fields with user data
                document.getElementById("firstName").value = userData.firstName;
                document.getElementById("middleName").value = userData.middleName;
                document.getElementById("lastName").value = userData.lastName;
                document.getElementById("houseNo").value = userData.houseNo;
                document.getElementById("barangay").value = userData.barangay;
                document.getElementById("city").value = userData.city;
                document.getElementById("province").value = userData.province;
                document.getElementById("region").value = userData.region;
                document.getElementById("phone_no").value = userData.phoneNumber;
                
            } else {
                console.log("No such document!");
            }
        }).catch((error) => {
            console.error("Error getting document:", error);
        });
    } else {
        console.log("No user is currently signed in.");
    }
}

// Call the function to populate edit profile fields when the page loads
auth.onAuthStateChanged(populateEditProfileFields);

    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    firebase.auth().onAuthStateChanged(function(user) {
if (user) {
    // User is logged in, proceed with role-based redirection
    const userId = user.uid;
    db.collection("users").doc(userId).get().then((doc) => {
        if (doc.exists) {
            const userRole = doc.data().role;
            switch (userRole) {
                case "nanny":
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

    document.getElementById("editProfileForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission behavior
    
    // Gather updated profile data from form fields
    const updatedData = {
        firstName: document.getElementById("firstName").value,
        middleName: document.getElementById("middleName").value,
        lastName: document.getElementById("lastName").value,
        houseNo: document.getElementById("houseNo").value,
        barangay: document.getElementById("barangay").value,
        city: document.getElementById("city").value,
        province: document.getElementById("province").value,
        region: document.getElementById("region").value,
        phoneNumber: document.getElementById("phone_no").value
    };

    // Validation regular expression allowing comma, period, and hyphen
    const symbolRegex = /^[a-zA-Z0-9,. -]*$/;

    // Loop through updatedData object and validate each field
    for (const key in updatedData) {
        if (Object.hasOwnProperty.call(updatedData, key)) {
            const value = updatedData[key];
            const inputField = document.getElementById(key);

            // Check if input is empty or contains symbols not allowed
            if (!value.trim() || !symbolRegex.test(value)) {
                alert(`Please enter a valid value for ${key}`);
                return; // Prevent form submission if validation fails
            }
        }
    }

    // Phone number validation
    const phoneRegex = /^09[0-9]{9}$/;
    const phone_no = updatedData.phoneNumber.trim(); // Get trimmed phone number

    // Check if phone number is empty
    if (!phone_no) {
        alert('Please enter your phone number');
        return;
    }

    // Check if phone number includes '+63'
    if (phone_no.includes('+63')) {
        alert('Please enter a valid Phone Number without +63');
        return;
    }

    // Check if phone number matches the format 09154713982
    if (!phoneRegex.test(phone_no)) {
        alert('Please enter a valid 11 digit phone number');
        return;
    }


    // Get current user
    const user = firebase.auth().currentUser;

    // Update user document in Firestore
    if (user) {
        const currentUserID = user.uid;
        const userRef = db.collection("users").doc(currentUserID);

        userRef.update(updatedData)
            .then(() => {
                console.log("Document successfully updated!");
                // Optionally, provide user feedback that the changes were saved
                location.reload()
            })
            .catch((error) => {
                console.error("Error updating document: ", error);
                // Optionally, provide user feedback about the error
            });
    } else {
        console.log("No user is currently signed in.");
        // Optionally, provide user feedback that they need to sign in
    }
});
document.addEventListener("DOMContentLoaded", function() {
    // Get references to the buttons
    var deleteAccountBtn = document.getElementById("deleteAccountBtn");
    var cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    var saveBtn = document.getElementById("save");

    // Add click event listener to the delete button
    deleteAccountBtn.addEventListener("click", function() {
        // Perform validation here
        if (confirm("Are you sure you want to delete your account?")) {
            // If the user confirms, proceed with account deletion
            deleteAccount();
        }
    });

    // Add click event listener to the cancel delete button
    cancelDeleteBtn.addEventListener("click", function() {
        // Hide the cancel delete button
        cancelDeleteBtn.style.display = "none";
        // Show the delete button
        deleteAccountBtn.style.display = "inline-block";
    });

    // Add click event listener to the save button
    saveBtn.addEventListener("click", function() {
        // Perform save changes action here
        // For example, saveChanges();
    });

// Function to delete the account
function deleteAccount() {
    // Get current user
    var user = firebase.auth().currentUser;

    // Reference to the user document in Firestore
    var userDocRef = db.collection("users").doc(user.uid);

    // Delete user document in Firestore
    userDocRef.delete().then(function() {
        // Document successfully deleted
        console.log("User document deleted successfully");

        // Delete user account
        user.delete().then(function() {
            // Account deleted successfully
            console.log("Account deleted successfully");
            // Redirect user to the authentication page
            window.location.href = "auth.html";
        }).catch(function(error) {
            // An error occurred while deleting the account
            console.error("Error deleting account: ", error);
            // Display error message to the user or handle the error appropriately
        });
    }).catch(function(error) {
        // An error occurred while deleting the user document
        console.error("Error deleting user document: ", error);
        // Display error message to the user or handle the error appropriately
    });
}

});
