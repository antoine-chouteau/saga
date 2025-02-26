let questions = [];
let usedQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let quizLengh = 30;
let levelLength = 10;
let maxLives = 3;
let lives = 3;
let timerInterval;
let startTime;
let difficulty = ""; // Variable to store the selected difficulty
let username = ""; // Variable to store the player's username
let currentTheme;
let level = 1;
let hasRemoveTwoBonus = 0;
let bonusAppeared = false; // Ensures bonus appears only once per level
let bonusQuestionNumber = Math.floor(Math.random() * levelLength) + 1; // Pick a random question (1-levelLength)
let correctAnswer = "";
let themeCount = {};
let finalTimer = 45;
let finalNumber = 30;

const usernameScreen = document.getElementById("username-screen");
const usernameInput = document.getElementById("username-input");
const startScreen = document.getElementById("start-screen");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const startButton = document.getElementById("start-btn");
const quizContainer = document.getElementById("quiz-container");
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const feedbackElement = document.getElementById("feedback");
const livesElement = document.getElementById("lives");
const timerText = document.getElementById("timer-text");
const progressCircle = document.querySelector(".progress-circle");

const themes = ["Histoire et Civilisations", "Sciences et Nature", "Culture Générale et Société", "Géographie et Monde", "Sport et Jeux", "Culture Pop et Divertissement"];
const themeColors = {
    "Histoire et Civilisations": "#FF5733", // Red
    "Sciences et Nature": "#006400", // Green
    "Culture Générale et Société": "#9370DB", // Purple
    "Géographie et Monde": "#3357FF", // Blue
    "Sport et Jeux": "#8B4513", // Brown
    "Culture Pop et Divertissement": "#FF8C00" // Orange
};


difficultyButtons.forEach(button => {
    button.addEventListener("click", () => {
        difficultyButtons.forEach(btn => btn.classList.remove("selected")); // Retire la sélection des autres boutons
        button.classList.add("selected"); // Ajoute la classe au bouton sélectionné
        difficulty = button.dataset.difficulty; // Stocke la difficulté choisie
    });
});

// Load questions and start game
startButton.addEventListener("click", () => {
    username = usernameInput.value.trim();

    // Check if the username is empty
    if (username === "") {
        alert("Please enter a valid username!");
        return;
    }

    if (difficulty === "") {
        alert("Veuillez choisir une difficulté !");
        return;
    }

    // Hide the username screen and show the start screen
    usernameScreen.style.display = "none";
    
    fetch(`questions_${difficulty}.json`)
        .then(response => response.json())
        .then(data => {
            questions = data; 
            console.log(`Questions (${difficulty})s chargées :`, questions);
            quizContainer.style.display = "block";
            startQuiz();  // Start the quiz once questions are loaded
        })
        .catch(error => {
            console.error("Erreur lors du chargement des questions :", error);
            alert("Impossible de charger les questions !");
        });
});

function fetchQuestions(theme) {
    // Filter the already fetched questions based on the current theme
    return questions.filter(question => question.theme === theme);
}

function showNextQuestion(selectedTheme) {
    currentTheme = selectedTheme;
    let currentQuestions = fetchQuestions(currentTheme)
    showQuestion(currentQuestions);
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    lives = 3;
    updateLives();
    nextButton.style.display = "none";
    feedbackElement.textContent = "";

    first_question = shuffleArray(questions).slice(0, 1);

    showQuestion(first_question);
}


