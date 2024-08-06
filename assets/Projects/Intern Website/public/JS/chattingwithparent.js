
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

// Assuming you have a way to get the current user's ID
// For example, if the user is authenticated:
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {

        logAssignedNanniesByUserId(user.uid);

        // User is signed in, call displayNannyProfiles with the user's ID
        displayNannyProfiles(user.uid);
    } else {
        // No user is signed in.
        console.log("No user is signed in.");
    }
});


async function logAssignedNanniesByUserId(userId) {
    const notificationList = document.getElementById('notification-list');
    const notificationList2 = document.getElementById('notification-list2'); // Get notification list 2

    try {
        // Set up a real-time listener for assigned nanny documents
        db.collection("acceptedBooking")
            .where("nannyId", "==", userId)
            .where("notifiedstatus", "==", false)
            .onSnapshot(async (querySnapshot) => {
                // Update notification bell count
                const notificationCountSpan = document.getElementById('notification-count');
                const notificationCountSpan2 = document.getElementById('notification-count2');

                notificationCountSpan.textContent = querySnapshot.size;
                notificationCountSpan2.textContent = querySnapshot.size;

                // Build notifications in memory
                const notifications = [];
                const notifications2 = []; // Add notifications 2 array

                for (const doc of querySnapshot.docs) {
                    const acceptedBookingData = doc.data();
                    const { bookingId, parentID } = acceptedBookingData;
                    console.log("Assigned Nanny with false notifiedstatus:", acceptedBookingData);

                    // Get nanny name
                    const parentName = await getUserName(parentID);

                    // Create a div for the new notification
                    const notificationItem = document.createElement('div');
                    notificationItem.classList.add('notification-item');
                    notificationItem.dataset.bookingId = bookingId;
                    notificationItem.dataset.parentId = parentID;
                    notificationItem.innerHTML = `
                <div class="pt-4 pr-4 pl-4 md:pt-5 md:pr-5 md:pl-5 space-y-4">
                    <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                        Booking ID: ${bookingId}. 
                        You have a newly assigned booking for parent ${parentName}. You may now chat with the Fairee in the chat.
                    </p>
                </div>
                <div class="flex items-center mt-2 mb-5 mr-4 rounded-b  flex justify-end ">
                    <button class="mark-as-read-btn mr-2 text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" style="background-color: rgb(82, 38, 147);">Mark As Read</button>
                    <button class="remove-btn py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-black hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-black dark:hover:text-white dark:hover:bg-gray-700">Visit</button>
                </div>
                <div class="flex items-center p-4 md:p-5 border-t border-black rounded-b dark:border-black flex justify-end ">
                </div>
            `;

                    // Add event listener to mark as read button
                    const markAsReadBtn = notificationItem.querySelector('.mark-as-read-btn');
                    markAsReadBtn.addEventListener('click', async () => {
                        try {
                            await doc.ref.update({ notifiedstatus: true });
                            notificationItem.remove(); // Remove the notification from UI after marking as read
                        } catch (error) {
                            console.error("Error updating notifiedstatus:", error);
                        }
                    });

                    // Add event listener to remove button
                    const removeBtn = notificationItem.querySelector('.remove-btn');
                    removeBtn.addEventListener('click', () => {
                        // Redirect to chattingwithnanny.html
                        window.location.href = 'chattingwithnanny.html';
                    });

                    notifications.push(notificationItem);
                    notifications2.push(notificationItem.cloneNode(true)); // Clone and push to notifications 2

                }

                // Append all notifications to the notification list
                notificationList.innerHTML = ''; // Clear existing notifications
                notifications.forEach(notification => {
                    notificationList.appendChild(notification);
                });

                // Append all notifications to the notification list 2
                notificationList2.innerHTML = ''; // Clear existing notifications
                notifications2.forEach(notification => {
                    notificationList2.appendChild(notification);
                });
            });

    } catch (error) {
        console.error("Error getting assigned nannies:", error);
    }
}






