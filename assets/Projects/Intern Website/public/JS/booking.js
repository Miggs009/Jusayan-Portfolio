

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

firebase.auth().onAuthStateChanged(function(user) {
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
      addressDropdown.addEventListener('change', function() {
        const selectedAddress = this.value;
        document.getElementById('searchInput').value = selectedAddress;
      });
      
      // Set the search input value to the first address
      document.getElementById('searchInput').value = userAddresses[0];
    } else {
      // Document does not exist
      window.location.href = "./auth.html";
    }
  })
  .catch((error) => {
  });
 // Assuming you have a function to check user roles
checkUserRole(user.uid)
  .then(role => {
    if (role === 'admin' || role === 'parent') {
      // User is authorized, proceed with booking functionality
      if (window.location.pathname !== '/booking.html') {
        window.location.href = 'booking.html';
      }
    } else {
      // User is not authorized, ask for confirmation before redirecting
      window.location.href = "./auth.html";
    }
  })
  .catch(error => {
    console.error('Error checking user role:', error);
  });
} else {
// No user is signed in.
window.location.href = "./auth.html";
}
});

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



    // Function to extract numbers inside parenthesis from a string
    function extractNumbers(str) {
      const regex = /\((\d+)\)/g;
      const matches = [];
      let match;
      while ((match = regex.exec(str)) !== null) {
        matches.push(parseInt(match[1]));
      }
      return matches;
    }

    // Function to convert durationPrice to the desired format
    function convertDurationPrice(durationPrice) {
      const numbersInsideParenthesis = extractNumbers(durationPrice);
      return numbersInsideParenthesis.join(', ');
    }





    document.getElementById('open-modal').addEventListener('click', function () {
      // Gather your form data
      const locationInput = document.getElementById('searchInput').value;
      const isDateEmpty = concatenateDate.trim() === '';
      const selectedDate = isDateEmpty ? document.getElementById('datePicker').value : concatenateDate;
      const isStartTimeEmpty = concatenateStartTime.trim() === '';

      // Format selectedStartTime to AM/PM
      const timePickerValue = document.getElementById('timePicker').value;
      const [hours, minutes] = timePickerValue.split(':').map(Number);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      selectedStartTimeone = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

      const selectedStartTime = isStartTimeEmpty ? selectedStartTimeone : concatenateStartTime;
      const isDurationEmpty = concatenateDuration.trim() === '';
      const selectedDuration = isDurationEmpty ? document.querySelector('input[name="duration"]:checked').value : concatenateDuration;
      const selectedServiceType = document.querySelector('input[name="serviceType"]:checked').value;

      // Count the number of commas in concatenatedDate when it's not empty
      const commaCount = isDateEmpty ? 1 : (concatenateDate.match(/,/g) || []).length + 1;

      // Calculate transportation fee
      let transportationFee = 0;
      if (locationInput.toLowerCase().includes('manila')) {
        transportationFee = 150;
      } else if (locationInput.toLowerCase().includes('rizal')) {
        transportationFee = 200;
      } else if (locationInput.toLowerCase().includes('laguna') || locationInput.toLowerCase().includes('cavite') || locationInput.toLowerCase().includes('bulacan')) {
        transportationFee = 250;
      }

      // Reiterate transportationFee by comma count
      const transportationFeeFormatted = Array(commaCount).fill(transportationFee).join(', ');

      // Extract data from service forms based on selected service type
      let serviceFormData = {};
      if (selectedServiceType === 'Childcare' || selectedServiceType === 'ElderlyCare') {
        serviceFormData = {
          Name: document.getElementById('CEServiceName').value,
          Age: document.getElementById('CEServiceAge').value,
          gender: document.getElementById('gender').value,
          skills: document.getElementById('skills').value,
          routines: document.getElementById('routines').value,
          likes: document.getElementById('likes').value,
          specialRequests: document.getElementById('specialRequests').value
        };
      } else if (selectedServiceType === 'All-around') {
        serviceFormData = {
          services: [], // Array to store selected services
          size: document.getElementById('size').value,
          specificRoom: document.getElementById('specificRoom').value,
          preferences: document.getElementById('preferences').value,
          valuableItems: document.getElementById('valuableItems').value,
          avoid: document.getElementById('avoid').value,
          specialRequests: document.getElementById('specialRequests').value,
          reminders: document.getElementById('reminders').value
        };

        // Extract selected cleaning services
        const checkboxes = document.querySelectorAll('#allaroundForm input[type="checkbox"]:checked');
        checkboxes.forEach(function (checkbox) {
          serviceFormData.services.push(checkbox.value);
        });
      }

      // Calculate duration price if empty
      let durationPrice = 0;
      if (isDurationEmpty) {
        switch (parseInt(selectedDuration)) {
          case 4:
            durationPrice = 550;
            break;
          case 6:
            durationPrice = 725;
            break;
          case 8:
            durationPrice = 900;
            break;
          case 10:
            durationPrice = 1100;
            break;
          case 12:
            durationPrice = 1200;
            break;
        }
      } else {
        durationPrice = getDurationPrice(concatenateDuration);

        durationPrice = convertDurationPrice(durationPrice);
      }


      // Initialize an array to store totalPrice for each booking
      let totalPriceArray = [];

      // Loop through each duration to calculate totalPrice
      const durations = selectedDuration.split(',').map(duration => duration.trim());
      const durationPrices = durationPrice.split(',').map(price => parseInt(price.trim()));
      for (let i = 0; i < durations.length; i++) {
        const totalPrice = transportationFee + durationPrices[i];
        totalPriceArray.push(totalPrice);
      }

      // Convert totalPriceArray to comma-separated string
      const totalPriceFormatted = totalPriceArray.join(', ');

      // Get current user
      const user = auth.currentUser;

      // Function to generate booking ID
      async function generateBookingID(today) {
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const date = today.getDate().toString().padStart(2, '0');

        // Generate single letter alphabetical IDs
        for (let i = 0; i < 26; i++) {
          const alphabetical = String.fromCharCode(65 + i);
          const bookingID = `${year}${month}${date}${alphabetical}`;

          // Check if the generated booking ID already exists
          const existingBooking = await db.collection('bookings')
            .where('bookingID', '==', bookingID)
            .get()
            .then(querySnapshot => querySnapshot.empty);

          if (existingBooking) {
            return bookingID;
          }
        }

        // Generate double letter alphabetical IDs
        for (let i = 0; i < 26; i++) {
          for (let j = 0; j < 26; j++) {
            const alphabetical = String.fromCharCode(65 + i) + String.fromCharCode(65 + j);
            const bookingID = `${year}${month}${date}${alphabetical}`;

            // Check if the generated booking ID already exists
            const existingBooking = await db.collection('bookings')
              .where('bookingID', '==', bookingID)
              .get()
              .then(querySnapshot => querySnapshot.empty);

            if (existingBooking) {
              return bookingID;
            }
          }
        }

        // Return null if all combinations are taken
        return null;
      }

      // Check if user is authenticated
      if (user) {
        // Retrieve user information from Firestore
        db.collection('users').doc(user.uid).get()
          .then(async (doc) => {
            if (doc.exists) {
              // Extract user data
              const userData = doc.data();
              const userEmail = user.email;
              const userName = userData.name;
              const userId = user.uid;

              // Get the current date
              const today = new Date();

              // Generate unique booking ID
              const bookingID = await generateBookingID(today);

              if (bookingID) {
                // Iterate through each duration and log booking data
                // Iterate through each duration and log booking data
                selectedDate.split(',').forEach(async (date, index) => {
                  const bookingData = {
                    location: locationInput,
                    date: date.trim(),
                    startTime: selectedStartTime.split(',')[index].trim(),
                    duration: selectedDuration.split(',')[index].trim(),
                    durationPrice: durationPrices[index],
                    totalPrice: totalPriceArray[index],
                    serviceType: selectedServiceType,
                    transportationFee: transportationFeeFormatted.split(',')[index].trim(),
                    serviceFormData: serviceFormData,
                    userEmail: userEmail,
                    userName: userName,
                    userId: userId,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    status: "For Payment",
                    bookingID: bookingID
                  };
                  console.log('Booking Data:', bookingData);

                  // Add the booking data to Firestore
                  try {
                    const docRef = await db.collection('bookings').add(bookingData);
                    console.log('Booking added with prices and user information! Document reference:', docRef.id);
                    document.getElementById('modal').style.display = 'block';
                  } catch (error) {
                    console.error('Error adding booking: ', error);
                  }
                });
              } else {
                console.error('All possible booking IDs are taken for today.');
              }
            } else {
              console.error('User data not found');
            }
          })
          .catch((error) => {
            console.error('Error retrieving user data: ', error);
          });
      } else {
        console.error('User not authenticated');
      }

    });