// Function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function showQuestion(questions) {
    if (lives === 0) {
        gameOver();
        return;
    }

    resetState();

    let availableQuestions = questions.filter(q => !usedQuestions.includes(q.id)); // Exclude used ones

    if (availableQuestions.length === 0) {
        console.log("All questions used, reshuffling...");
        usedQuestions = []; // Reset if all questions were used
        availableQuestions = questions; // Reuse the full set
    }
    
    let randQuestion = Math.floor(Math.random() * availableQuestions.length);
    let question = availableQuestions[randQuestion];
    
    usedQuestions.push(question.id);
    
    questionElement.textContent = question.question;

    const paleThemeColor = getPaleColor(themeColors[question.theme]);
    quizContainer.style.backgroundColor = paleThemeColor; // Apply pale theme color to the quiz container

    // Clear existing buttons
    answerButtons.innerHTML = ""; // Clear previous answer buttons

    // Create and display the theme
    const themeElement = document.createElement("div");
    themeElement.textContent = question.theme; // Display the theme
    themeElement.style.color = themeColors[question.theme]; // Set text color for contrast
    themeElement.style.fontWeight = "bold"; // Make it bold
    themeElement.style.padding = "5px"; // Add some padding for aesthetics
    questionElement.prepend(themeElement); // Add theme above question

    let timeLimit = level === 1 ? 30 : level === 2 ? 20 : 15; // Timer selon le niveau
    let answerCount = level === 1 ? 3 : level === 2 ? 4 : 5; // Nombre de réponses selon le niveau

    correctAnswer = question.correct; // Bonne réponse sous forme de texte
    let otherAnswers = question.answers.filter(answer => answer !== correctAnswer); // Filtrer les mauvaises réponses

    // Mélanger et prendre le bon nombre de mauvaises réponses
    let shuffledOtherAnswers = otherAnswers.sort(() => Math.random() - 0.5).slice(0, answerCount - 1);

    // S'assurer que la bonne réponse est incluse
    let finalAnswers = [correctAnswer, ...shuffledOtherAnswers].sort(() => Math.random() - 0.5);

    if (!themeCount[question.theme]) {
        themeCount[question.theme] = 0;
    }
    themeCount[question.theme]++;

    document.getElementById("question-index").textContent = `Question: ${currentQuestionIndex + 1}`;
    // Affichage des boutons de réponse
    finalAnswers.forEach((answer, index) => {
        const button = document.createElement("button");
        button.textContent = answer;
        button.classList.add("btn");
        button.addEventListener("click", () => selectAnswer(index, button, finalAnswers, correctAnswer, question.explanation));
        answerButtons.appendChild(button);
    });

    if (hasRemoveTwoBonus>0){
        document.getElementById("bonusDisplay").style.display = "block"; // Remove from UI
        document.getElementById("useBonusBtn").style.display = "block";
    }

    startTimer(timeLimit);
}

function displayThemeOptions() {
    resetState();
    const themeOptions = themes.filter(theme => theme !== currentTheme);
    const selectedThemes = [];

    while (selectedThemes.length < 3) {
        const randomTheme = themeOptions[Math.floor(Math.random() * themeOptions.length)];
        if (!selectedThemes.includes(randomTheme)) {
            selectedThemes.push(randomTheme);
        }
    }

    if (currentQuestionIndex === bonusQuestionNumber + (level - 1) * levelLength && !bonusAppeared) {
        const bonusIndex = Math.floor(Math.random() * selectedThemes.length);
        selectedThemes[bonusIndex] = "Bonus!";
        bonusAppeared = true;
    }

    document.getElementById("bonusDisplay").style.display = "none"; // Remove from UI
    document.getElementById("useBonusBtn").style.display = "none";

    // Display selected themes for the user to choose from (implement your UI here)
    // For example, you could create buttons for each theme in selectedThemes.
    selectedThemes.forEach(theme => {
        const button = document.createElement("button");
        button.textContent = theme;
        button.classList.add("btn");
        if (theme === "Bonus!") {
            button.classList.add("bonus-btn");
            button.style.backgroundColor = "#FFFF00"; // yellow background
            button.style.color = "#000000"; // Ensure text is black
            button.addEventListener("click", handleBonusSelection);
        } else {
            button.style.backgroundColor = themeColors[theme] || "#555"; // Default to gray if not found
            button.style.color = "#fff"; // Ensure text is white
            button.addEventListener("click", () => handleThemeSelection(theme));
        }
        answerButtons.appendChild(button); // Append theme buttons to answerButtons
    });
}

