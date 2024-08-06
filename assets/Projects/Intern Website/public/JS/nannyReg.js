
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
    const storage = firebase.storage()

    // Function to handle form submission and redirection
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
    "province", "region"
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
  const phoneNumber = document.getElementById("phoneNumber").value;
  const houseNo = document.getElementById("houseNo").value;
  const barangay = document.getElementById("barangay").value;
  const city = document.getElementById("city").value;
  const province = document.getElementById("province").value;
  const region = document.getElementById("region").value;
  const file = document.getElementById("C1customFile").files[0]; // Get the selected file

    // Reference to Firebase Storage
    const storageRef = firebase.storage().ref();
    // Upload file to Firebase Storage
    const uploadTask = storageRef.child('images/' + file.name).put(file);

    // Add role (nanny) to form data
    const role = "nanny";

    // Handle successful file upload
    uploadTask.then(snapshot => {
    console.log('File uploaded successfully');
    // Get download URL of the uploaded file
    return snapshot.ref.getDownloadURL();
    }).then(downloadURL => {
    // Add data to Firestore with the download URL
    return db.collection("users").doc(auth.currentUser.uid).set({
        email: auth.currentUser.email,
        uid: auth.currentUser.uid,
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        suffix: suffix,
        gender: gender,
        dob: dob,
        phoneNumber: phoneNumber,
        houseNo: houseNo,
        barangay: barangay,
        city: city,
        province: province,
        region: region,
        idPhotoURL: downloadURL, // Store download URL in Firestore
        role: role,
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
});

  // Function to handle form submission and redirection
  document.getElementById("proceed").addEventListener("click", function() {
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

  // Get input values
  const firstName = document.getElementById("firstName").value;
  const middleName = document.getElementById("middleName").value;
  const lastName = document.getElementById("lastName").value;
  const suffix = document.getElementById("sel1Suffix").value;
  const gender = document.getElementById("sel1Gender").value;
  const dob = document.getElementById("dob").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const houseNo = document.getElementById("houseNo").value;
  const barangay = document.getElementById("barangay").value;
  const city = document.getElementById("city").value;
  const province = document.getElementById("province").value;
  const region = document.getElementById("region").value;
  const file = document.getElementById("C1customFile").files[0]; // Get the selected file

    // Reference to Firebase Storage
    const storageRef = firebase.storage().ref();
    // Upload file to Firebase Storage
    const uploadTask = storageRef.child('images/' + file.name).put(file);

    // Add role (nanny) to form data
    const role = "nanny";

    // Handle successful file upload
    uploadTask.then(snapshot => {
    console.log('File uploaded successfully');
    // Get download URL of the uploaded file
    return snapshot.ref.getDownloadURL();
    }).then(downloadURL => {
    // Add data to Firestore with the download URL
    return db.collection("users").doc(auth.currentUser.uid).set({
        email: auth.currentUser.email,
        uid: auth.currentUser.uid,
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        suffix: suffix,
        gender: gender,
        dob: dob,
        phoneNumber: phoneNumber,
        houseNo: houseNo,
        barangay: barangay,
        city: city,
        province: province,
        region: region,
        idPhotoURL: downloadURL, // Store download URL in Firestore
        role: role,
        registration_timestamp: firebase.firestore.FieldValue.serverTimestamp() // Add registration timestamp
    });
  })
  .then(() => {
    console.log("Document successfully written.");
      window.location.href = "accVer.html";
    
  })
  .catch((error) => {
    console.error("Error writing document: ", error);
  });
});

  function scrollToSection(sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  }

  function validateInputs() {
    const inputs = [
      "firstName", "middleName", "lastName", "dob",
      "phoneNumber", "houseNo", "barangay", "city",
      "province", "region"
    ];
  
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
        case "houseNo":
        case "barangay":
        case "city":
        case "province":
        case "region":
          // Validate against allowed characters including numbers
          if (value !== "" && !/^[a-zA-Z0-9,. -]+$/.test(value)) {
            errorMessage = "Please do not use other symbols other than (period[ . ]), (comma[ , ]), (dash[ - ])";
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
  