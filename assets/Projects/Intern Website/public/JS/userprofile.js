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

    // Function to add delete icon/button for each address
function addDeleteIcons() {
  const addressFieldsDiv = document.getElementById('addressFields');
  const addressInputs = addressFieldsDiv.querySelectorAll('.address');
  addressInputs.forEach((addressInput, index) => {
    const deleteIcon = document.createElement('span');
    deleteIcon.className = 'delete-icon';
    deleteIcon.innerHTML = '&#x2716;'; // Unicode for "cross mark" symbol
    deleteIcon.setAttribute('data-address-index', index);
    addressInput.insertAdjacentElement('afterend', deleteIcon);
  });
}

// Add event listener to delete address buttons/icons
document.addEventListener('click', function(event) {
  if (event.target && event.target.classList.contains('delete-icon')) {
    const addressIndex = event.target.getAttribute('data-address-index');
    confirmDelete(addressIndex);
  }
});

// Function to delete address
function deleteAddress(index) {
  const addressElement = document.getElementById('addressField-' + index);
  addressElement.parentNode.removeChild(addressElement);
}

// Function to confirm deletion of address
function confirmDelete(index) {
  const confirmation = confirm("Are you sure you want to delete this address?");
  if (confirmation) {
    deleteAddress(index);
  }
}

// Function to add a new address field dynamically
function addNewAddressField() {
    const addressFieldsDiv = document.getElementById('addressFields');

    // Get the value of the new address input field
    const newAddressValue = document.getElementById("addressField-" + (addressFieldsDiv.querySelectorAll('.address').length - 1)).value;

    // Check if the last address field is not empty before adding a new one
    if (newAddressValue.trim() === "") {
        alert("Please enter a valid address before adding another.");
        return;
    }

    const newAddressLabel = document.createElement("label");
    const index = addressFieldsDiv.querySelectorAll('.address').length;
    newAddressLabel.setAttribute("for", "address" + index);
    newAddressLabel.classList.add("addressLabel");
    newAddressLabel.innerText = "Address " + (index + 1) + ":";

    const newAddressInput = document.createElement("input");
    newAddressInput.type = "text";
    newAddressInput.classList.add("address");
    newAddressInput.id = "addressField-" + index;

    addressFieldsDiv.appendChild(newAddressLabel);
    addressFieldsDiv.appendChild(newAddressInput);
    addressFieldsDiv.appendChild(document.createElement("br"));
}


    // Event listener for the "Add Another Address" button
    document.getElementById("addAddressBtn").addEventListener("click", function(event) {
        event.preventDefault(); // Prevent default form submission behavior
        addNewAddressField();
    });

    // Edit Profile Form Submission
    document.getElementById("editProfileForm").addEventListener("submit", function(event) {
        event.preventDefault();
      });

// Function to capitalize the first letter of each word
function capitalizeFirstLetter(str) {
  return str.replace(/\b\w/g, function(char) {
    return char.toUpperCase();
  });
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    const userId = user.uid;
    db.collection("users").doc(userId).get().then((doc) => {
      if (doc.exists) {
        const userData = doc.data();

        // Capitalize the first letter of each word in the name
        const capitalizedUserName = capitalizeFirstLetter(userData.name || '');

        // Populate user data into profile card
        document.getElementById("profileName").innerText = capitalizedUserName;
        document.getElementById("profileEmail").innerText = userData.email || '';
        document.getElementById("profilePhoneNumber").innerText = userData.phone_no || '';
        // Populate name and phone number fields in edit profile form
        document.getElementById("name").value = userData.name || '';
        document.getElementById("phone_no").value = userData.phone_no || ''; // Add this line

        // Populate addresses into profile card
        const profileAddressesList = document.getElementById("profileAddresses");
        profileAddressesList.innerHTML = ''; // Clear existing addresses
        if (userData.addresses && userData.addresses.length > 0) {
          userData.addresses.forEach(address => {
            const li = document.createElement("li");
            li.innerText = address;
            profileAddressesList.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.innerText = "No addresses provided";
          profileAddressesList.appendChild(li);
        }

        // Pre-fill address fields with current user addresses
        const addressFieldsDiv = document.getElementById("addressFields");
        addressFieldsDiv.innerHTML = ''; // Clear existing fields
        if (userData.addresses && userData.addresses.length > 0) {
          userData.addresses.forEach((address, index) => {
            const newAddressLabel = document.createElement("label");
            newAddressLabel.setAttribute("for", "address" + index);
            newAddressLabel.classList.add("addressLabel");
            newAddressLabel.innerText = "Address " + (index + 1) + ":";
            const newAddressInput = document.createElement("input");
            newAddressInput.type = "text";
            newAddressInput.classList.add("address");
            newAddressInput.id = "addressField-" + index;
            newAddressInput.value = address;
            addressFieldsDiv.appendChild(newAddressLabel);
            addressFieldsDiv.appendChild(newAddressInput);
            addressFieldsDiv.appendChild(document.createElement("br"));
          });
          addDeleteIcons(); // Add delete icons/buttons for existing addresses
        } else {
          const newAddressLabel = document.createElement("label");
          newAddressLabel.setAttribute("for", "address0");
          newAddressLabel.classList.add("addressLabel");
          newAddressLabel.innerText = "Address 1:";
          const newAddressInput = document.createElement("input");
          newAddressInput.type = "text";
          newAddressInput.classList.add("address");
          newAddressInput.id = "addressField-0"; // Assign id for easier deletion
          addressFieldsDiv.appendChild(newAddressLabel);
          addressFieldsDiv.appendChild(newAddressInput);
          addressFieldsDiv.appendChild(document.createElement("br"));
        }

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
      console.log("Error getting document:", error);
    });
  } else {
    console.log("No user is signed in.");
    // Handle the case where no user is signed in, e.g., redirect to login page
  }
});


// Edit Profile Form Submission
document.getElementById("editProfileForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission

    // Get updated profile data from form
    const name = document.getElementById("name").value.trim();
    const phone_no = document.getElementById("phone_no").value;
    const addresses = [];
    const addressInputs = document.querySelectorAll('.address');

    // Regular expression for phone number validation
    const phoneRegex = /^09[0-9]{9}$/;

    // Regular expression for address validation
    const addressRegex = /^[a-zA-Z0-9\s.,]+$/;


        // Check if name is valid (1 word and spaces, alphanumeric characters including numbers, no repeated characters)
        const nameRegex = /^(?!.*(.)(?:.*\1){2})[A-Za-z0-9\s.]*$/;

    if (!nameRegex.test(name)) {
        alert("Please enter a valid name without symbols or repeated characters.");
        return;
    }


    // Check if phone number is valid
    if (!phoneRegex.test(phone_no)) {
        alert("Please enter a valid phone number starting with 09 followed by 9 digits.");
        return;
    }

    // Check if any address field is not empty and valid
    let addressFieldNotEmpty = false;
    addressInputs.forEach(input => {
        const addressValue = input.value.trim();
        if (addressValue !== "" && addressRegex.test(addressValue)) {
            // Check if address contains at least one comma
            if (addressValue.includes(",")) {
                addresses.push(addressValue);
                addressFieldNotEmpty = true;
            } else {
                alert("Please enter a valid full address.");
                return;
            }
        } else {
            alert("Please enter a valid full address.");
            return;
        }
    });

    if (!addressFieldNotEmpty) {
        alert("Please enter at least one valid address.");
        return;
    }

    // Construct updated data object
    const updatedData = {
        name: name,
        phone_no: phone_no,
        addresses: addresses
    };

    // Update user data in Firestore
    const user = firebase.auth().currentUser;
    if (user) {
        const userId = user.uid;
        db.collection("users").doc(userId).update(updatedData)
            .then(() => {
                console.log("User data updated successfully!");
                location.reload();
            })
            .catch((error) => {
                console.error("Error updating user data:", error);
            });
    } else {
        console.log("No user is signed in.");
    }
});



