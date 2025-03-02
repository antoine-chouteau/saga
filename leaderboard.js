// 🔥 Firebase Config (same as other pages)
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

// 📥 Fetch leaderboard (last 60 days)
function loadLeaderboard() {
    const leaderboardBody = document.getElementById("leaderboard-body");
    leaderboardBody.innerHTML = "<tr><td colspan='3'>Chargement...</td></tr>";

    // 📆 Get timestamp for 60 days ago
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const timestampLimit = firebase.firestore.Timestamp.fromDate(sixtyDaysAgo);

    // 🔥 Query top scores from last 60 days (from "leaderboard" collection)
    db.collection("leaderboard")
        .where("timestamp", ">=", timestampLimit) // Scores within 60 days
        .orderBy("score", "desc") // Sort by highest score
        .limit(10) // Get top 10 scores
        .get()
        .then(snapshot => {
            leaderboardBody.innerHTML = ""; // Clear old data

            if (snapshot.empty) {
                leaderboardBody.innerHTML = "<tr><td colspan='3'>Aucun score disponible</td></tr>";
                return;
            }

            let rank = 1;
            snapshot.forEach(doc => {
                const data = doc.data();
                const row = `<tr>
                    <td>#${rank++}</td>
                    <td>${data.username}</td>
                    <td>${data.score}</td>
                </tr>`;
                leaderboardBody.innerHTML += row;
            });
        })
        .catch(error => {
            console.error("Erreur leaderboard:", error);
            leaderboardBody.innerHTML = "<tr><td colspan='3'>Erreur chargement</td></tr>";
        });
}

// 🚀 Load leaderboard on page load
window.onload = loadLeaderboard;

function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "index.html"; // Redirect to login
    }).catch(error => {
        console.error("Logout Error:", error);
    });
}

firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        window.location.href = "index.html"; // Redirect to login
    }
});
