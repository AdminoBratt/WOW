// **Globala variabler**
let scrambledLetters = ""; // Blandade bokstäver
let guessedWord = ""; // Det spelaren gissar
let wordToGuess = ""; // Rätt ord
let score = 0; // Poäng
let totalScore = 0;
let timeLeft = 45; // Total tid
let timer; // Timer-instans
let currentRound = 1;
let guessedWordsThisRound = 0;
const totalRounds = 3;
const requiredCorrectWords = 3;
let hintUsed = false;

document.getElementById("useHintBtn").addEventListener("click", hint);

document.getElementById("startEpicTimerBtn").addEventListener("click", function() {
    const blurOverlay = document.getElementById("blur-overlay");

    blurOverlay.style.opacity = "0";
    setTimeout(() => {
        blurOverlay.style.display = "none";
        startGame();
    }, 500);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Backspace") {
        if (guessedWord.length > 0) {
            const lastLetter = guessedWord[guessedWord.length - 1];
            guessedWord = guessedWord.slice(0, -1);

            const button = Array.from(document.querySelectorAll(".letter")).find(
                el => el.textContent === lastLetter && el.disabled
            );
            if (button) {
                button.disabled = false;
                button.classList.remove("selected");
            }

            updateUnderscoreDisplay();
        }
        event.preventDefault();
    } else {
        const guessedLetter = event.key.toUpperCase();
        if (scrambledLetters.includes(guessedLetter) && guessedWord.length < wordToGuess.length) {
            const button = Array.from(document.querySelectorAll(".letter")).find(
                el => el.textContent === guessedLetter && !el.disabled
            );
            if (button) handleLetterClick(button);
        }
    }
});

// **1. Start- och grundfunktioner**
async function startGame() {
    guessedWord = "";
    guessedWordsThisRound = 0;
    updateRoundDisplay();
    updateScoreDisplay();
    await getOneWord();
    startTimer();
}

async function continueGame() {
    guessedWord = "";
    score = 0;
    await getOneWord();
    document.querySelector(".underscore").textContent = generateUnderlines(wordToGuess);
    updateScoreDisplay();
}

function resetGame() {
    guessedWord = "";
    document.querySelector(".underscore").textContent = generateUnderlines(wordToGuess);
    populateLetterButtons(scrambledLetters);
}

function updateRoundDisplay() {
    document.getElementById("round").textContent = `Runda: ${currentRound}`;
}

function updateScoreDisplay() {
    document.getElementById("score").textContent = `Poäng: ${totalScore}`;
}

function saveName(faction) {
    const nameInput = faction === 'alliance'
        ? document.getElementById('player-name-alliance').value
        : document.getElementById('player-name-horde').value;

    if (nameInput.trim() === "") {
        alert("Vänligen ange ett namn.");
        return;
    }

    localStorage.setItem("playerName", nameInput);
    localStorage.setItem("faction", faction);
    window.location.href = "gameplay.html";
}

// **2. Ordhantering**
async function getOneWord() {
    const response = await fetch(`/api/getrandomword/${currentRound}`);
    const data = await response.json();
    wordToGuess = data.word.toUpperCase();
    scrambledLetters = shuffleWord(wordToGuess).toUpperCase();
    console.log(`Rätt ord är: ${wordToGuess}`);

    document.querySelector(".underscore").textContent = generateUnderlines(wordToGuess);
    populateLetterButtons(scrambledLetters);
}

function shuffleWord(word) {
    let letters = word.split("");
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join("");
}

function generateUnderlines(word) {
    return word.split("").map(() => "_").join(" ");
}

function populateLetterButtons(letters) {
    const lettersContainer = document.getElementById("letters");
    lettersContainer.innerHTML = "";
    letters.split("").forEach(letter => {
        const button = document.createElement("button");
        button.textContent = letter;
        button.classList.add("letter");
        button.addEventListener("click", () => handleLetterClick(button));
        lettersContainer.appendChild(button);
    });
}

// **3. Bokstavshantering**
function handleLetterClick(button) {
    const letter = button.textContent;

    if (button.classList.contains("selected")) {
        guessedWord = guessedWord.slice(0, guessedWord.lastIndexOf(letter))
            + guessedWord.slice(guessedWord.lastIndexOf(letter) + 1);
        button.disabled = false;
        button.classList.remove("selected");
        button.style.backgroundColor = "";
        updateUnderscoreDisplay();
        return;
    }

    if (guessedWord.length < wordToGuess.length) {
        guessedWord += letter;
        updateUnderscoreDisplay();
        button.disabled = true;
        button.classList.add("selected");

        if (wordToGuess.includes(letter)) {
            button.style.backgroundColor = "gray";
        }

        if (guessedWord.length === wordToGuess.length) {
            checkWord();
        }
    }
}

function updateUnderscoreDisplay() {
    const underscores = wordToGuess
        .split("")
        .map((char, index) => (guessedWord[index] || (index === 0 && hintLetter) || "_"))
        .join(" ");
    document.querySelector(".underscore").textContent = underscores;
}