function displayBonus(text, icon) {
    const bonusDisplay = document.getElementById("bonusDisplay"); // Add this div in HTML
    bonusDisplay.innerHTML = `<p>${icon} ${text}</p>`;
    bonusDisplay.style.display = "block";
}

function handleThemeSelection(selectedTheme) {
    showNextQuestion(selectedTheme);
}

function startTimer(duration) {
    clearInterval(timerInterval);
    startTime = Date.now();

    timerInterval = setInterval(() => {
        let elapsed = Date.now() - startTime;
        let remaining = Math.max(0, duration * 1000 - elapsed) / 1000;

        timerText.textContent = Math.ceil(remaining);
        let progress = (remaining / duration) * 283;
        progressCircle.style.strokeDashoffset = progress;

        if (remaining <= 0) {
            clearInterval(timerInterval);
            timerText.textContent = "⏳";
            feedbackElement.textContent = "Temps écoulé !";
            highlightCorrectAnswer();
            lives--;
            updateLives();

            if (lives === 0) {
                gameOver();
            } else {
                nextButton.style.display = "block";
            }
        }
    }, 100);
}

function handleBonusSelection() {
    resetState();

    // Choose a random bonus
    const bonusTypes = ["extraLife", "removeTwo"];
    const chosenBonus = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];

    if (chosenBonus === "extraLife") {
        if (lives < maxLives) {
            lives++; // Regain life if not at max
        } else {
            maxLives++;
            lives++;
        }
        updateLives();
        displayBonus("Vie Bonus!", "❤️");
        setTimeout(() => {
            document.getElementById("bonusDisplay").textContent = "";
        }, 2000);
    } else {
        hasRemoveTwoBonus++; // Store the "Remove Two" bonus
        displayBonus("Retire 2 mauvaises réponses !", "❌❌");
    }

    setTimeout(displayThemeOptions, 2000); // Show themes again after 3s
}

function stopTimer() {
    clearInterval(timerInterval);
}

function selectAnswer(index, selectedButton, finalAnswers, correctAnswer, explanation) {
    stopTimer();

    let timeLimit = level === 1 ? 30 : level === 2 ? 20 : 15; // Timer selon le niveau

    const buttons = answerButtons.children;
    const explanationElement = document.createElement("p");
    explanationElement.textContent = explanation;
    explanationElement.classList.add("explanation");

    let correctIndex = finalAnswers.indexOf(correctAnswer); // Trouver l'index de la bonne réponse

    let timeTaken = (Date.now() - startTime) / 1000;
    let timeLeft = Math.max(0, 30 - timeTaken);
    let points = Math.round(timeLeft * 0.5); // Réponses rapides = plus de points

    if (finalAnswers[index] === correctAnswer) {
        selectedButton.classList.add("correct");
        feedbackElement.textContent = "✅ Correct !";
        score += points;
    } else {
        selectedButton.classList.add("wrong");
        feedbackElement.textContent = "❌ Dommage !";
        buttons[correctIndex].classList.add("correct"); // Surligne la bonne réponse
        lives--;
        updateLives();
    }

    for (let btn of buttons) {
        btn.disabled = true;
    }

    // Affichage de l'explication après la sélection
    answerButtons.appendChild(explanationElement);

    if (lives === 0) {
        gameOver();
    } else {
        nextButton.style.display = "block"; // Assurer l'affichage du bouton "Suivant"
    }
}


function highlightCorrectAnswer() {
    const buttons = answerButtons.children;
    buttons[correctAnswer].classList.add("correct");

    for (let btn of buttons) {
        btn.disabled = true;
    }
}

function updateLives() {
    let hearts = "";
    for (let i = 0; i < maxLives; i++) {
        hearts += i < lives ? "❤️ " : "🖤 ";
    }
    livesElement.innerHTML = hearts.trim();
}

