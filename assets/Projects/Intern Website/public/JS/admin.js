
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


       // Function to preprocess and display general location
function displayGeneralLocation(location) {
    const locationParts = location.split(', '); // Split location into parts
    const generalLocation = locationParts.slice(-3).join(', '); // Extract last three parts
    return generalLocation;
}

// Define a boolean flag to track if bookings have been fetched
let bookingsFetched = false;

function filterBookings() {
    const statusFilter = document.getElementById('statusFilter');
    const selectedStatus = statusFilter.value;
    const bookingContainer = document.getElementById('bookingContainer');

    let query;

    if (selectedStatus === 'all') {
        query = db.collection("bookings").orderBy("timestamp", "desc"); // Order by bookingID
    } else if (selectedStatus === 'Assigned') {
        query = db.collection("bookings").where("status", ">=", "Assigned:").where("status", "<=", "Assigned:\uf8ff");
    } else if (selectedStatus === 'Accepted') {
        query = db.collection("bookings").where("status", ">=", "Accepted:").where("status", "<=", "Accepted:\uf8ff");
    } else if (selectedStatus === 'Not Accepted') {
        query = db.collection("bookings").where("status", ">=", "Not Accepted:").where("status", "<=", "Not Accepted:\uf8ff"); 
    } else {
        query = db.collection("bookings").where("status", "==", selectedStatus);
    }

    query.get()
        .then((querySnapshot) => {
            // Clear the booking container before adding new bookings
            bookingContainer.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const bookingData = doc.data();
                // Function to format date as "Month-day-year"
                function formatDate(date) {
                    const options = { month: 'short', day: 'numeric', year: 'numeric' };
                    return new Date(date).toLocaleDateString('en-US', options);
                }
                // Fetch parent details
                db.collection("users").doc(bookingData.userId).get()
                    .then((userDoc) => {
                        if (userDoc.exists) {
                            const parentData = userDoc.data();
                            // Check if the user has the "parent" role
                            if (parentData.role === "parent") {
                                const bookingItem = document.createElement('div');
                                const timestamp = bookingData.timestamp.toDate();
                                const dates = bookingData.date.split(',').map(date => formatDate(date.trim()));
                                bookingItem.classList.add('booking-item');
                                bookingItem.innerHTML = `
                                    <p><strong>Client Name:</strong> ${parentData.name}</p>
                                    <p><strong>Client Phone:</strong> ${parentData.phone_no}</p>
                                    <p><strong>Booking ID:</strong> ${bookingData.bookingID || ''}</p>
                                    <p><strong>Booking Made:</strong> ${timestamp.toLocaleString()}</p>
                                    <p><strong>Dates of Booking:</strong> ${dates.join(', ')}</p>
                                    <p><strong>Service Type:</strong> ${bookingData.serviceType || ''}</p>
                                    <p><strong>Location:</strong> ${displayGeneralLocation(bookingData.location) || ''}</p>
                                    <p><strong>Start Time:</strong> ${bookingData.startTime || ''}</p>
                                    <strong>Duration:</strong> ${bookingData.duration} Hours<br>
                                    <p><strong>Total Price:</strong> ${bookingData.totalPrice || ''}</p>
                                    <p><strong>Status:</strong> ${bookingData.status || ''}</p>
                                    <button class="details-btn" onclick="viewBookingDetails('${doc.id}')">View Details</button>
                                    <button class="paid" onclick="changeBookingStatus('${doc.id}', 'Paid')" ${bookingData.status === 'Under Review' ? '' : 'style="display: none;"'}>Mark as Paid</button>
                                    <button class="review" onclick="changeBookingStatus('${doc.id}', 'Invalid Payment')" ${bookingData.status === 'Under Review' ? '' : 'style="display: none;"'}>Invalid Payment</button>
                                    <button class="completed" onclick="changeBookingStatusAndMoveToCompleted('${doc.id}', 'Completed')" ${bookingData.status.startsWith('Accepted') ? '' : 'style="display: none;"'}>Mark as Completed</button>
                                    <button class="assign" onclick="changeBookingStatusAndOpenModal('${doc.id}', 'Assigning Nanny')" ${bookingData.status === 'Paid' || bookingData.status.startsWith('Not') ? '' : 'style="display: none;"'}>Assign Nanny</button>
                                    <!-- Button to upload image -->
                                    ${bookingData.status === 'Completed' ? `<button id="uploadImageButton" onclick="openImageUploadModal('${doc.id}')">Upload Nanny Payment</button>` : ''}
                                    ${shouldDisplayImageButton(bookingData.status, bookingData.imageUrl)}
                                    `;
                                bookingContainer.appendChild(bookingItem);
                            }

                        } else {
                            console.log("Parent user does not exist!");
                        }
                    })
                    .catch((error) => {
                        console.error("Error fetching parent details: ", error);
                    });
            });
            // Set the flag to true to indicate that bookings have been fetched
            bookingsFetched = true;
        })
        .catch((error) => {
            console.error("Error fetching bookings:", error);
        });
}




        // Function to determine if the image button should be displayed
        function shouldDisplayImageButton(status, imageUrl) {
            if (status === 'Under Review' || status === 'Paid' || status === 'Invalid Payment' || status === 'Completed' || status.startsWith('Assigned') || status.startsWith('Accepted') || status.startsWith('Not')) {
                return `<button class="viewimg" onclick="showImage('${imageUrl}')">View Image</button>`;
            } else {
                return ''; // Empty string if not under review, paid, or completed
            }
        }

        function changeBookingStatus(bookingId, newStatus) {
            db.collection("bookings").doc(bookingId).update({
                status: newStatus,
                statusNanny: newStatus
            })
            .then(() => {
                console.log("Booking status updated successfully");
                // Refresh bookings list
                filterBookings();
            })
            .catch((error) => {
                console.error("Error updating status: ", error);
            });
        }

        // Function to show the image
        function showImage(imageUrl) {
            const modal = document.getElementById('imageModal');
            const modalImg = document.getElementById('modalImage');
            modal.style.display = "block";
            modalImg.src = imageUrl;
        }

        // Close modal
        function closeModal() {
            const modal = document.getElementById('imageModal');
            modal.style.display = "none";
        }

        // Initially load bookings with default status
        filterBookings();



        // Function to check if the current user is an admin
        function checkAdminRole() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in, check their role
            db.collection("users").doc(user.uid).get().then((doc) => {
                if (doc.exists && (doc.data().role === "admin" || doc.data().role === "manager")) {
                    // User is an admin or manager, show the admin dashboard
                    document.getElementById('adminDashboard').style.display = 'block';
                    filterBookings(); // Or any other function to initialize the dashboard
                } else {
                    // User is not an admin or manager, hide the admin dashboard
                    document.getElementById('adminDashboard').style.display = 'none';
                    // If user role is neither 'admin' nor 'manager', show confirmation dialog
                    const confirmation = window.confirm("You are not authorized to access this page. Do you want to proceed to the authentication page?");

                    if (confirmation) {
                        window.location.href = "cover.html"; // Redirect to authentication page
                    } else {
                        logout(); // Redirect to cover page
                    }
                }

            }).catch((error) => {
                console.log("Error getting user role:", error);
                // Handle error
            });
            
        } else {
            // No user is signed in, hide the admin dashboard
            document.getElementById('adminDashboard').style.display = 'none';
            // Prompt user to sign in
            alert("You need to sign in to access the admin dashboard.");
            // Redirect to authentication page
            window.location.href = './auth.html';
        }
    });
}