// **4. Kontroll och slutspel**
function checkWord() {
    const reversedWord = wordToGuess.split("").reverse().join("");

    if (guessedWord === wordToGuess && timeLeft > 0) {
        handleCorrectGuess();
    } else if (guessedWord === reversedWord && timeLeft > 0) {
        handleReversedGuess();
    } else if (guessedWord !== wordToGuess && guessedWord.length === wordToGuess.length) {
        alert("Fel ord!");
        resetGame();
    }
}

function handleCorrectGuess() {
    let roundScore = guessedWord.length;
    if (!hintUsed) roundScore += 10;
    score += roundScore;
    totalScore += score;
    localStorage.setItem("totalScore", totalScore);
    guessedWordsThisRound++;
    updateScoreDisplay();

    hintUsed = false;
    guessedWord = "";

    if (guessedWordsThisRound === requiredCorrectWords) {
        alert("Du har klarat 3 ord. Fortsätt gissa tills tiden tar slut!");
    }
    continueGame();
}

function handleReversedGuess() {
    score += 50;
    totalScore += score;
    guessedWordsThisRound++;
    updateScoreDisplay();
    showEasterEgg();

    hintUsed = false;
    guessedWord = "";

    if (guessedWordsThisRound === requiredCorrectWords) {
        alert("Du har klarat 3 ord. Fortsätt gissa tills tiden tar slut!");
    }
    continueGame();
}

function showEasterEgg() {
    const easterEggElement = document.getElementById("easter-egg");
    easterEggElement.style.display = "block";
    easterEggElement.textContent = "Easter Egg! Du gissade ordet baklänges!";

    setTimeout(() => {
        easterEggElement.style.display = "none";
    }, 3000);
}

// **5. Timer och runda**
function startTimer() {
    const timerElement = document.getElementById("epic-time-left");
    clearInterval(timer);
    timeLeft = 45;
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            timerElement.textContent = timeLeft;
            if (timeLeft <= 10) {
                timerElement.style.color = "red";
                timerElement.style.animation = "flash 1s infinite";
            }
        } else {
            clearInterval(timer);
            alert("Tiden är slut!");
            alert(`Rätt ord var: ${wordToGuess}`);
            endRound();
        }
    }, 1000);
}

function endRound() {
    clearInterval(timer);
    totalScore += score;
    localStorage.setItem("totalScore", totalScore);
    updateScoreDisplay();

    if (guessedWordsThisRound >= requiredCorrectWords) {
        if (currentRound < totalRounds) {
            alert(`Runda ${currentRound} klar! Du går vidare till nästa runda.`);
            currentRound++;
            guessedWordsThisRound = 0;
            startGame();
        } else {
            endGame(true);
        }
    } else {
        endGame(false);
    }
}

function endGame(won) {
    localStorage.setItem("totalScore", totalScore);
    clearInterval(timer);

    if (won) {
        alert(`Grattis! Du fick ${totalScore} poäng!`);
        saveHighscore(totalScore);
    } else {
        alert(`Du kom till runda ${currentRound} och fick ${totalScore} poäng`);
        saveHighscore(totalScore);
    }

    guessedWord = "";
    currentRound = 1;
    guessedWordsThisRound = 0;
    totalScore = 0;
    updateScoreDisplay();
    localStorage.setItem("totalScore", totalScore);
    document.getElementById("startEpicTimerBtn").style.display = "block";
}

// **6. Hjälpmedel och Highscore**
function hint() {
    const hintLetter = wordToGuess[0];
    if (!guessedWord.includes(hintLetter)) {
        guessedWord = hintLetter + guessedWord.slice(1);
        hintUsed = true;

        const button = Array.from(document.querySelectorAll(".letter")).find(
            el => el.textContent === hintLetter && !el.disabled
        );
        if (button) {
            button.disabled = true;
            button.classList.add("selected");
            button.style.backgroundColor = "gray";
        }
    }
    updateUnderscoreDisplay();
}

async function saveHighscore() {
    const playerName = localStorage.getItem("playerName");
    const faction = localStorage.getItem("faction");
    totalScore = parseInt(localStorage.getItem("totalScore"));

    if (!playerName || !faction) {
        alert("Spelarnamn eller faction saknas. Kan inte spara highscore");
        return;
    }

    try {
        const response = await fetch("api/savehighscore", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                playerName: playerName,
                faction: faction,
                score: totalScore,
            }),
        });

        if (!response.ok) {
            throw new Error("Misslyckades med att spara highscore");
        }

        const result = await response.text();
        console.log(result);
        alert("Highscore sparat");
    } catch (error) {
        console.error("Fel vid sparande av highscore:", error);
        alert("Ett fel uppstod när highscore skulle sparas.");
    }
}

document.getElementById("viewHighscoresBtn").addEventListener("click", () => {
    window.location.href = "viewhighscore.html";
});