function displayNannyProfiles(currentUserId) {
    const nannyProfilesContainer = document.getElementById("nannyProfiles");

    // Clear existing profiles
    nannyProfilesContainer.innerHTML = '';



// Make the container a flex container and center its children
nannyProfilesContainer.classList.add("flex", "flex-wrap", "justify-center");           

    // Query documents in "acceptedBooking" where "nannyId" is the current user's ID
    db.collection("acceptedBooking").where("nannyId", "==", currentUserId).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const assignmentData = doc.data();

            // Fetch additional booking details based on bookingId
            const bookingId = assignmentData.bookingId;
            if (bookingId) {
                db.collection("bookings").doc(bookingId).get().then((bookingDoc) => {
                    if (bookingDoc.exists) {
                        const bookingData = bookingDoc.data();
                        // Fetch parent's name based on parentID
                        db.collection("users").doc(assignmentData.parentID).get().then((parentDoc) => {
                            if (parentDoc.exists) {
                                const parentData = parentDoc.data();
                                const parentName = parentData.name; // Assuming 'name' field exists in the user document
                                // Create profile card
                                const profileCard = document.createElement("div");
                                profileCard.classList.add("w-[32rem]", "rounded-xl", "shadow-md", "overflow-hidden", "p-4", "bg-purple-500");
                                profileCard.style.backgroundColor = "rgb(46, 16, 101)";

                                // Nanny Assignment details
                                const nannyAssignmentDiv = document.createElement("div");
                                nannyAssignmentDiv.classList.add("mt-4");
                                nannyAssignmentDiv.innerHTML = `
                                <div class="uppercase tracking-wide text-sm text-purple-400 font-semibold">Nanny Assignment</div>

                            <div class="mt-2">
                                <div class="text-gray-400 inline">Booking ID:</div>
                                    <div class="text-white font-semibold inline">${assignmentData.bookingId || 'N/A'}</div>
                            </div>
                            <div class="mt-2">
                                <div class="text-gray-400 inline">Parent Name:</div>
                                <div class="text-white font-semibold inline">${parentName || 'N/A'}</div>
                            </div>
                        `;
                                profileCard.appendChild(nannyAssignmentDiv);

                                // Booking details
                                const bookingDetailsDiv = document.createElement("div");
                                bookingDetailsDiv.classList.add("mt-3", "border-t-2", "border-black", "pt-4");
                                bookingDetailsDiv.innerHTML = `
                                    <div class="uppercase tracking-wide text-sm text-purple-400 font-semibold">Booking Details</div>
                                    <div class="mt-2">
                                        <div class="text-gray-400 inline">Date:</div>
                                        <div class="text-white font-semibold inline">${bookingData.date || 'N/A'}</div>
                                    </div>
                                    <div class="mt-2">
                                        <div class="text-gray-400 inline">Duration:</div>
                                        <div class="text-white font-semibold inline">${bookingData.duration || 'N/A'}</div>
                                    </div>
                                    <div class="mt-2">
                                        <div class="text-gray-400 inline">Location:</div>
                                        <div class="text-white font-semibold inline">${bookingData.location || 'N/A'}</div>
                                    </div>
                                    <div class="mt-2">
                                        <div class="text-gray-400 inline">Service Type:</div>
                                        <div class="text-white font-semibold inline">${bookingData.serviceType || 'N/A'}</div>
                                    </div>
                                    <div class="mt-2">
                                        <div class="text-gray-400 inline">Start Time:</div>
                                        <div class="text-white font-semibold inline">${bookingData.startTime || 'N/A'}</div>
                                    </div>
                                `;
                                profileCard.appendChild(bookingDetailsDiv);

                                // Chat button
                                const chatButtonContainer = document.createElement("div");
                                chatButtonContainer.classList.add("flex", "justify-end", "mt-4");
                                const chatButton = document.createElement("button");
                                chatButton.classList.add("chat-btn", "bg-purple-500", "hover:bg-purple-700", "text-white", "font-bold", "py-2", "px-4", "rounded");
                                chatButton.dataset.userId = assignmentData.nannyId;
                                chatButton.textContent = "Chat";
                                chatButton.assignmentData = assignmentData; // Store assignmentData as a property of the button
                                chatButton.dataset.bookingId = assignmentData.bookingId;
                                chatButton.addEventListener("click", handleChatButtonClick);
                                chatButtonContainer.appendChild(chatButton);
                                profileCard.appendChild(chatButtonContainer);

                                // Append profile card to container
                                nannyProfilesContainer.appendChild(profileCard);
                            } else {
                                console.log("Parent document does not exist.");
                            }
                        }).catch((error) => {
                            console.error("Error getting parent document: ", error);
                        });
                    } else {
                        console.log("Booking document does not exist.");
                    }
                }).catch((error) => {
                    console.error("Error getting booking document: ", error);
                });
            }
        });
    }).catch((error) => {
        console.log("Error getting documents: ", error);
    });
}


// Add event listener to the chat input field
document.getElementById('messageInput').addEventListener('keydown', function (event) {
    // Check if the Enter key was pressed
    if (event.keyCode === 13) {
        // Prevent the default action
        event.preventDefault();
        // Programmatically click the send button
        document.getElementById('sendMessageBtn').click();
    }
});



