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
const PERK_PRICE = 1000;

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
            document.getElementById("currency").textContent = userData.currency+" 🪙";
            displayPerks(userId);
        }
    });
}

// 🎁 Display Perks
function displayPerks(userId) {
    const perksContainer = document.getElementById("perks-container");
    perksContainer.innerHTML = ""; // Clear previous content

    const perkNames = {
        vieAdditionnelle: "Vie Additionnelle",
        tempsAdditionnel1: "Temps Additionnel Round Final +20s",
        tempsAdditionnel2: "Temps Additionnel Round Final +20s",
        doubleScore: "Double Score",
        skipQuestion: "Passer une Question"
    };

    Object.keys(perkNames).forEach(perk => {
        const isUnlocked = userData.perks?.[perk] ?? false;
        const perkDisplayName = perkNames[perk] || perk;

        const perkElement = document.createElement("div");
        perkElement.className = `perk ${isUnlocked ? "unlocked" : "locked"}`;
        
        perkElement.innerHTML = `
            <p>${perkDisplayName}: ${isUnlocked ? "✔️ Débloqué" : "❌ Non débloqué"}</p>
        `;

        if (!isUnlocked) {
            const buyButton = document.createElement("button");
            buyButton.textContent = `Acheter (${PERK_PRICE} 🪙)`;
            buyButton.disabled = userData.currency < PERK_PRICE;
            buyButton.classList.add("buy-button");

            buyButton.addEventListener("click", async () => {
                await unlockPerk(userId, perk, PERK_PRICE);
                loadUserProfile(userId); // Refresh UI
            });

            perkElement.appendChild(buyButton);
        }

        perksContainer.appendChild(perkElement);
    });
}

async function unlockPerk(userId, perkName, cost) {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return;

    let userData = userDoc.data();
    
    if (userData.currency >= cost && !userData.perks?.[perkName]) {
        await userRef.update({
            currency: userData.currency - cost,
            [`perks.${perkName}`]: true
        });
        console.log(`${perkName} débloqué !`);
    } else {
        console.log("Pas assez de monnaie ou déjà débloqué.");
    }
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