// Call checkAdminRole() to determine if the user is an admin before loading the dashboard
checkAdminRole();


// Function to display an error message
function displayErrorMessage(message) {
    document.getElementById('bookingsList').innerHTML = `<p>${message}</p>`;
}


        // Function to change booking status and open the assign nanny modal
        function changeBookingStatusAndOpenModal(bookingId, newStatus) {
            if (newStatus === 'Assigning Nanny') {
                openAssignNannyModal(bookingId); // Pass bookingId to the function
            } else {
                changeBookingStatus(bookingId, newStatus);
            }
        }
        function changeBookingStatusAndMoveToCompleted(bookingId, newStatus) {
            // Change booking status
            changeBookingStatus(bookingId, newStatus);
            // Move booking to completedBookings collection
            if (newStatus === 'Completed') {
                moveBookingToCompleted(bookingId);
            }
        }

        function moveBookingToCompleted(bookingId) {
    // Move the booking document to the "completedBookings" collection
    db.collection("acceptedBooking").doc(bookingId).get()
        .then((doc) => {
            if (doc.exists) {
                const bookingData = doc.data();
                db.collection("completedbookings").doc(bookingId).set(bookingData)
                    .then(() => {
                        console.log("Booking moved to completedBookings collection");
                        // Delete the booking from the "acceptedBookings" collection
                        db.collection("acceptedBooking").doc(bookingId).delete()
                            .then(() => {
                                console.log("Booking deleted from acceptedBookings collection");
                                // Refresh bookings list
                                filterBookings();
                            })
                            .catch((error) => {
                                console.error("Error deleting booking from acceptedBookings collection:", error);
                            });
                    })
                    .catch((error) => {
                        console.error("Error moving booking to completedBookings collection:", error);
                    });
            } else {
                console.log("No such document in acceptedBookings collection!");
            }
        })
        .catch((error) => {
            console.error("Error getting booking document from acceptedBookings collection:", error);
        });
}

        // Function to open the assign nanny modal
        function openAssignNannyModal(bookingId) {
            // Show the modal
            const modal = document.getElementById('assignNannyModal');
            modal.style.display = "block";
            // Fetch and display nannies
            fetchNannies(bookingId); // Pass bookingId to the fetchNannies function
        }


