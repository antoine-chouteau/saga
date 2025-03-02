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

function toggleForms() {
    document.getElementById("login-form").classList.toggle("hidden");
    document.getElementById("signup-form").classList.toggle("hidden");
    document.getElementById("form-title").textContent = 
        document.getElementById("login-form").classList.contains("hidden") ? "Inscription" : "Connexion";
}

// 🔑 Login Function
function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => window.location.href = "profil.html") // Redirect to profile
        .catch(error => document.getElementById("message").innerText = error.message);
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