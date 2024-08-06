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

        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        const storage = firebase.storage()
        const auth = firebase.auth();

        let editBookingId = null; // To store the id of the booking being edited

        // Function to generate a unique ID for the uploaded image
        function generateImageId() {
            // Generate a random string of 8 characters
            return Math.random().toString(36).substr(2, 8);
        }

        // Define a global variable to store the file name
        let uploadedFileName = '';

        // Add event listener for image upload form submission
        document.getElementById("uploadImageForm").addEventListener("submit", function (event) {
            event.preventDefault();
            const imageFile = document.getElementById("imageFile").files[0];
            if (!imageFile) {
                alert("Please select an image file.");
                return;
            }

            // Check if editBookingId is set
            if (!editBookingId) {
                console.error("No booking selected for image upload.");
                return;
            }

            // Reference to the storage bucket where images will be uploaded
            const storageRef = firebase.storage().ref(); // Define storageRef here

            // Generate a unique ID for the image
            const imageId = generateImageId();

            // Check if there's already an image associated with the booking
            db.collection("bookings").doc(editBookingId).get().then(doc => {
                if (doc.exists) {
                    const bookingData = doc.data();
                    if (bookingData.imageUrl) {
                        // If there's an existing image, ask for confirmation
                        if (confirm("There is already an image associated with this booking. Do you want to replace it?")) {
                            // Proceed with image upload
                            uploadImage(storageRef, imageId, imageFile);
                        } else {
                            // User canceled the action
                            return;
                        }
                    } else {
                        // No existing image, proceed with image upload
                        uploadImage(storageRef, imageId, imageFile);
                    }
                }
            }).catch(error => {
                console.error("Error checking existing image:", error);
            });
        });

        // Function to upload image
        function uploadImage(storageRef, imageId, imageFile) {
            // Upload the image file to the storage bucket
            const imageRef = storageRef.child(`images/${imageId}`);
            imageRef.put(imageFile)
                .then((snapshot) => {
                    // Image uploaded successfully, get the download URL
                    const fileName = imageFile.name; // Get the name of the uploaded file
                    uploadedFileName = fileName; // Store the file name in the global variable
                    document.getElementById('fileNameDisplay').innerText = `Selected file: ${fileName}`; // Update the span element with the filename
                    return snapshot.ref.getDownloadURL();
                })
                .then((downloadURL) => {
                    // Update the booking document in Firestore with the image URL
                    return db.collection("bookings").doc(editBookingId).update({
                        imageUrl: downloadURL,
                        status: "Under Review"
                    });
                })
                .then(() => {
                    console.log("Image uploaded and booking document updated successfully.");
                    // Show a prompt message to the user
                    alert("Image uploaded successfully.");
                    // Close the modal after successful upload
                    const uploadImageModal = new bootstrap.Modal(document.getElementById('uploadImageModal'));
                    uploadImageModal.hide();
                    // Reload the page
                    window.location.reload();
                })
                .catch((error) => {
                    console.error("Error uploading image:", error);
                    alert("An error occurred while uploading the image.");
                });
        }
        


        firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // Function to format date as "Month-day-year"
        function formatDate(date) {
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            return new Date(date).toLocaleDateString('en-US', options);
        }

        const userId = user.uid;
        db.collection("bookings").where("userId", "==", userId).orderBy("timestamp", "desc").get().then((querySnapshot) => {
            const bookingDataBody = document.getElementById("bookingData");
            bookingDataBody.innerHTML = '';
            // Render booking data and dynamically set data-id for upload image buttons
            querySnapshot.forEach((doc) => {
                const bookingData = doc.data();
                // Get the Firestore Timestamp and convert it to a JavaScript Date object
                const timestamp = bookingData.timestamp.toDate();
                // Format the date
                const dates = bookingData.date.split(',').map(date => formatDate(date.trim()));
                const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>
                                <div class="bg-pink-200 rounded-xl p-4 text-lg"> 
                                    <h1 class="font-bold text-2xl">Booking Details </h1>
                                    
                                    <p><strong>Booking ID:</strong> ${bookingData.bookingID || ''}</p>
                                    <p><strong>Booking Time Stamp:</strong> ${timestamp.toLocaleString()}</p>
                                    <p><strong>Dates of Booking:</strong> ${dates.join(', ')}</p>
                                    <strong>Location:</strong> ${bookingData.location || ''}<br>
                                    <strong>Start Time:</strong> ${bookingData.startTime || ''}<br>
                                    <strong>Duration:</strong> ${bookingData.duration} Hours<br>
                                    <strong>Service Rate:</strong> ${bookingData.durationPrice || ''}<br>
                                    <strong>Transportation Fee:</strong> ${bookingData.transportationFee || ''}<br>
                                    <strong>Total:</strong> ${bookingData.totalPrice || ''}<br>
                                    <strong class="mb-4">
                                        Status: 
                                        <button type="button" class="btn btn-warning" onmouseover="showModal(this)" onmouseout="hideModal()" data-status="${bookingData.status || 'Invalid Payment'}">
                                            ${bookingData.status || 'Invalid Payment'} <!-- This will show the status -->
                                        </button> 
                                    </strong><br>
                                    <button type="button" class="btn btn-primary edit-btn mt-2" data-id="${doc.id}" ${bookingData.status === 'Canceled' || bookingData.status === 'Completed' ? 'disabled style="display: none;"' : ''}>Edit</button>
                                    <button type="button" class="btn btn-danger delete-btn mt-2" data-id="${doc.id}" data-bs-toggle="modal" data-bs-target="#deleteConfirmationModal" ${bookingData.status === 'Canceled' || bookingData.status.startsWith('Assigned')|| bookingData.status.startsWith('Accepted') || bookingData.status === 'Completed' || bookingData.status === 'Paid' ? 'disabled style="display: none;"' : ''}>Cancel</button>
                                    <button class="btn btn-primary upload-image-btn dark-green-btn mt-2" type="button" data-id="${doc.id}" data-bs-toggle="modal" data-bs-target="#uploadImageModal" ${bookingData.status === 'Canceled' || bookingData.status.startsWith('Assigned')|| bookingData.status.startsWith('Accepted') || bookingData.status === 'Completed' ? 'disabled style="display: none;"' : ''}>Payment Upload</button>
                                    <button class="btn mt-2" type="button" onclick="viewNannyID('${doc.id}', '${bookingData.nannyId}')" ${!bookingData.status.startsWith('Assigned') && !bookingData.status.startsWith('Accepted') ? 'disabled style="display: none;"' : ''}style="background-color: purple;color: white;">View Nanny ID</button>
                                    <button type="button" class="btn btn-info text-white modeofpayment-btn mt-2" data-id="${doc.id}" data-bs-toggle="modal" data-bs-target="#modal" ${bookingData.status === 'Mode' ? 'disabled style="display: none;"' : ''}>Mode of Payment</button>
                                </div>      
                            </td>
                        `;
                        bookingDataBody.appendChild(row);
                    });
                    // Initially filter by "All" status
                    filterBookings("all");

                    // Add event listener for all upload image buttons
                    document.querySelectorAll('.upload-image-btn').forEach(btn => {
                        btn.addEventListener('click', function () {
                            const bookingId = this.getAttribute('data-id');
                            editBookingId = bookingId; // Set global bookingId to the id of the document to upload image for
                        });
                    });

                    // Initialize modal and adjust backdrop
                    var myModal = new bootstrap.Modal(document.getElementById('editBookingModal'), {
                        backdrop: false, // Set backdrop to false to remove the semi-transparent black backdrop
                        keyboard: false
                    });

                    // Add click event for all edit buttons
                    document.querySelectorAll('.edit-btn').forEach(btn => {
                        btn.addEventListener('click', function () {
                            const bookingId = this.getAttribute('data-id');
                            editBookingId = bookingId; // Set global bookingId to the id of the document to edit
                            db.collection("bookings").doc(bookingId).get().then(doc => {
                                if (doc.exists) {
                                    const bookingData = doc.data();
                                    document.getElementById('editDate').value = bookingData.date;
                                    document.getElementById('editServiceType').value = bookingData.serviceType;
                                    document.getElementById('editLocation').value = bookingData.location;

                                    // Convert startTime from AM/PM format to 24-hour format
                                    const timeParts = bookingData.startTime.split(" ")[0].split(":");
                                    let hours = parseInt(timeParts[0]);
                                    const minutes = timeParts[1];
                                    const meridian = bookingData.startTime.split(" ")[1];

                                    // Convert hours to 24-hour format
                                    if (meridian === "PM" && hours !== 12) {
                                        hours += 12;
                                    } else if (meridian === "AM" && hours === 12) {
                                        hours = 0;
                                    }

                                    // Format hours and set the value of the input field
                                    const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes}`;
                                    document.getElementById('editStartTime').value = formattedTime;

                                    document.getElementById('editDuration').value = bookingData.duration;
                                    document.getElementById('editDurationPrice').value = bookingData.durationPrice;
                                    document.getElementById('editTransportationFee').value = bookingData.transportationFee;
                                    document.getElementById('editTotalPrice').value = bookingData.totalPrice || '';

                                    var myModal = new bootstrap.Modal(document.getElementById('editBookingModal'), {
                                        backdrop: 'static',
                                        keyboard: false
                                    });
                                    myModal.show();
                                }
                            });
                        });
                    });
                }).catch((error) => {
                    console.error("Error getting documents:", error);
                });

            } else {
                console.log("User is not logged in.");
            }
        });




        document.getElementById("editBookingForm").addEventListener("submit", function (event) {
            event.preventDefault();
            const updatedDate = document.getElementById("editDate").value;
            const updatedServiceType = document.getElementById("editServiceType").value;
            const updatedLocation = document.getElementById("editLocation").value;

            // Convert time back to 12-hour format
            const startTime = document.getElementById("editStartTime").value;
            const timeParts = startTime.split(":");
            let hours = parseInt(timeParts[0]);
            let meridian = "AM";
            if (hours >= 12) {
                meridian = "PM";
                if (hours > 12) {
                    hours -= 12;
                }
            }
            if (hours === 0) {
                hours = 12;
            }
            const updatedStartTime = `${hours}:${timeParts[1]} ${meridian}`;

            const updatedDuration = document.getElementById("editDuration").value;
            const updatedDurationPrice = document.getElementById("editDurationPrice").value;
            const updatedTransportationFee = document.getElementById("editTransportationFee").value;
            const updatedTotalPrice = document.getElementById("editTotalPrice").value;

            // Update the updatedData object to include these new fields:
            const updatedData = {
                date: updatedDate,
                serviceType: updatedServiceType,
                location: updatedLocation,
                startTime: updatedStartTime,
                duration: updatedDuration,
                durationPrice: updatedDurationPrice, // New field
                transportationFee: updatedTransportationFee, // New field
                totalPrice: updatedTotalPrice, // New field
            };


            if (editBookingId) {
                db.collection("bookings").doc(editBookingId).update(updatedData)
                    .then(() => {
                        console.log("Booking updated successfully!");
                        window.location.reload(); // Reload the page to show the updated data
                    })
                    .catch((error) => {
                        console.error("Error updating booking:", error);
                    });
            }

        });


        // Function to calculate pricing based on location
        function calculatePrices(locationInput, selectedStartTime, selectedDuration) {
            let transportationFee = 0;
            if (locationInput.toLowerCase().includes('manila')) {
                transportationFee = 150;
            } else if (locationInput.toLowerCase().includes('rizal')) {
                transportationFee = 200;
            } else if (locationInput.toLowerCase().includes('laguna') || locationInput.toLowerCase().includes('cavite') || locationInput.toLowerCase().includes('bulacan')) {
                transportationFee = 250;
            }

            let durationPrice = 0;
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

            // Calculate total price
            const totalPrice = transportationFee + durationPrice;

            return { transportationFee, durationPrice, totalPrice };
        }

        // Add event listeners for Location, Start Time, and Duration
        document.getElementById('editLocation').addEventListener('input', function () {
            updatePrices();
        });

        document.getElementById('editStartTime').addEventListener('input', function () {
            updatePrices();
        });

        document.getElementById('editDuration').addEventListener('change', function () {
            updatePrices();
        });

        // Function to update prices based on user input
        function updatePrices() {
            const locationInput = document.getElementById('editLocation').value;
            const selectedStartTime = document.getElementById('editStartTime').value;
            const selectedDuration = document.getElementById('editDuration').value;

            const { transportationFee, durationPrice, totalPrice } = calculatePrices(locationInput, selectedStartTime, selectedDuration);

            // Update input fields with calculated prices
            document.getElementById('editDurationPrice').value = durationPrice;
            document.getElementById('editTransportationFee').value = transportationFee;
            document.getElementById('editTotalPrice').value = totalPrice;
        }

        // Disable input fields for Duration Price, Transportation Fee, and Total Price
        document.getElementById('editDurationPrice').disabled = true;
        document.getElementById('editTransportationFee').disabled = true;
        document.getElementById('editTotalPrice').disabled = true;


        // Add event listener for all delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const bookingId = this.getAttribute('data-id');
                editBookingId = bookingId;

                // Retrieve start time of the booking from Firestore
                db.collection("bookings").doc(bookingId).get().then(doc => {
                    if (doc.exists) {
                        const bookingData = doc.data();
                        const startTime = new Date(bookingData.startTime); // Convert start time to JavaScript Date object

                        // Calculate current time
                        const currentTime = new Date();
                        const twelveHoursBeforeBooking = new Date(startTime);
                        twelveHoursBeforeBooking.setHours(twelveHoursBeforeBooking.getHours() - 12);

                        // Check if current time is less than 12 hours before start time
                        if (currentTime < twelveHoursBeforeBooking) {
                            // Enable the delete button
                            deleteButton.disabled = true;
                            console.log("Booking cannot be canceled. It's too close to the start time.");
                        } else {
                            // Set the global variable editBookingId to the correct booking ID
                            editBookingId = bookingId;
                        }
                    }
                }).catch(error => {
                    console.error("Error getting booking start time:", error);
                });
            });
        });
               // Add click event for mode of payment button
               document.addEventListener('DOMContentLoaded', function() {
            const modal = document.getElementById('modal');
            const closeModalBtn = document.getElementById('close-modal');
            const doneBtn = document.getElementById('doneBtn');
        
            // Function to show the modal
            function showModal() {
                modal.style.display = 'block';
            }

            // Function to hide the modal
            function hideModal() {
                modal.style.display = 'none';
            }

            // Assuming you have a button to open the modal, add an event listener
            const openModalBtn = document.getElementById('openModalBtn');
            if (openModalBtn) {
                openModalBtn.addEventListener('click', showModal);
            }

            // Add event listeners to the close and done buttons
            closeModalBtn.addEventListener('click', hideModal);
            doneBtn.addEventListener('click', hideModal);
        });

        // Add click event for delete confirmation button
        document.getElementById("confirmDeleteBtn").addEventListener("click", function () {
            const deleteButton = document.querySelector('.delete-btn[data-id]');
            const bookingId = deleteButton ? deleteButton.getAttribute('data-id') : null;
            console.log("editBookingId value before deletion:", bookingId);

            if (bookingId) {
                // Proceed to update the booking status to "Canceled"
                db.collection("bookings").doc(bookingId).update({
                    status: "Canceled"
                }).then(() => {
                    console.log("Booking canceled successfully!");
                    // Reload the page to reflect changes
                    window.location.reload();
                }).catch((error) => {
                    console.error("Error canceling booking:", error);
                });
            } else {
                console.log("No booking selected for cancelation.");
            }

            // Update the button text to "Canceled"
            const pendingButton = document.querySelector('.btn.btn-warning');
            if (pendingButton) {
                pendingButton.textContent = "Canceled";
            }
        });

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


        function viewNannyID(bookingId, nannyId) {
            // Get nanny's ID photo URL from Firestore
            db.collection("users").doc(nannyId).get().then((doc) => {
                if (doc.exists) {
                    const idPhotoURL = doc.data().idPhotoURL;
                    // Display the ID photo in a modal
                    displayNannyIDModal(idPhotoURL);
                } else {
                    console.log("Nanny document does not exist");
                }
            }).catch((error) => {
                console.error("Error getting nanny document:", error);
            });
        }

        function displayNannyIDModal(idPhotoURL) {
            // Create a modal element
            const modal = document.createElement('div');
            modal.classList.add('modal', 'fade');
            modal.id = 'nannyIDModal';
            modal.setAttribute('tabindex', '-1');
            modal.setAttribute('aria-labelledby', 'nannyIDModalLabel');
            modal.setAttribute('aria-hidden', 'true');

            // Create a modal dialog
            const modalDialog = document.createElement('div');
            modalDialog.classList.add('modal-dialog', 'modal-dialog-centered');
            modalDialog.setAttribute('role', 'document');

            // Create a modal content
            const modalContent = document.createElement('div');
            modalContent.classList.add('modal-content');

            // Create a modal header
            const modalHeader = document.createElement('div');
            modalHeader.classList.add('modal-header');

            // Create a close button for the modal
            const closeButton = document.createElement('button');
            closeButton.type = 'button';
            closeButton.classList.add('btn-close');
            closeButton.setAttribute('data-bs-dismiss', 'modal');
            closeButton.setAttribute('aria-label', 'Close');

            // Create a modal body
            const modalBody = document.createElement('div');
            modalBody.classList.add('modal-body');

            // Create an image element for the ID photo
            const img = document.createElement('img');
            img.src = idPhotoURL;
            img.alt = 'Nanny ID Image';
            img.classList.add('img-fluid');

            // Append elements to the modal
            modalHeader.appendChild(closeButton);
            modalBody.appendChild(img);
            modalContent.appendChild(modalHeader);
            modalContent.appendChild(modalBody);
            modalDialog.appendChild(modalContent);
            modal.appendChild(modalDialog);

            // Append the modal to the body
            document.body.appendChild(modal);

            // Show the modal
            const nannyIDModal = new bootstrap.Modal(modal);
            nannyIDModal.show();
        }

        var hoverTimer; // Variable to hold the timer
    
        // Function to show appropriate modal when hovering over the button
        function showModal(button) {
            hoverTimer = setTimeout(function () {
                var buttonText = button.textContent.trim();
                if (buttonText === 'For Payment') {
                    openPaymentGuidelinesModal();
                } else if (buttonText === 'Invalid Payment') {
                    openInvalidPaymentModal();
                }
            }, 1000); // Set a delay of 1000 milliseconds (1 second)
        }
    
        // Function to hide modal when not hovering over the button
        function hideModal() {
            clearTimeout(hoverTimer); // Clear the timer
            $('#paymentGuidelinesModal').modal('hide');
            $('#invalidPaymentModal').modal('hide');
        }
    
        // Function to open payment guidelines modal
        function openPaymentGuidelinesModal() {
            $('#paymentGuidelinesModal').modal('show');
        }
    
        // Function to open invalid payment modal
        function openInvalidPaymentModal() {
            $('#invalidPaymentModal').modal('show');
        }

       function filterBookings(status) {
    const bookingRows = document.querySelectorAll("#bookingData tr");
    bookingRows.forEach(row => {
        const statusButton = row.querySelector(".btn-warning");
        const statusText = statusButton.getAttribute("data-status");
        if (status === "all" || statusText === status || (status === "Accepted" && statusText.startsWith("Accepted")) || (status === "Assigned" && statusText.startsWith("Assigned"))) {
            row.style.display = "table-row";
        } else {
            row.style.display = "none";
        }
    });
}

// Add event listener for filter dropdown change
document.getElementById("filterStatus").addEventListener("change", function() {
    const selectedStatus = this.value;
    filterBookings(selectedStatus);
});


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