function getMostSelectedTheme() {
    let maxCount = 0;
    let selectedThemes = [];

    for (let theme in themeCount) {
        if (themeCount[theme] > maxCount) {
            maxCount = themeCount[theme];
            selectedThemes = [theme];
        } else if (themeCount[theme] === maxCount) {
            selectedThemes.push(theme);
        }
    }
    
    // If multiple themes are tied, choose one at random
    return selectedThemes[Math.floor(Math.random() * selectedThemes.length)];
}

function useRemoveTwoBonus() {
    if (hasRemoveTwoBonus==0) return;
    
    const answerButtons = document.getElementById("answer-buttons");
    const allButtons = Array.from(answerButtons.children);
    
    // Filter out correct answers and select two wrong ones
    const wrongAnswers = allButtons.filter(button => {
        return button.textContent !== correctAnswer; // Assuming correctAnswer is the right answer text
    });

    // Shuffle and remove two wrong answers
    for (let i = 0; i < 2 && wrongAnswers.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * wrongAnswers.length);
        const wrongButton = wrongAnswers[randomIndex];
        wrongButton.style.display = "none"; // Hide the button
        wrongAnswers.splice(randomIndex, 1); // Remove it from the array
    }

    hasRemoveTwoBonus--;
    if (hasRemoveTwoBonus==0){
        document.getElementById("bonusDisplay").style.display = "none"; // Remove from UI
        document.getElementById("useBonusBtn").style.display = "none";
    }
}

function gameOver() {
    document.getElementById("bonusDisplay").style.display = "none"; // Remove from UI
    document.getElementById("useBonusBtn").style.display = "none";
    questionElement.textContent = `💀 Partie terminée, ${username} !`;
    resetState();
    
    feedbackElement.innerHTML = `Votre score final : <strong>${score}</strong>`;

    // Create leaderboard button
    const leaderboardButton = document.createElement("button");
    leaderboardButton.textContent = "Voir le classement";
    leaderboardButton.classList.add("btn");
    leaderboardButton.addEventListener("click", showLeaderboard);

    // Add button to quiz container
    quizContainer.appendChild(leaderboardButton);

    // Save the score
    saveScore(username, score);
}


function resetState() {

    let timeLimit = level === 1 ? 30 : level === 2 ? 20 : 15; // Timer selon le niveau
    feedbackElement.textContent = "";
    nextButton.style.display = "none";
    answerButtons.innerHTML = ""; // Clear previous answers
    timerText.textContent = timeLimit;
    progressCircle.style.strokeDashoffset = 283; // Reset timer visual
    progressCircle.style.stroke = "#8a9b0f"; // Reset color to green
    startTime = Date.now();
    // Reset background color, question, and theme
    quizContainer.style.backgroundColor = ""; // Remove background color
    questionElement.textContent = ""; // Clear the question text

    // Clear existing theme element if it exists
    const existingThemeElement = questionElement.querySelector("div"); // Select the theme element
    if (existingThemeElement) {
        existingThemeElement.remove(); // Remove the theme element from the DOM
    }
}

function saveScore(username, score) {
    let scores = JSON.parse(localStorage.getItem("scores")) || [];
    scores.push({ username, score });

    // Sort scores in descending order & keep only top 50
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 50);

    localStorage.setItem("scores", JSON.stringify(scores));
}


function showLeaderboard() {
    let scores = JSON.parse(localStorage.getItem("scores")) || [];
    
    // Create leaderboard HTML
    let leaderboardHTML = `
        <h2>🏆 Top 50 Scores</h2>
        <ol>
    `;

    scores.forEach((entry, index) => {
        leaderboardHTML += `<li>${index + 1}. ${entry.username} - ${entry.score}</li>`;
    });

    leaderboardHTML += "</ol>";

    // Add a restart button
    leaderboardHTML += `<button class="btn" onclick="restartGame()">Rejouer</button>`;

    // Display leaderboard inside quiz container
    quizContainer.innerHTML = leaderboardHTML;
}

function restartGame() {
    location.reload(); // Simply reload the page to reset everything
}


