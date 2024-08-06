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

  firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
          displayBookings(user.uid);
          
      } else {
          // User is not signed in, handle accordingly
          console.log("User is not signed in.");
          // You might want to redirect the user to the sign-in page or display an error message
          window.location.href = 'auth.html';
      }
  });
// Function to format date as "Month-day-year"
function formatDate(date) {
const options = { month: 'short', day: 'numeric', year: 'numeric' };
return new Date(date).toLocaleDateString('en-US', options);
}

// Function to display bookings
function displayBookings(userId) {
const activeBookingsContainer = document.getElementById("activeBookings");
const pendingBookingsContainer = document.getElementById("pendingBookings");
const completedBookingsContainer = document.getElementById("completedBookings");

db.collection("bookings").where("nannyId", "==", userId).get()
  .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
          const bookingData = doc.data();

          // Split the date string by comma and format each date separately
          const dates = bookingData.date.split(',').map(date => formatDate(date.trim()));

          const bookingContainer = document.createElement("div");
          bookingContainer.classList.add("booking");
          bookingContainer.classList.add("booking-box");

          const bookingInfo = `
              <p>Dates: ${dates.join(', ')}</p>
              <p>Service Type: ${bookingData.serviceType}</p>
              <p>Location: ${bookingData.location}</p>
              <p>Start Time: ${bookingData.startTime}</p>
              <p>Duration: ${bookingData.duration}</p>
          `;

          if (bookingData.status === "Completed" && bookingData.statusNanny === "Completed") {
              bookingContainer.innerHTML = bookingInfo + `
                  <button class="details-btn" onclick="viewBookingDetails('${doc.id}')">View Details</button>
                  <button class="view-nanny-pay-btn" onclick="viewNannyPay('${bookingData.nannyPayUrl}')">View Payment</button>
              `;
              completedBookingsContainer.appendChild(bookingContainer);
          } else if (bookingData.statusNanny === "active" || bookingData.status === "Completed") {
              bookingContainer.innerHTML = bookingInfo + `
                  <button class="details-btn" onclick="viewBookingDetails('${doc.id}')">View Details</button>
              `;
              activeBookingsContainer.appendChild(bookingContainer);
          } else {
              bookingContainer.innerHTML = bookingInfo + `
                  <button class="accept-btn" onclick="acceptBooking('${doc.id}')">Accept</button>
                  <button class="cancel-btn" onclick="cancelBooking('${doc.id}')">Cancel</button>
                  <button class="details-btn" onclick="viewBookingDetails('${doc.id}')">View Details</button>
              `;
              pendingBookingsContainer.appendChild(bookingContainer);
          }

      });
  })
  .catch((error) => {
      console.error("Error fetching bookings: ", error);
  });
}


function viewNannyPay(nannyPayUrl) {
const modal = document.getElementById("nannyPayModal");
const imgElement = document.getElementById("nannyPayImage");

imgElement.src = nannyPayUrl;
modal.style.display = "block";
}
function closeNannyPayModal() {
  const modal = document.getElementById("nannyPayModal");
  modal.style.display = "none";
}