// Get the modal
var modal = document.getElementById("confirmationModal");

// Get the close button
var closeButton = document.getElementById("close");

// Get the buttons
var confirmButton = document.getElementById("confirmButton");
var cancelButton = document.getElementById("cancelButton");

// Function to close the modal
function closeModal() {
modal.style.display = "none";
}

// When the user clicks on the close button, close the modal
closeButton.addEventListener('click', function() {
// Close the modal when Cancel button is clicked
closeModal();
});
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
if (event.target == modal) {
closeModal();
}
}

// JavaScript to handle button click events
confirmButton.addEventListener('click', function() {
// Implement action for Contact Us button
window.location.href = 'contactus.html'; // Change to your contact page URL
});

cancelButton.addEventListener('click', function() {
// Close the modal when Cancel button is clicked
event.preventDefault(); // Prevent the default action of the cancel button
closeModal();
});

function nextTab(nextTabName) {
if (nextTabName === 'details') {
// Validate date and time selection
const selectedDate = document.getElementById('datePicker').value;
const selectedTime = document.getElementById('timePicker').value;

if (selectedDate === '' || selectedTime === '') {
  openAlertModal("Please select both date and time before proceeding.");
  return; // Return if either date or time is empty
}

// Combine date and time into a single string
const selectedDateTimeString = selectedDate + ' ' + selectedTime;

// Parse the combined date and time string
const selectedDateTime = new Date(selectedDateTimeString);
const currentDateTime = new Date();

// Check if selected date-time is before the current date-time
if (selectedDateTime < currentDateTime) {
  modal.style.display = "block";
  return; // Return if selected date-time is in the past
}

// Calculate the time difference in milliseconds
const timeDifference = selectedDateTime - currentDateTime;

// Convert milliseconds to hours
const timeDifferenceHours = timeDifference / (1000 * 60 * 60);

// Check if the time difference is less than or equal to 14 hours
if (timeDifferenceHours <= 14 && timeDifferenceHours >= 0) {
  // Show the custom confirmation modal
  modal.style.display = "block";
  return; // Return after showing the modal
}

const selectedDuration = document.querySelector('input[name="duration"]:checked');
if (!selectedDuration) {
  openAlertModal("Please select a duration before proceeding.");

  return; // Return if duration is not selected
}
}

if (nextTabName === 'bookingdetails') {
// Check the selected service type
const selectedServiceType = document.querySelector('input[name="serviceType"]:checked').value;

if (selectedServiceType === 'Childcare' || selectedServiceType === 'ElderlyCare') {
    // If the service type is "Childcare" or "ElderlyCare", perform validation
    const serviceName = document.getElementById('CEServiceName').value.trim();
    const serviceAge = document.getElementById('CEServiceAge').value.trim();
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    const serviceRoutines = document.getElementById('routines').value.trim();

    // Check if any of the mandatory fields are empty
    if (serviceName === '' || serviceAge === '' || serviceRoutines === '') {
      openAlertModal("Please fill in all mandatory fields (Name, Age, Gender, Routines) before proceeding.");

        return;
    }
    let genderSelected = false;
    genderRadios.forEach(function(radio) {
        if (radio.checked) {
            genderSelected = true;
        }
    });

    if (!genderSelected) {
        openAlertModal("Please fill in all mandatory fields (Name, Age, Gender, Routines) before proceeding.");
    }
}

// If the service type is not "Childcare" or "ElderlyCare", proceed to handleBookingDetails()
handleBookingDetails();
}


const currentTab = document.querySelector('#booktabContent > div.active');
const nextTab = document.getElementById(nextTabName);

currentTab.classList.remove('active');
nextTab.classList.add('active');

// Update the active tab button
const nextTabButton = document.querySelector('.booktab.active + .booktab');
if (nextTabButton) {
    document.querySelector('.booktab.active').classList.remove('active');
    nextTabButton.classList.add('active');
}

// Show or hide the booktabnavigation based on the active tab
const booktabnavigation = document.getElementById('booktabnavigation');
if (nextTabName !== 'location') {
    booktabnavigation.classList.remove('hide');
    document.body.style.overflow = 'visible'; // Show overflow on other tabs
} else {
    booktabnavigation.classList.add('hide');
    document.body.style.overflow = 'hidden'; // Hide overflow on location tab
}
}

