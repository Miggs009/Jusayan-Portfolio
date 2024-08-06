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

function showSidebar() {
    const sidebar = document.querySelector('.sidebar')
    sidebar.style.display = 'flex'
}

function hideSidebar() {
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
const storage = firebase.storage()

const storageRef = firebase.storage().ref();

document.getElementById("submit").addEventListener("click", function() {
  // Ensure user is authenticated
  if (!auth.currentUser) {
    console.error("User not authenticated.");
    return;
  }

  // Call validation function to check for errors
  validateInputs();

  // Check if any validation errors exist
  const errorElements = document.querySelectorAll('.text-danger');
  for (let i = 0; i < errorElements.length; i++) {
    if (errorElements[i].textContent !== "") {
      console.log("Validation error exists. Form submission halted.");
      return; // Stop further execution if validation error found
    }
  }

  // Check for empty fields
  const emptyFields = [];
  const inputs = [
    "firstName", "middleName", "lastName", "dob",
    "phoneNumber", "houseNo", "barangay", "city",
    "province", "region", "height", "religion", "pod"
  ];

  inputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    const value = input.value.trim();
    const warningElement = document.getElementById(`${inputId}-warning`);

    if (value === "") {
      emptyFields.push(inputId);
      warningElement.textContent = "This field is required."; // Display warning for empty field
    } else {
      warningElement.textContent = ""; // Clear warning if field is not empty
    }
  });

  // If there are empty fields, stop further execution
  if (emptyFields.length > 0) {
    return;
  }

  // Get input values
  const firstName = document.getElementById("firstName").value;
  const middleName = document.getElementById("middleName").value;
  const lastName = document.getElementById("lastName").value;
  const suffix = document.getElementById("sel1Suffix").value;
  const gender = document.getElementById("sel1Gender").value;
  const dob = document.getElementById("dob").value;
  const pod = document.getElementById("pod").value;
  const sel1cs = document.getElementById("sel1cs").value;
  const height = document.getElementById("height").value;
  const religion = document.getElementById("religion").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const houseNo = document.getElementById("houseNo").value;
  const barangay = document.getElementById("barangay").value;
  const city = document.getElementById("city").value;
  const province = document.getElementById("province").value;
  const region = document.getElementById("region").value;
  const idFile = document.getElementById("C1customFile").files[0]; // Get the selected ID file
  const clearanceFile = document.getElementById("C2customFile").files[0]; // Get the selected clearance file

  // Reference to Firebase Storage
  const storageRef = firebase.storage().ref();

  // Fetch existing values of idPhotoURL and clearanceURL from Firestore
  db.collection("users").doc(auth.currentUser.uid).get()
    .then(doc => {
      if (doc.exists) {
        const data = doc.data();
        const existingIdPhotoURL = data.idPhotoURL || "";
        const existingClearanceURL = data.clearanceURL || "";

        // Ask for confirmation if the user wants to change the stored idPhotoURL
        if (existingIdPhotoURL && idFile) {
          if (!confirm("You already have a stored ID photo. Are you sure you want to change it?")) {
            return; // Stop further execution if the user chooses not to change
          }
        }

        // Ask for confirmation if the user wants to change the stored clearanceURL
        if (existingClearanceURL && clearanceFile) {
          if (!confirm("You already have a stored clearance document. Are you sure you want to change it?")) {
            return; // Stop further execution if the user chooses not to change
          }
        }

        // Upload ID photo to Firebase Storage and get download URL
        const idUploadTask = uploadFileAndGetURL(storageRef, idFile);

        // Upload clearance photo to Firebase Storage and get download URL
        const clearanceUploadTask = uploadFileAndGetURL(storageRef, clearanceFile);

        // Handle successful upload and URL retrieval for both ID and clearance files
        Promise.all([idUploadTask, clearanceUploadTask])
          .then(([idDownloadURL, clearanceDownloadURL]) => {
            // Add data to Firestore
            return db.collection("users").doc(auth.currentUser.uid).set({
              email: auth.currentUser.email,
              uid: auth.currentUser.uid,
              firstName: firstName,
              middleName: middleName,
              lastName: lastName,
              suffix: suffix,
              gender: gender,
              dob: dob,
              pod: pod,
              sel1cs: sel1cs,
              height: height,
              religion: religion,
              phoneNumber: phoneNumber,
              houseNo: houseNo,
              barangay: barangay,
              city: city,
              province: province,
              region: region,
              idPhotoURL: idDownloadURL || existingIdPhotoURL, // Store ID download URL in Firestore or keep existing value
              clearanceURL: clearanceDownloadURL || existingClearanceURL, // Store clearance download URL in Firestore or keep existing value
              role: "nanny", // Add role (nanny) to form data
              accountstatus: "For Verification",
              registration_timestamp: firebase.firestore.FieldValue.serverTimestamp() // Add registration timestamp
            });
          })
          .then(() => {
            console.log("Document successfully written.");
            window.location.href = "nannybooking.html";
          })
          .catch((error) => {
            console.error("Error writing document: ", error);
          });
      } else {
        console.error("No such document!");
      }
    })
    .catch(error => {
      console.error("Error fetching document: ", error);
    });
});

