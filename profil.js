// 🔥 Firebase Config (Same as auth.js)
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
const auth = firebase.auth();
const db = firebase.firestore();
const perkprice = 1000;

let userData = {}; // Store user data

// ✅ Check if user is logged in
auth.onAuthStateChanged(user => {
    if (user) {
        loadUserProfile(user.uid);
    } else {
        window.location.href = "login.html"; // Redirect if not logged in
    }
});

// 📥 Load User Data
function loadUserProfile(userId) {
    db.collection("users").doc(userId).get().then(doc => {
        if (doc.exists) {
            userData = doc.data();
            document.getElementById("username").textContent = userData.username;
            document.getElementById("best-score").textContent = userData.best_score;
            document.getElementById("currency").textContent = userData.currency;
            displayPerks();
        }
    });
}

// 🎁 Display Perks
function displayPerks() {
    const perksContainer = document.getElementById("perks-container");
    perksContainer.innerHTML = "";

    Object.keys(userData.perks).forEach(perk => {
        const perkStatus = userData.perks[perk] ? "✔️ Débloqué" : "❌ Non débloqué";
        const perkClass = userData.perks[perk] ? "perk unlocked" : "perk";
        
        const perkElement = document.createElement("p");
        perkElement.className = perkClass;
        perkElement.textContent = `${perk}: ${perkStatus}`;
        perksContainer.appendChild(perkElement);
    });
}

// 🛒 Buy a Perk
function buyPerk() {
    if (userData.currency < perkprice) {
        alert("Pas assez de monnaie !");
        return;
    }

    // Find a locked perk
    const lockedPerks = Object.keys(userData.perks).filter(perk => !userData.perks[perk]);
    if (lockedPerks.length === 0) {
        alert("Tous les perks sont déjà débloqués !");
        return;
    }

    // Unlock the first available perk
    const perkToUnlock = lockedPerks[0];
    userData.perks[perkToUnlock] = true;
    userData.currency -= perkprice;

    // Update Firestore
    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection("users").doc(user.uid).update({
                perks: userData.perks,
                currency: userData.currency
            }).then(() => {
                displayPerks();
                document.getElementById("currency").textContent = userData.currency;
            });
        }
    });
}

// 🚪 Logout Function
function logout() {
    auth.signOut().then(() => {
        window.location.href = "login.html";
    });
}

firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        window.location.href = "index.html"; // Redirect to login
    }
});