// Function to close the assign nanny modal
function closeAssignNannyModal() {
    // Close the modal
    const modal = document.getElementById('assignNannyModal');
    modal.style.display = "none";
}

function fetchNannies(bookingId) {
    const nannyList = document.getElementById('nannyList');
    nannyList.innerHTML = ''; // Clear previous nannies

        // Fetch users with role 'nanny' from Firestore
        db.collection("users").where("role", "==", "nanny").get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const nannyData = doc.data();
                    const firstAddress = nannyData.city && nannyData.barangay && nannyData.province ? `${nannyData.city}, ${nannyData.barangay}, ${nannyData.province}` : ''; // Get the first address or use an empty string if no addresses

                    // Create HTML elements for nanny name and address
                    const nannyItem = document.createElement('div');
                    nannyItem.innerHTML = `
                        <input type="radio" name="nanny" value="${doc.id}" style="width: 30px; height: 30px;">
                        <label><strong>${nannyData.firstName} ${nannyData.lastName} ${nannyData.middleName}</strong> - ${firstAddress}</label>
                    `;
                    nannyList.appendChild(nannyItem);
                });
                // Add event listener to the assign button
                document.getElementById('assignNannyButton').addEventListener('click', () => assignNannyToBooking(bookingId));
            })
            .catch((error) => {
                console.error("Error fetching nannies: ", error);
            });

}

// Function to filter nannies based on location
function filterNanniesByLocation() {
    const filter = document.getElementById('nannyLocationFilter').value.toLowerCase();
    const nannyList = document.getElementById('nannyList');
    const nannies = nannyList.getElementsByTagName('div');
    for (let i = 0; i < nannies.length; i++) {
        const nannyName = nannies[i].getElementsByTagName('label')[0].innerText.toLowerCase();
        if (nannyName.includes(filter)) {
            nannies[i].style.display = "";
        } else {
            nannies[i].style.display = "none";
        }
    }
}