function showServiceForm(serviceType) {
  const CEServiceForm = document.getElementById('CEServiceForm');
  const allaroundForm = document.getElementById('allaroundForm');

  if (serviceType === 'Childcare' || serviceType === 'ElderlyCare') {
      CEServiceForm.style.display = 'block';
      allaroundForm.style.display = 'none';
  } else if (serviceType === 'All-around') {
      CEServiceForm.style.display = 'none';
      allaroundForm.style.display = 'block';
  }
}

// Call showServiceForm() when the service type changes
document.querySelectorAll('input[name="serviceType"]').forEach(function(input) {
  input.addEventListener('change', function() {
      showServiceForm(this.value);
  });
});

// Function to update service form labels based on selected service type
function updateServiceFormLabels(serviceType) {
const nameLabel = document.querySelector('label[for="CEServiceName"]');
const ageLabel = document.querySelector('label[for="CEServiceAge"]');

if (serviceType === 'Childcare') {
    nameLabel.textContent = "Child's Name:";
    ageLabel.textContent = "Child's Age:";
} else if (serviceType === 'ElderlyCare') {
    nameLabel.textContent = "Elderly Name:";
    ageLabel.textContent = "Elderly Age:";
}
}

// Call updateServiceFormLabels() when the service type changes
document.querySelectorAll('input[name="serviceType"]').forEach(function(input) {
input.addEventListener('change', function() {
    updateServiceFormLabels(this.value);
});
});