function viewBookingDetails(bookingId) {
db.collection("bookings").doc(bookingId).get()
  .then((doc) => {
      if (doc.exists) {
          const bookingData = doc.data();
          const { userId, serviceFormData } = bookingData;

          // Fetch parent details
          db.collection("users").doc(userId).get()
              .then((userDoc) => {
                  if (userDoc.exists) {
                      const parentData = userDoc.data();

                      // Assuming the service type is available in bookingData
                      const serviceType = bookingData.serviceType;

                      // Check service type to determine what data to display
                      if (serviceType === "Childcare" || serviceType === "ElderlyCare") {
                          // If service type is Childcare or ElderlyCare, display service form data
                          populateBookingDetailsModal(
                              parentData,
                              bookingData,
                              serviceFormData,
                              serviceFormData.age || '',
                              serviceFormData.name || '',
                              serviceFormData.gender || '',
                              serviceFormData.likes || '',
                              serviceFormData.routines || '',
                              serviceFormData.skills || '',
                              serviceFormData.specialRequests || ''
                          );
                      } else if (serviceType === "All-around") {
                          // If service type is All-around, display other details
                          const preferences = bookingData.preferences || '';
                          const reminders = bookingData.reminders || '';
                          const services = bookingData.services || [];
                          const size = bookingData.size || '';
                          const specialRequests = bookingData.specialRequests || '';
                          const specificRoom = bookingData.specificRoom || '';
                          const valuableItems = bookingData.valuableItems || '';

                          // Pass All-around specific data to populateBookingDetailsModal
                          populateBookingDetailsModal(
                              parentData,
                              bookingData,
                              serviceFormData, // Here we still pass service form data for consistency
                              preferences,
                              reminders,
                              services,
                              size,
                              specialRequests,
                              specificRoom,
                              valuableItems
                          );
                      }

                  } else {
                      console.log("Parent user does not exist!");
                  }
              })
              .catch((error) => {
                  console.error("Error fetching parent details: ", error);
              });
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
  })
  .catch((error) => {
      console.error("Error getting booking details:", error);
  });
}

  

  // Function to close booking details modal
  function closeBookingDetailsModal() {
      document.getElementById("bookingDetailsModal").style.display = "none";
  }


  function populateBookingDetailsModal(parentData, bookingData, serviceFormData, preferences, reminders, services, size, specialRequests, specificRoom, valuableItems) {
// Get the booking details modal and booking details content div
var modal = document.getElementById("bookingDetailsModal");
var bookingDetailsContent = document.getElementById("bookingDetailsContent");


if (bookingData.serviceType === "All-around") {
bookingDetailsContent.innerHTML = `
  <p><strong>Booking ID:</strong> ${bookingData.bookingID || ''}</p>
  <p><strong>Client Full Address:</strong> ${bookingData.location || ''}</p>
  <p><strong>Avoid:</strong> ${serviceFormData.avoid}</p>
  <p><strong>Preferences:</strong> ${serviceFormData.preferences}</p>
  <p><strong>Reminders:</strong> ${serviceFormData.reminders}</p>
  <p><strong>Services:</strong>
          <ul>
              ${serviceFormData.services.map(service => `<li>${service}</li>`).join('')}
          </ul>
  </p>
  <p><strong>Size:</strong> ${serviceFormData.size}</p>
  <p><strong>Special Reminders Pertaining to Booking:</strong> ${serviceFormData.specialRequests}</p>
  <p><strong>Specific Room:</strong> ${serviceFormData.specificRoom}</p>
  <p><strong>Valuable Items:</strong> ${serviceFormData.valuableItems}</p>
  
`;

} else {
  // Display service form data for childcare or elderlycare
  bookingDetailsContent.innerHTML = `
      <p><strong>Booking ID:</strong> ${bookingData.bookingID || ''}</p>
      <p><strong>Client Full Address:</strong> ${bookingData.location || ''}</p>
      <p><strong>${bookingData.serviceType === 'Childcare' ? 'Child\'s Age' : 'Elderly Age'}:</strong> ${serviceFormData.Age}</p>
      <p><strong>${bookingData.serviceType === 'Childcare' ? 'Child\'s Name' : 'Elderly Name'}:</strong> ${serviceFormData.Name}</p>
      <p><strong>Gender:</strong> ${serviceFormData.gender}</p>
      <p><strong>Likes and Dislikes:</strong> ${serviceFormData.likes}</p>
      <p><strong>Routine:</strong> ${serviceFormData.routines}</p>
      <p><strong>Special Reminders Pertaining to Booking:</strong> ${serviceFormData.specialRequests}</p>
  `;

}

// Display the modal
modal.style.display = "block";
}






// Function to close the booking details modal
function closeBookingDetailsModal() {
var modal = document.getElementById("bookingDetailsModal");
modal.style.display = "none";
}

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


function acceptBooking(bookingId) {
const currentUser = firebase.auth().currentUser;
if (currentUser) {
  db.collection("users").doc(currentUser.uid).get()
      .then((doc) => {
          if (doc.exists) {
              const userData = doc.data();
              if (userData.role === "nanny") {
                  const firstName = userData.firstName;
                  const middleName = userData.middleName || ""; // Middle name may be optional
                  const lastName = userData.lastName;
                  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" "); // Concatenate and join the names
                  
                  // Get the booking data from the "assignedNanny" collection
                  db.collection("assignedNanny").doc(bookingId).get()
                      .then((bookingDoc) => {
                          if (bookingDoc.exists) {
                              const bookingData = bookingDoc.data();
                              const parentEmail = bookingData.parentEmail;
                              
                              // Transfer the data to the "acceptedBooking" collection
                              db.collection("acceptedBooking").doc(bookingId).set(bookingData)
                                  .then(() => {
                                      console.log("Booking transferred to acceptedBooking collection");


                                      // Delete the document from the "assignedNanny" collection
                                      db.collection("assignedNanny").doc(bookingId).delete()
                                          .then(() => {
                                              console.log("Document successfully deleted from assignedNanny collection");
                                              
                                              // Update the status in the "bookings" collection
                                              db.collection("bookings").doc(bookingId).update({
                                                  status: `Accepted: ${fullName}`,
                                                  statusNanny: "active"
                                              })
                                              .then(() => {
                                                  console.log("Booking status updated successfully");
                                                  sendEmailToUser(parentEmail);
                                                  location.reload(); // Reload the page to reflect changes
                                              })
                                              .catch((error) => {
                                                  console.error("Error updating booking status: ", error);
                                              });
                                          })
                                          .catch((error) => {
                                              console.error("Error deleting document: ", error);
                                          });
                                  })
                                  .catch((error) => {
                                      console.error("Error transferring booking: ", error);
                                  });
                          } else {
                              console.log("No booking found in assignedNanny collection");
                          }
                      })
                      .catch((error) => {
                          console.error("Error getting booking data: ", error);
                      });
              } else {
                  console.log("User is not a nanny");
              }
          } else {
              console.log("User document does not exist");
          }
      })
      .catch((error) => {
          console.error("Error getting user data:", error);
      });
} else {
  console.log("No user signed in."); // Handle case where no user is signed in
}
}

