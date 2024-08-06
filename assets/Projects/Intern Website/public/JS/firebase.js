import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";


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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
auth.languageCode = 'en';
const db = getFirestore();

const provider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

function checkUserAndRedirect(user) {
    if (user) {
        checkUserDataExists(user.uid).then((exists) => {
            if (exists) {
                // Retrieve user data from Firestore
                const userRef = doc(db, "users", user.uid);
                getDoc(userRef).then((docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const userData = docSnapshot.data();
                        // Check the user's role
                        if (userData.role === "nanny") {
                            // User role is nanny, redirect to nannyapp.html
                            window.location.href = "nannybooking.html";
                        } else if (userData.role === "parent") {
                            // User role is parent, redirect to booking.html
                            window.location.href = "booking.html";
                        } else if (userData.role === "admin" || userData.role === "manager") {
                            // User role is admin, redirect to admin.html
                            window.location.href = "todaybooking.html";
                        } else {
                            // No specific role defined or unrecognized role
                            console.error("Unrecognized user role:", userData.role);
                            // Redirect to a default page
                            window.location.href = "cover.html";
                        }
                    } else {
                        console.error("User data does not exist");
                    }
                }).catch((error) => {
                    console.error("Error getting user data:", error);
                });
            } else {
                // No user data, redirect to register.html
                window.location.href = "roles.html";
            }
        }).catch((error) => {
            console.error("Error checking user data:", error);
        });
    }
}




// Function to check if user data exists in Firestore
function checkUserDataExists(uid) {
    const userRef = doc(db, "users", uid);
    return getDoc(userRef).then((docSnapshot) => {
        return docSnapshot.exists();
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const glogin = document.getElementById("google-button");
    if (glogin) {
        glogin.addEventListener("click", function() {
            signInWithPopup(auth, provider)
                .then((result) => {
                    const user = result.user;
                    checkUserAndRedirect(user);
                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                });
        });
    }

    const facebookLogin = document.getElementById("fb-button");
    if (facebookLogin) {
        facebookLogin.addEventListener("click", function() {
            signInWithPopup(auth, facebookProvider)
                .then((result) => {
                    const user = result.user;
                    checkUserAndRedirect(user);
                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                });
        });
    }
});