// Initially call updateServiceFormLabels() to set labels based on the default selected service type
updateServiceFormLabels(document.querySelector('input[name="serviceType"]:checked').value);

const selectedServiceType = document.querySelector('input[name="serviceType"]:checked').value;
// Event listener for the button to save service form data
document.getElementById('saveServiceFormDataButton').addEventListener('click', function() {
  // Extract data from service forms based on selected service type
  let serviceFormData = {};
  if (selectedServiceType === 'Childcare' || selectedServiceType === 'ElderlyCare') {
      serviceFormData = {
          Name: document.getElementById('CEServiceName').value,
          Age: document.getElementById('CEServiceAge').value,
          gender: document.getElementById('gender').value,
          skills: document.getElementById('skills').value,
          routines: document.getElementById('routines').value,
          likes: document.getElementById('likes').value,
          
      };
  } else if (selectedServiceType === 'All-around') {
      serviceFormData = {
          size: document.getElementById('size').value,
          specificRoom: document.getElementById('specificRoom').value,
          preferences: document.getElementById('preferences').value,
      };
  }

  // Save service form data to Firestore for the current user
  const user = auth.currentUser;
  if (user) {
      db.collection('serviceFormData').doc(user.uid).set(serviceFormData)
          .then(() => {
              console.log('Service form data saved successfully.');
          })
          .catch((error) => {
              console.error('Error saving service form data:', error);
          });
  } else {
      console.error('User not authenticated.');
  }
});