// Function to assign selected nanny to booking
function assignNannyToBooking(bookingId) {
    console.log("Booking ID:", bookingId); // Log the bookingId for debugging
    const selectedNannyId = document.querySelector('input[name="nanny"]:checked').value;
    console.log("Selected Nanny ID:", selectedNannyId); // Log the selected nanny ID for debugging

    // Fetch nanny information
    db.collection("users").doc(selectedNannyId).get()
        .then((doc) => {
            const selectedNannyData = doc.data();
            const nannyName = `${selectedNannyData.firstName} ${selectedNannyData.lastName}`;
            const nannyEmail = selectedNannyData.email;

            // Fetch the booking document to get the userID
            db.collection("bookings").doc(bookingId).get()
                .then((bookingDoc) => {
                    if (bookingDoc.exists) {
                        const bookingData = bookingDoc.data();
                        const userId = bookingData.userId; // Get the userID from the booking document

                        // Update booking status and include nanny's name
                        db.collection("bookings").doc(bookingId).update({
                            nannyId: selectedNannyId,
                            status: `Assigned: ${nannyName}` // Update booking status with nanny's name
                        })
                            .then(() => {
                                console.log("Nanny assigned successfully");
                                closeAssignNannyModal();
                                // Add the assignment to the assignedNanny collection
                                db.collection("assignedNanny").doc(bookingId).set({
                                bookingId: bookingId,
                                nannyId: selectedNannyId,
                                parentID: userId,
                                notifiedstatus: false,
                                parentEmail: bookingData.userEmail
                                })
                                    .then(() => {
                                        console.log("Assignment added to assignedNanny collection");
                                        // Send email to the user
                                        sendEmailToUser(bookingData.userEmail , nannyEmail);
                                        // Refresh bookings list
                                        filterBookings();
                                    })
                                    .catch((error) => {
                                        console.error("Error adding assignment to assignedNanny collection: ", error);
                                    });
                            })
                            .catch((error) => {
                                console.error("Error assigning nanny: ", error);
                            });
                    } else {
                        console.log("No such document!");
                    }
                })
                .catch((error) => {
                    console.error("Error getting booking document:", error);
                });
        })
        .catch((error) => {
            console.error("Error fetching nanny information: ", error);
        });
}

// Function to send email to user
function sendEmailToUser(userEmail , nannyEmail) {
    fetch('/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_email: userEmail , nanny_email: nannyEmail })
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
            alert('Failed to send email. Please try again later.');
        });
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
        <p><strong>Client Name:</strong> ${parentData.name || ''}</p>
        <p><strong>Client Phone:</strong> ${parentData.phone_no || ''}</p>
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
    <p><strong>Client Name:</strong> ${parentData.name}</p>
    <p><strong>Client Phone:</strong> ${parentData.phone_no}</p>
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


// Function to search bookings by Booking ID
function searchBookingById() {
    const input = document.getElementById('bookingIdSearch').value.trim();

    // Check if the input is empty
    if (input === '') {
        // If input is empty, set status filter to "All" and trigger filterBookings()
        document.getElementById('statusFilter').value = 'all';
        filterBookings();
        return; // Exit the function
    }

    // Clear previous bookings
    const bookingContainer = document.getElementById('bookingContainer');
    bookingContainer.innerHTML = '';

    // Query bookings collection
    db.collection("bookings")
        .orderBy("bookingID")
        .startAt(input)
        .endAt(input + '\uf8ff')
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const bookingData = doc.data();
                // Function to format date as "Month-day-year"
                function formatDate(date) {
                    const options = { month: 'short', day: 'numeric', year: 'numeric' };
                    return new Date(date).toLocaleDateString('en-US', options);
                }
                // Fetch parent details
                db.collection("users").doc(bookingData.userId).get()
                    .then((userDoc) => {
                        if (userDoc.exists) {
                            const parentData = userDoc.data();
                            // Check if the user has the "parent" role
                            if (parentData.role === "parent") {
                                const bookingItem = document.createElement('div');
                                const timestamp = bookingData.timestamp.toDate();
                                const dates = bookingData.date.split(',').map(date => formatDate(date.trim()));
                                bookingItem.classList.add('booking-item');
                                bookingItem.innerHTML = `
                                    <p><strong>Client Name:</strong> ${parentData.name}</p>
                                    <p><strong>Client Phone:</strong> ${parentData.phone_no}</p>
                                    <p><strong>Booking ID:</strong> ${bookingData.bookingID || ''}</p>
                                    <p><strong>Booking Made:</strong> ${timestamp.toLocaleString()}</p>
                                    <p><strong>Dates of Booking:</strong> ${dates.join(', ')}</p>
                                    <p><strong>Service Type:</strong> ${bookingData.serviceType || ''}</p>
                                    <p><strong>Location:</strong> ${displayGeneralLocation(bookingData.location) || ''}</p>
                                    <p><strong>Start Time:</strong> ${bookingData.startTime || ''}</p>
                                    <strong>Duration:</strong> ${bookingData.duration} Hours<br>
                                    <p><strong>Total Price:</strong> ${bookingData.totalPrice || ''}</p>
                                    <p><strong>Status:</strong> ${bookingData.status || ''}</p>
                                    <button class="details-btn" onclick="viewBookingDetails('${doc.id}')">View Details</button>
                                    <button class="paid" onclick="changeBookingStatus('${doc.id}', 'Paid')" ${bookingData.status === 'Under Review' ? '' : 'style="display: none;"'}>Mark as Paid</button>
                                    <button class="review" onclick="changeBookingStatus('${doc.id}', 'Invalid Payment')" ${bookingData.status === 'Under Review' ? '' : 'style="display: none;"'}>Invalid Payment</button>
                                    <button class="completed" onclick="changeBookingStatus('${doc.id}', 'Completed')" ${bookingData.status.startsWith('Accepted') ? '' : 'style="display: none;"'}>Mark as Completed</button>
                                    <button class="assign" onclick="changeBookingStatusAndOpenModal('${doc.id}', 'Assigning Nanny')" ${bookingData.status === 'Paid' ? '' : 'style="display: none;"'}>Assign Nanny</button>
                                    <!-- Button to upload image -->
                                    ${bookingData.status === 'Completed' ? `<button id="uploadImageButton" onclick="openImageUploadModal('${doc.id}')">Upload Nanny Payment</button>` : ''}
                                    ${shouldDisplayImageButton(bookingData.status, bookingData.imageUrl)}
                                `;
                                bookingContainer.appendChild(bookingItem);
                            }
                            
                        } else {
                            console.log("Parent user does not exist!");
                        }
                    })
                    .catch((error) => {
                        console.error("Error fetching parent details: ", error);
                    });
            });

            // If no bookings found, show message
            if (querySnapshot.size === 0) {
                const noResultsMessage = document.createElement('p');
                noResultsMessage.textContent = "No bookings found with the entered ID.";
                bookingContainer.appendChild(noResultsMessage);
            }
        })
        .catch((error) => {
            console.error("Error searching for booking: ", error);
        });
}


   // Function to open the image upload modal
