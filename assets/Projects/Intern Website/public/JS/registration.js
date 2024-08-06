import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
import { getAuth} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";


  const firebaseConfig = {
    apiKey: "AIzaSyDUSE8JAAX8CqJPrG8IP7ZaEpm_6X6GwlA",
    authDomain: "my-fairee.firebaseapp.com",
    projectId: "my-fairee",
    storageBucket: "my-fairee.appspot.com",
    messagingSenderId: "542574300076",
    appId: "1:542574300076:web:5d0bc675b5416ee06c0809",
    measurementId: "G-MHESMFGND1"
  };


// Firebase initialization
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
auth.languageCode = 'en';
const db = getFirestore();

function registerUser(name, phone_no, userEmail, role) {
  // Get the currently authenticated user's UID
  const userUID = auth.currentUser.uid;

  console.log("User email:", userEmail); // Debugging

  // Save user details to Firestore
  setDoc(doc(db, "users", auth.currentUser.uid), {
      email: userEmail, // Save the user's email
      uid: userUID, // Save the user's UID
      name: name,
      phone_no: phone_no,
      role: role, // Save the user's role
      registration_timestamp: serverTimestamp() // Add registration timestamp
  })
  .then(() => {
      console.log("User registered successfully!");
      if (role === "admin") {
          window.location.href = "admin.html"; // Redirect if role is Nanny
      } else if (role === "parent") {
          window.location.href = "booking.html"; // Redirect if role is Parent
      } else {
          console.error("Invalid role:", role);
      }
  })
  .catch((error) => {
      console.error("Error registering user: ", error);
  });
}

// Function to auto-populate name field if user is logged in
function autoPopulateName() {
  if (auth.currentUser) {
    const userEmail = auth.currentUser.email;
    const name = userEmail.split('@')[0];
    document.getElementById('name').value = name;
  } else {
    console.error("No user logged in.");
  }
}

// Registration form submission
document.addEventListener("DOMContentLoaded", function () {
  // Auto-populate name field if user is logged in
  // Add this check in autoPopulateName function or onAuthStateChanged listener
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is logged in
        autoPopulateName(); // Auto-populate name if needed
        // Check if user is already registered
        checkIfRegistered(user);
    } else {
        // User is not logged in
        console.error("No user logged in.");
        // Redirect to login or any other appropriate action
        window.location.href = "cover.html";
    }
});

function checkIfRegistered(user) {
    // Assuming you have a collection named "users" in Firestore
    const userRef = doc(db, "users", user.uid);
    getDoc(userRef)
        .then((docSnapshot) => {
            if (docSnapshot.exists()) {
                // User is already registered, show alert
                alert("You are already registered!");
                // Redirect to appropriate page
                window.location.href = "booking.html";
            } else {
                // User is not registered, stay on the registration page
                console.log("User is not registered.");
            }
        })
        .catch((error) => {
            console.error("Error checking registration status: ", error);
        });
}


  const registrationForm = document.getElementById("registration-form");
  registrationForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = document.getElementById("name").value;
      const phone_no = document.getElementById("phone_no").value;
      const role = "parent"; // Set role directly to "parent"

      // Validate inputs before registration
      if (validateInputs(name, phone_no)) {
          // If inputs are valid, proceed with registration
          if (auth.currentUser) {
              const userEmail = auth.currentUser.email;
              registerUser(name, phone_no, userEmail, role); // Include role in registration
          } else {
              console.error("No user logged in.");
          }
      }
  });
});

function validateInputs(name, phone_no) {
    // Regular expressions for name and phone number
    const nameRegex = /^(?=.*[A-Za-z0-9])[A-Za-z0-9\s]+$/;
    const phoneRegex = /^09[0-9]{9}$/;
  
    const nameError = document.getElementById('nameError');
    const phoneNoError = document.getElementById('phoneNoError');
  
    // Reset error messages
    nameError.textContent = '';
    phoneNoError.textContent = '';
  
    // Check if name is empty
    if (!name.trim()) {
        nameError.textContent = 'Please enter your name';
        return false;
    }
  
    // Check if phone number is empty
    if (!phone_no.trim()) {
        phoneNoError.textContent = 'Please enter your phone number';
        return false;
    }
  
    // Check if phone number includes '+63'
    if (phone_no.includes('+63')) {
        phoneNoError.textContent = 'Please enter a valid Phone Number without +63';
        return false;
    }
  
    // Check if name contains only letters, numbers, periods, and spaces (0 to 3)
    if (!nameRegex.test(name)) {
        nameError.textContent = 'Please enter a valid name';
        return false;
    }
  
    // Check if phone number matches the format 09154713982
    if (!phoneRegex.test(phone_no)) {
        phoneNoError.textContent = 'Please enter a valid 11 digit phone number';
        return false;
    }
  
    // If all inputs are valid
    return true;
}

// Attach input event listeners to validate inputs on change
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', validateInputs);
  });


  