// Function to handle account deletion request
document.getElementById("deleteAccountBtn").addEventListener("click", function(event) {
    event.preventDefault(); // Prevent default form submission behavior
    const user = firebase.auth().currentUser;
    if (user) {
        const confirmation = confirm("Are you sure you want to delete your account? The Deletion will take 12hrs before Completely deleted.");
        if (confirmation) {
            const userId = user.uid;
            const userRef = db.collection("users").doc(userId);
            userRef.update({ deletionRequestTime: firebase.firestore.FieldValue.serverTimestamp() })
                .then(() => {
                    console.log("Account deletion requested.");
                    document.getElementById("deleteAccountBtn").style.display = "none";
                    document.getElementById("cancelDeleteBtn").style.display = "inline-block"; // Show the "Cancel" button
                })
                .catch((error) => {
                    console.error("Error updating deletion request:", error);
                });
        } else {
            console.log("Account deletion cancelled by user.");
        }
    } else {
        console.log("No user is signed in.");
    }
});

// Function to cancel account deletion request
document.getElementById("cancelDeleteBtn").addEventListener("click", function(event) {
    event.preventDefault(); // Prevent default form submission behavior
    const user = firebase.auth().currentUser;
    if (user) {
        const userId = user.uid;
        const userRef = db.collection("users").doc(userId);
        userRef.update({ deletionRequestTime: firebase.firestore.FieldValue.delete() })
            .then(() => {
                console.log("Deletion request cancelled.");
                document.getElementById("deleteAccountBtn").style.display = "inline-block"; // Show the "Delete" button
                document.getElementById("cancelDeleteBtn").style.display = "none"; // Hide the "Cancel" button
            })
            .catch((error) => {
                console.error("Error cancelling deletion request:", error);
            });
    } else {
        console.log("No user is signed in.");
    }
});

    // Get the button element
var moveableButton = document.getElementById("moveableButton");

// Function to redirect based on user role
function redirectToPage() {
  // Get the currently signed-in user
  const user = firebase.auth().currentUser;
  
  if (user) {
    // Get the user's ID
    const userId = user.uid;
    
    // Get the user's document from Firestore
    db.collection("users").doc(userId).get().then((doc) => {
      if (doc.exists) {
        // Retrieve the user's role from the document data
        const userRole = doc.data().role;
        
        // Redirect based on the user's role
        switch (userRole) {
          case "nanny":
            window.location.href = "./chattingwithparent.html"; // Redirect to nanny page
            break;
          case "parent":
            window.location.href = "./chattingwithnanny.html"; // Redirect to parent page
            break;
          case "admin":
            window.location.href = "admin.html"; // Redirect to admin page
            break;
          default:
            console.log("Unknown role:", userRole);
            break;
        }
      } else {
        console.log("No such document!");
      }
    }).catch((error) => {
      console.log("Error getting document:", error);
    });
  } else {
    console.log("No user is signed in.");
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