function openImageUploadModal(bookingId) {
    // Store the bookingId in a global variable or pass it as a parameter to other functions
    currentBookingId = bookingId;
    
    // Get the modal, image element, and modal close button
    const modal = document.getElementById('imageUploadModal');
    const imageElement = document.getElementById('uploadedImage');
    const closeButton = document.querySelector('#imageUploadModal .close')

    // Fetch the booking document to get the image URL
    db.collection("bookings").doc(bookingId).get()
        .then((doc) => {
            if (doc.exists) {
                const bookingData = doc.data();
                const imageUrl = bookingData.nannyPayUrl;
                if (imageUrl) {
                    // If an image URL exists, display the image in the modal
                    imageElement.src = imageUrl;
                    imageElement.style.display = 'block'; // Show the image element
                } else {
                    imageElement.style.display = 'none';
                }
            } else {
                console.log("No such document!");
            }
        })
        .catch((error) => {
            console.error("Error fetching booking details:", error);
        });

    // Show the modal
    modal.style.display = "block";

    // Close the modal when the close button is clicked
    closeButton.addEventListener('click', closeImageUploadModal);
}

// Function to close the image upload modal
function closeImageUploadModal() {
    const modal = document.getElementById('imageUploadModal');
    modal.style.display = "none";
}



// Function to close the image upload modal
function closeImageUploadModal() {
    const modal = document.getElementById('imageUploadModal');
    modal.style.display = "none";
}

// Declare a global variable to store the current booking ID
let currentBookingId;

// Function to upload the image
function uploadImage() {
    const bookingId = currentBookingId; // Retrieve the bookingId from the global variable
    const imageFile = document.getElementById('imageFile').files[0];
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child('payment_images/' + bookingId + '/' + imageFile.name);
    imageRef.put(imageFile)
        .then((snapshot) => {
            console.log('Image uploaded successfully');
            // Get the URL of the uploaded image
            return snapshot.ref.getDownloadURL();
        })
        .then((downloadURL) => {
            // Update the booking document with the image URL
            return db.collection("bookings").doc(bookingId).update({
                nannyPayUrl: downloadURL
            });
        })
        .then(() => {
            console.log('Image URL stored in the booking document');
            closeImageUploadModal();
        })
        .catch((error) => {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again later.');
        });
}


    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