// Function to send a message
function sendMessage() {
    const currentUser = firebase.auth().currentUser;
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    const currentUserUID = currentUser.uid;

    if (!message) return;

    const timestamp = firebase.firestore.Timestamp.fromDate(new Date()); // Get current timestamp

    const chatDocRef = db.collection("acceptedBooking").doc(currentBookingId); // Use the stored bookingId
    chatDocRef.update({
        messages: firebase.firestore.FieldValue.arrayUnion({
            sender: currentUserUID,
            message: message,
            timestamp: timestamp // Include timestamp
        }),
        timenannyhasviewed: firebase.firestore.FieldValue.serverTimestamp()

    })
        .then(() => {
            console.log("Message sent successfully");
            // Clear input field after sending message
            messageInput.value = '';
        })
        .catch((error) => {
            console.error("Error sending message: ", error);
        });
}


// Add event listener to send message button
document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);





// Function to scroll the message box to the bottom
function scrollToBottom() {
    const chatMessagesContainer = document.getElementById('chatMessagesinputs');
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}



// Function to format timestamp
function formatTimestamp(timestamp) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return timestamp.toDate().toLocaleString('en-US', options);
}

// Global variable to store the bookingId
let currentBookingId;



// Function to handle chat button click
async function handleChatButtonClick(event) {
    const currentUser = firebase.auth().currentUser;

    if (!currentUser) {
        console.log("User not logged in.");
        return;
    }

    const nannyID = currentUser.uid;
    const parentID = event.target.assignmentData.parentID; // Get the parent's ID from assignmentData

    // Fetch username for the parent
    const parentName = await getUserName(parentID);

    // Fetch first name and last name for the nanny
    const nannyNameData = await getNannyName2(nannyID);
    const nannyName = `${nannyNameData.firstName} ${nannyNameData.lastName}`;

    // Display parent and nanny names in the chatParticipants element
    const chatParticipantsElement = document.getElementById('chatParticipants');
    chatParticipantsElement.textContent = ` ${parentName} `;
    chatParticipantsElement.style.display = 'block'; // Ensure it's visible

    // Show chat tab
    document.getElementById('chatTab').classList.remove('hidden');
    // Hide nanny profiles
    document.getElementById('nannyProfiles').classList.add('hidden');


    // Extract bookingId from the event target's dataset
    currentBookingId = event.target.dataset.bookingId;
    const currentBookingId2 = event.target.dataset.bookingId;


    // Update Firestore document with parent's view status and time
    const chatDocRef = db.collection("acceptedBooking").doc(currentBookingId);
    chatDocRef.update({
        timenannyhasviewed: firebase.firestore.FieldValue.serverTimestamp()

    })
        .then(() => {
            console.log("nanny's view status and time updated successfully.");
        })
        .catch((error) => {
            console.error("Error updating nanny's view status and time: ", error);
        });



    listenForLastSeenUpdates(currentBookingId2);



    document.getElementById('assignedTitle').style.display = 'none';


    // Call handleCheckoutButtonClick and pass nannyID
    handleCheckoutButtonClick(event.target.dataset.bookingId, nannyID, parentID, nannyName, parentName);
}



function listenForLastSeenUpdates(bookingId) {
    const chatDocRef = db.collection("acceptedBooking").doc(bookingId);
    chatDocRef.onSnapshot((doc) => {
        const data = doc.data();
        const lastSeenElement = document.getElementById('lastSeen');
        if (data.timeparenthasviewed) {
            lastSeenElement.textContent = `last seen on ${formatTimestamp(data.timeparenthasviewed)}`;
        } else {
            lastSeenElement.textContent = "Last Seen: N/A";
        }
    }, (error) => {
        console.error("Error listening for document updates: ", error);
    });
}

// Cache for sender names
const senderNameCache = {};

// Function to fetch sender name, either from cache or Firebase
async function getSenderName(senderId) {
    if (senderNameCache[senderId]) {
        return senderNameCache[senderId];
    } else {
        // Fetch sender name from Firebase
        const snapshot = await db.collection('users').doc(senderId).get();
        if (snapshot.exists) {
            const userData = snapshot.data();
            const senderName = `${userData.firstName} ${userData.lastName}`;
            senderNameCache[senderId] = senderName;
            return senderName;
        } else {
            return "Unknown";
        }
    }
}