// Function to upload file to Firebase Storage and get download URL
function uploadFileAndGetURL(storageRef, file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(""); // Resolve with empty string if no file is provided
    } else {
      // Upload file to Firebase Storage
      const uploadTask = storageRef.child('images/' + file.name).put(file);

      // Handle successful file upload
      uploadTask.then(snapshot => {
        console.log('File uploaded successfully');
        // Get download URL of the uploaded file
        return snapshot.ref.getDownloadURL();
      })
      .then(downloadURL => {
        resolve(downloadURL); // Resolve with the download URL
      })
      .catch(error => {
        console.error("Error uploading file: ", error);
        reject(error); // Reject with the error
      });
    }
  });
}



    
// Function to fetch user data and populate the form
function populateForm() {
  const userRef = db.collection("users").doc(auth.currentUser.uid);

  userRef.get().then((doc) => {
      if (doc.exists) {
          const userData = doc.data();
          // Populate the input fields with existing data
          document.getElementById("firstName").value = userData.firstName || '';
          document.getElementById("middleName").value = userData.middleName || '';
          document.getElementById("lastName").value = userData.lastName || '';
          document.getElementById("sel1Suffix").value = userData.suffix || '';
          document.getElementById("sel1Gender").value = userData.gender || '';
          document.getElementById("dob").value = userData.dob || '';
          document.getElementById("pod").value = userData.pod || '';
          document.getElementById("sel1cs").value = userData.sel1cs || '';
          document.getElementById("height").value = userData.height || '';
          document.getElementById("religion").value = userData.religion || '';
          document.getElementById("phoneNumber").value = userData.phoneNumber || '';
          document.getElementById("houseNo").value = userData.houseNo || '';
          document.getElementById("barangay").value = userData.barangay || '';
          document.getElementById("city").value = userData.city || '';
          document.getElementById("province").value = userData.province || '';
          document.getElementById("region").value = userData.region || '';
          // You may need to handle file input separately
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
}

// Call populateForm function when the user authentication state changes
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
      // User is signed in, so populate the form
      populateForm();
  } else {
      console.error("User not authenticated.");
  }
});


function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
      // User is logged in, proceed with role-based redirection
      const storageRef = firebase.storage().ref();
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

// Add this function for input validation
function validateInputs() {
  const inputs = [
      "firstName", "middleName", "lastName", "dob",
      "phoneNumber", "houseNo", "barangay", "city",
      "province", "region", "height", "religion", "pod"
  ];

  // Define valid religions
  const validReligions = ["Christianity", "Islam", "Buddhism", "Hinduism", "Judaism", "Catholic", "Other"];

   inputs.forEach(inputId => {
      const input = document.getElementById(inputId);
      const value = input.value.trim(); // Trim value to remove leading and trailing whitespaces
      let errorMessage = "";
  
      // Validate each input based on its ID
      switch (inputId) {
        case "firstName":
          // Validate against letters only
          if (value !== "" && !/^[a-zA-Z\s]+$/.test(value)) {
            errorMessage = "Please enter a valid First Name";
          }          
          break;
        case "middleName":
          // Validate against letters only
          if (value !== "" && !/^[a-zA-Z\s]+$/.test(value)) {
            errorMessage = "Please enter a valid Middle Name";
          }          
          break;
        case "lastName":
          // Validate against letters only
          if (value !== "" && !/^[a-zA-Z\s]+$/.test(value)) {
            errorMessage = "Please enter a valid Last Name";
          }          
          break;
        case "dob":
            if (value === "") {
              errorMessage = "Please enter your date of birth.";
          }
          break;
        case "houseNo":
          if (value === "") {
            errorMessage = "Please enter your House Number";
        }
        break;
        case "barangay":
          if (value === "") {
            errorMessage = "Please enter your Barangay";
        }
        break;
        case "city":
          if (value === "") {
            errorMessage = "Please enter your City";
        }
        case "province":
          if (value === "") {
            errorMessage = "Please enter your Province";
        }
        break;

        case "region":
          if (value === "") {
            errorMessage = "Please enter your Region";
        }
        // Adjust the case for 'dob' to 'height' in the switch statement
        case "height":
            // Validate height not exceeding 8 feet
            const maxHeightFeet = 8;
            const heightValue = parseInt(value); // Assuming the input is in feet
            if (value !== "" && heightValue > maxHeightFeet) {
                errorMessage = "Please enter a height not exceeding 8 feet.";
            }
            break;

        case "religion":
          // Validate against valid religions
          if (value !== "" && !validReligions.includes(value)) {
            errorMessage = "Please enter a religion: Christianity, Islam, Buddhism, Hinduism, Judaism, Catholic, Other";
        }
        break;

        case "pod":
          // Validate against allowed characters including numbers
          if (value !== "" && !/^[a-zA-Z0-9,. -]+$/.test(value)) {
            errorMessage = "Please enter a valid location";
          }
          break;
        case "phoneNumber":
          // Validate phone number separately
          const phoneRegex = /^09[0-9]{9}$/;
          if (value !== "" && !phoneRegex.test(value)) {
            errorMessage = "Please enter a valid 11-digit phone number starting with 09.";
          }
          break;
      }
  
      // Display warning asynchronously
      const warningElement = document.getElementById(`${inputId}-warning`);
      if (errorMessage !== "") {
        warningElement.textContent = errorMessage;
      } else {
        warningElement.textContent = ""; // Clear warning if input is valid or empty
      }
    });
  }

// Attach input event listeners to validate inputs on change
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', validateInputs);
});