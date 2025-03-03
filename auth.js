// 🔥 Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyBzSDTUufNTzd1ZgqnjhryH5H4Mu0x6Le4",
    authDomain: "sagadb-97f7c.firebaseapp.com",
    projectId: "sagadb-97f7c",
    storageBucket: "sagadb-97f7c.firebasestorage.app",
    messagingSenderId: "597974057996",
    appId: "1:597974057996:web:e411d697ac39234e6f9a29"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

console.log("Firebase Auth Instance:", auth);

function toggleForms() {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    if (!loginForm || !signupForm) {
        console.error("Forms not found!");
        return;
    }

    loginForm.classList.toggle("hidden");
    signupForm.classList.toggle("hidden");
}

// 🔑 Login Function
function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Fetch username from Firestore
            return firebase.firestore().collection("users").doc(user.uid).get();
        })
        .then((doc) => {
            if (doc.exists) {
                const username = doc.data().username;
                localStorage.setItem("username", username); // Store for later use
                window.location.href = "profil.html"; // Redirect
            } else {
                console.error("No such user document!");
            }
        })
        .catch(error => {
            document.getElementById("error-message").innerText = error.message;
        });
}

function register() {
    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    
    if (!username || !email || !password) {
        document.getElementById("message").innerText = "Veuillez remplir tous les champs.";
        return;
    }

    // Check if username already exists in Firestore
    db.collection("users").where("username", "==", username).get()
    .then(snapshot => {
        if (!snapshot.empty) {
            document.getElementById("message").innerText = "Ce nom d'utilisateur est déjà pris.";
            return;
        }

        // Create user in Firebase Auth
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            
            // Store user info in Firestore
            return db.collection("users").doc(user.uid).set({
                username: username,
                email: email,
                bestScore: 0,  // Initialize best score
                currency: 0,   // Initialize currency
                perks: {        // Initialize perks
                    perk1: false,
                    perk2: false,
                    perk3: false,
                    perk4: false,
                    perk5: false
                },
                answeredQuestions: [] // Store answered question IDs
            });
        })
        .then(() => {
            window.location.href = "profil.html"; // Redirect to profile page
        })
        .catch(error => {
            document.getElementById("message").innerText = error.message;
        });

    })
    .catch(error => {
        console.error("Erreur lors de la vérification du pseudo :", error);
    });
}