async function handleCheckoutButtonClick(bookingId, nannyID, parentID, nannyName, parentName) {

    // Query chat document based on participants and booking ID in the acceptedBooking collection
    const chatQuery = db.collection("acceptedBooking")
        .where(firebase.firestore.FieldPath.documentId(), "==", bookingId);

    // Listen for real-time updates
    chatQuery.onSnapshot(async (querySnapshot) => {
        if (!querySnapshot.empty) {
            // Get the chat document
            const chatDocument = querySnapshot.docs[0].data();

            // Clear existing messages
            const chatMessagesContainer = document.getElementById('chatMessagesinputs');
            chatMessagesContainer.innerHTML = '';

            // Construct HTML for all messages
            let messagesHTML = '';

            // Fetch sender names in parallel
            const senderNamePromises = [];
            const senderIds = new Set();

            if (chatDocument.messages && chatDocument.messages.length > 0) {
                chatDocument.messages.forEach(messageObj => {
                    senderIds.add(messageObj.sender);
                });

                for (const senderId of senderIds) {
                    senderNamePromises.push(getSenderName(senderId));
                }

                const senderNames = await Promise.all(senderNamePromises);
                const senderNameMap = {};
                senderIds.forEach((senderId, index) => {
                    senderNameMap[senderId] = senderNames[index];
                });

                // Display messages and timestamps
                chatDocument.messages.forEach(messageObj => {
                    const isCurrentUser = messageObj.sender === nannyID;
                    const senderName = senderNameMap[messageObj.sender];

                    // Construct HTML for current message
                    let seenStatus = "Not Seen";
                    if ((isCurrentUser && chatDocument.timeparenthasviewed && messageObj.timestamp <= chatDocument.timeparenthasviewed) ||
                        (!isCurrentUser && chatDocument.timenannyhasviewed && messageObj.timestamp <= chatDocument.timenannyhasviewed)) {
                        seenStatus = "Seen";
                    }

                    const messageHTML = `
            <div class="mb-2 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}">
                <div class="rounded-lg p-2 max-w-xs ${isCurrentUser ? 'bg-green-200 text-white' : 'bg-white text-gray-800'} ${seenStatus === 'Seen' ? 'seen' : 'not-seen'}">
                    <div class="text-gray-600">${isCurrentUser ? nannyName : parentName}</div>
                    <div class="text-gray-800">${messageObj.message}<br><span class="text-xs text-black-400">${formatTimestamp(messageObj.timestamp)} - ${seenStatus}</span></div>
                </div>
            </div>
        `;


                    const chatDocRef = db.collection("acceptedBooking").doc(bookingId);


                    // Log when parent sends a new message after nanny has viewed the chat
                    if (!isCurrentUser && chatDocument.timenannyhasviewed && messageObj.timestamp > chatDocument.timenannyhasviewed) {
                        console.log(`${parentName} sent a new message after nanny viewed the chat: ${messageObj.message}`);

                        // Check if chat tab is not hidden and document is visible
                        if (!document.getElementById('chatTab').classList.contains('hidden') && document.visibilityState === 'visible') {
                            chatDocRef.update({
                                timenannyhasviewed: firebase.firestore.FieldValue.serverTimestamp()
                            }).then(() => {
                                console.log("Nanny's view status and time updated successfully.");
                            }).catch((error) => {
                                console.error("Error updating nanny's view status and time: ", error);
                            });
                        }
                    }


                    messagesHTML += messageHTML;
                });
            } else {
                messagesHTML = '<p>No messages found in this chat document.</p>';
            }

            // Append all messages at once
            chatMessagesContainer.innerHTML = messagesHTML;

            // After displaying messages, scroll to the bottom
            scrollToBottom();
        } else {
            console.error("Chat does not exist.");
        }
    }, (error) => {
        console.error("Error checking existing chat: ", error);
    });

}


// Function to fetch username for the parent
async function getUserName(uid) {
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        if (userDoc.exists) {
            return userDoc.data().name; // Assuming 'name' field exists in your user document
        } else {
            return "Unknown User";
        }
    } catch (error) {
        console.error("Error getting user name: ", error);
        return "Unknown User";
    }
}

// Function to fetch first name and last name for the nanny
async function getNannyName2(uid) {
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        if (userDoc.exists) {
            return userDoc.data(); // Assuming 'firstName' and 'lastName' fields exist in your user document
        } else {
            return { firstName: "Unknown", lastName: "User" };
        }
    } catch (error) {
        console.error("Error getting nanny name: ", error);
        return { firstName: "Unknown", lastName: "User" };
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





// Function to go back to profiles
function backToProfiles() {
    // Hide chat tab
    document.getElementById('chatTab').classList.add('hidden');
    // Show nanny profiles
    document.getElementById('nannyProfiles').classList.remove('hidden');

    document.querySelector('h1.text-white.text-5xl.font-bold.mb-12.text-center').style.display = 'block';

}


// Display current user's UID
const currentUserUID = document.getElementById("currentUserUID");
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
    } else {
    }
});