nextButton.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizLengh) {
        displayThemeOptions();
        if (currentQuestionIndex === levelLength || currentQuestionIndex === levelLength * 2) {
            level++;
            bonusAppeared = false;
            bonusQuestionNumber = Math.floor(Math.random() * levelLength) + 1;
        }
    } else {
        startFinalRound();
    }
});

function startFinalRound() {
    resetState();
    quizContainer.style.display = "block";
    feedbackElement.textContent = "🏆 Manche Finale : Répondez autant que possible !";

    let finalTheme = getMostSelectedTheme();
    let finalQuestions = fetchQuestions(finalTheme).filter(q => !usedQuestions.includes(q.id));
    let finalbackup = fetchQuestions(finalTheme).filter(q => usedQuestions.includes(q.id));

    // If there are not enough new questions, add some used ones until we reach 20
    if (finalQuestions.length < finalNumber) {
        let remainingNeeded = finalNumber - finalQuestions.length;
        let usedPool = shuffleArray(finalbackup);
        finalQuestions = finalQuestions.concat(usedPool.slice(0, remainingNeeded));
    }

    // Backup in case no theme is found and we still don't have 20 questions
    if (finalQuestions.length === 0) {
        finalQuestions = shuffleArray(questions).slice(0, finalNumber);
    }

    startFinalTimer(finalTimer, finalQuestions);
}


function startFinalTimer(duration, finalQuestions) {
    let startTime = Date.now();
    let timerInterval = setInterval(() => {
        let elapsed = (Date.now() - startTime) / 1000;
        let remaining = Math.max(0, duration - elapsed);
        
        timerText.textContent = Math.ceil(remaining);
        let progress = (remaining / duration) * 283;
        progressCircle.style.strokeDashoffset = progress;

        if (remaining <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 100);

    showFinalQuestion(finalQuestions, timerInterval);
}

function showFinalQuestion(finalQuestions, timerInterval) {
    resetState();
    feedbackElement.textContent = "🏆 Manche Finale : Répondez autant que possible !";

    if (finalQuestions.length === 0) {
        endGame();
        return;
    }

    let question = finalQuestions.pop(); // Take the next question
    questionElement.textContent = question.question;
    correctAnswer = question.correct;

    let answers = shuffleArray([...question.answers]);
    answers.forEach(answer => {
        const button = document.createElement("button");
        button.textContent = answer;
        button.classList.add("btn");
        button.addEventListener("click", () => {
            if (answer === correctAnswer) {
                score += 15;
                showFinalQuestion(finalQuestions, timerInterval);
            } else {
                lives--;
                updateLives();
                if (lives === 0) {
                    clearInterval(timerInterval);
                    endGame();
                } else {
                    showFinalQuestion(finalQuestions, timerInterval);
                }
            }
        });
        answerButtons.appendChild(button);
    });
}

function endFinalRound() {
    quizContainer.style.display = "none";
    feedbackElement.textContent = "🏁 Fin de la Saga !";
    setTimeout(() => location.reload(), 5000); // Reload after 5 sec
}

function endGame() {
    resetState();
    questionElement.textContent = `🎉 Fin de la Saga !`;
    feedbackElement.innerHTML = `Score final : <strong>${score}</strong>`;

    // Create leaderboard button
    const leaderboardButton = document.createElement("button");
    leaderboardButton.textContent = "Voir le classement";
    leaderboardButton.classList.add("btn");
    leaderboardButton.addEventListener("click", showLeaderboard);

    // Add button to quiz container
    quizContainer.appendChild(leaderboardButton);

    // Save the score
    saveScore(username, score);
}

function getPaleColor(color) {
    const colorObject = hexToRgb(color);
    const paleColor = `rgba(${colorObject.r}, ${colorObject.g}, ${colorObject.b}, 0.1)`; // Set alpha to 0.5 for 50% transparency
    return paleColor;
}

// Function to convert hex color to RGB
function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;

    // 3 digits
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    }
    // 6 digits
    else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }

    return { r, g, b };
}