// Function to autopopulate input fields with saved service form data
function populateServiceFormFields() {
  const user = auth.currentUser;
  if (user) {
      db.collection('serviceFormData').doc(user.uid).get()
          .then((doc) => {
              if (doc.exists) {
                  const serviceFormData = doc.data();
                  if (serviceFormData) {
                      if (selectedServiceType === 'Childcare' || selectedServiceType === 'ElderlyCare') {
                          document.getElementById('CEServiceName').value = serviceFormData.Name || '';
                          document.getElementById('CEServiceAge').value = serviceFormData.Age || '';
                          document.getElementById('skills').value = serviceFormData.skills || '';
                          document.getElementById('routines').value = serviceFormData.routines || '';
                          document.getElementById('likes').value = serviceFormData.likes || '';
                          // Populate other input fields for Childcare/ElderlyCare similarly
                      } else if (selectedServiceType === 'All-around') {
                          document.getElementById('size').value = serviceFormData.size || '';
                          document.getElementById('specificRoom').value = serviceFormData.specificRoom || '';
                          document.getElementById('preferences').value = serviceFormData.preferences || '';
                          // Populate other input fields for All-around similarly
                      }
                  }
              } else {
                  console.log('No service form data found for the user.');
              }
          })
          .catch((error) => {
              console.error('Error getting service form data:', error);
          });
  } else {
  }
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

function handleBookingDetails() {
  // Get input values
  const locationInput = document.getElementById('searchInput').value;
  const serviceTypeInput = document.querySelector('input[name="serviceType"]:checked').value;

  // Check if concatenateDate, concatenateStartTime, and concatenateDuration have content
  const isDateEmpty = concatenateDate.trim() === '';
  const isStartTimeEmpty = concatenateStartTime.trim() === '';
  const isDurationEmpty = concatenateDuration.trim() === '';

  // Get selectedDate only if concatenateDate is empty
  let selectedDate = isDateEmpty ? document.getElementById('datePicker').value : concatenateDate;

  // Format selectedStartTime to AM/PM
  const timePickerValue = document.getElementById('timePicker').value;
  const [hours, minutes] = timePickerValue.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  selectedStartTimeone = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;



  // Get selectedStartTime, using concatenateStartTime if not empty
  let selectedStartTime = isStartTimeEmpty ? selectedStartTimeone : concatenateStartTime;

  // Determine the correct duration to use
  let selectedDuration = '';
  let durationPrice = 0;

  if (isDurationEmpty) {
    selectedDuration = document.querySelector('input[name="duration"]:checked').value;

    switch (parseInt(selectedDuration)) {
      case 4:
        durationPrice = 550;
        break;
      case 6:
        durationPrice = 725;
        break;
      case 8:
        durationPrice = 900;
        break;
      case 10:
        durationPrice = 1100;
        break;
      case 12:
        durationPrice = 1200;
        break;
    }
  }

  // Count the number of commas in concatenatedDate when it's not empty
  const commaCount = isDateEmpty ? 1 : (concatenateDate.match(/,/g) || []).length + 1;

  // Calculate transportation fee
  let transportationFee = 0;
  if (locationInput.toLowerCase().includes('manila')) {
    transportationFee = 150;
  } else if (locationInput.toLowerCase().includes('rizal')) {
    transportationFee = 200;
  } else if (locationInput.toLowerCase().includes('laguna') || locationInput.toLowerCase().includes('cavite') || locationInput.toLowerCase().includes('bulacan')) {
    transportationFee = 250;
  }

  // Calculate total price
  let totalPrice = 0;
  if (isDurationEmpty) {
    totalPrice = transportationFee + durationPrice;
  } else {
    totalPrice = commaCount * transportationFee + parseInt(getDurationPrice(concatenateDuration).split('=')[1].trim());
  }

  // Display the gathered information and create a table
  const bookingDetailsDiv = document.getElementById('bookingDetails');
  bookingDetailsDiv.innerHTML = `
  <div class="orderinfodiv">
    <div class="order-info">
      <p><strong>Location:</strong> ${locationInput}</p>
      <p><strong>Date:</strong> ${selectedDate}</p>
    </div>
    <div class="order-info2">
      <p><strong>Start Time:</strong> ${selectedStartTime}</p>
      <p><strong>Service Type:</strong> ${serviceTypeInput}</p>
    </div>
  </div>
  `;

  const bookingTable = document.createElement('table');
  bookingTable.classList.add('booktblnone');

  bookingTable.innerHTML = `
  <div id="bookingdetails" class="flex justify-center mb-4">
    <div class="w-full md:w-3/4 lg:w-2/3">
      <div class="overflow-x-auto">
        <table class="w-full bookingDetailstable">
          <thead>
            <tr class="bg-gray-200">
              <th class="px-4 py-2">Item</th>
              <th class="px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border px-4 py-2">Location</td>
              <td class="border px-4 py-2">${locationInput}</td>
            </tr>
            <tr>
              <td class="border px-4 py-2">Transportation fee</td>
              <td class="border px-4 py-2">${commaCount} x (${transportationFee}) = ${commaCount * transportationFee}</td>
            </tr>
            <tr>
              <td class="border px-4 py-2">Duration (hours)</td>
              <td class="border px-4 py-2">${isDurationEmpty ? selectedDuration : concatenateDuration}</td>
            </tr>
            <tr>
              <td class="border px-4 py-2">Service Rate</td>
              <td class="border px-4 py-2">${isDurationEmpty ? `${durationPrice}` : `${getDurationPrice(concatenateDuration)}`}</td>
            </tr>
            <tr>
              <td class="border px-4 py-2">Total Amount</td>
              <td class="border px-4 py-2">${totalPrice}</td>
            </tr>
            
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `;

  // Append the table to the bookingDetailsDiv
  bookingDetailsDiv.appendChild(bookingTable);
}


// Function to calculate duration price based on concatenateDuration
function getDurationPrice(concatenateDuration) {
  // Create an object to store the price for each duration
  const price = {
    '12': 1200,
    '10': 1100,
    '8': 900,
    '6': 725,
    '4': 550
  };

  // Initialize total price
  let totalPrice = 0;

  // Initialize a string to store the formatted duration and price
  let durationPriceString = '';

  // Split concatenateDuration by comma and trim each value
  const durations = concatenateDuration.split(',').map(duration => duration.trim());

  // Count the occurrences of each duration
  const durationCount = {};
  durations.forEach(duration => {
    durationCount[duration] = (durationCount[duration] || 0) + 1;
  });

  // Calculate total price for each duration and construct the string
  Object.keys(durationCount).forEach(duration => {
    const count = durationCount[duration];
    const hour = parseInt(duration); // Extract the hour value
    const pricePerHour = price[duration]; // Get the price for the duration
    const subtotal = count * pricePerHour;
    totalPrice += subtotal;
    durationPriceString += `${count} (${hour * 100}) + `;
  });

  // Remove the trailing '+' sign and space
  durationPriceString = durationPriceString.slice(0, -2);

  // Add the total price to the string
  durationPriceString += ` = ${totalPrice}`;

  return durationPriceString;
}

function populateTimeOptions() {
  const select = document.getElementById('timePicker');
  const hours = 24;
  for (let i = 0; i < hours; i++) {
    for (let j = 0; j < 60; j += 30) {
      const hour = i.toString().padStart(2, '0');
      const minute = j.toString().padStart(2, '0');
      const option = document.createElement('option');
      option.value = `${hour}:${minute}`;
      option.textContent = `${hour}:${minute}`;
      select.appendChild(option);
    }
  }
}

// Initial population of the time picker
window.addEventListener('DOMContentLoaded', (event) => {
  populateTimeOptions();
});

document.addEventListener('DOMContentLoaded', function() {
var today = new Date().toISOString().split('T')[0];
document.getElementById('datePicker').setAttribute('min', today);
});


function saveAddress(event) {
  event.preventDefault(); // Prevent default form submission behavior
  
  const locationInput = document.getElementById('searchInput').value.toLowerCase();

  // Store the address in Firestore
  const user = firebase.auth().currentUser;
  if (user) {
      const userId = user.uid;
      const userRef = db.collection('users').doc(userId);

      // Update the user document with the new address
      userRef.update({
              addresses: firebase.firestore.FieldValue.arrayUnion(locationInput)
          })
          .then(() => {
              console.log('Address added to user addresses in Firestore.');
              // Prompt the user for a successful favorite
              openAlertModal("Address has been successfully added to favorites!");

          })
          .catch(error => {
              console.error('Error adding address to user addresses in Firestore:', error);
              // Optionally, handle the error here
          });
  }
}

function showSidebar(){
  const sidebar = document.querySelector('.sidebar')
  sidebar.style.display = 'flex'
}
function hideSidebar(){
  const sidebar = document.querySelector('.sidebar')
  sidebar.style.display = 'none'
}
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