// Function to send email to user
function sendEmailToUser(parentEmail) {
fetch('/accept-email', {
  method: 'POST',
  headers: {
      'Content-Type': 'application/json'
  },
  body: JSON.stringify({parentEmail})
})
  .then((response) => {
      if (response.ok) {
          console.log('Email sent successfully!');
      } else {
          throw new Error('Failed to send email');
      }
  })
  .catch((error) => {
  });
}

// Function to cancel a pending booking and send email to user
function cancelBooking(bookingId) {
const currentUser = firebase.auth().currentUser;
if (currentUser) {
  // Prompt confirmation before canceling the booking
  const confirmation = confirm("Are you sure you want to cancel this booking?");
  
  if (confirmation) {
      // Fetch the parent's email from assignedBooking
      db.collection("assignedNanny").doc(bookingId).get()
          .then((doc) => {
              if (doc.exists) {
                  const parentEmail = doc.data().parentEmail;
                  
                  // Call function to send email to user
                  sendDenyToUser(parentEmail);

                  // Fetch the nanny's name
                  db.collection("users").doc(currentUser.uid).get()
                      .then((doc) => {
                          if (doc.exists) {
                              const nannyName = `${doc.data().firstName} ${doc.data().lastName}`;
                              
                              // Delete the document from the assignedNanny collection
                              db.collection("assignedNanny").doc(bookingId).delete()
                                  .then(() => {
                                      // Remove the nannyId from the booking in the bookings collection
                                      db.collection("bookings").doc(bookingId).update({
                                          nannyId: firebase.firestore.FieldValue.delete(),
                                          status: `Not Accepted: ${nannyName}`
                                      })
                                      .then(() => {
                                          console.log("Booking canceled successfully");
                                          location.reload(); // Reload the page to reflect changes
                                      })
                                      .catch((error) => {
                                          console.error("Error updating booking document: ", error);
                                      });
                                  })
                                  .catch((error) => {
                                      console.error("Error deleting assigned nanny document: ", error);
                                  });
                          } else {
                              console.log("Nanny user document does not exist!");
                          }
                      })
                      .catch((error) => {
                          console.error("Error fetching nanny data:", error);
                      });
              } else {
                  console.log("Assigned nanny document does not exist!");
              }
          })
          .catch((error) => {
              console.error("Error fetching assigned nanny data:", error);
          });
  }
} else {
  console.log("No user signed in."); // Handle case where no user is signed in
}
}


// Function to send email to user
function sendDenyToUser(parentEmail) {
fetch('/deny-email', {
  method: 'POST',
  headers: {
      'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email: parentEmail }) // Assuming parentEmail is the correct field name
})
.then((response) => {
  if (response.ok) {
      console.log('Email sent successfully!');
  } else {
      throw new Error('Failed to send email');
  }
})
.catch((error) => {
  console.error('Error sending email:', error);
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
          case "nanny":
              break;
          case "admin":
              window.location.href = "admin.html"; // Redirect to admin page
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

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
