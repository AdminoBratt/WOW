// Globala variabler
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

// Hämta ett ord och visa scrambled letters
async function getOneWord() {
    let round = currentRound;

    const response = await fetch(`/api/getrandomword/${round}`);
    const data = await response.json();
    wordToGuess = data.word.toUpperCase(); // Spara det rätta ordet
    scrambledLetters = shuffleWord(wordToGuess).toUpperCase(); // Shufflade bokstäver
    console.log(`Rätt ord är: ${wordToGuess}`); // Logga ordet i konsolen

    // Uppdatera gränssnittet
    document.querySelector(".underscore").textContent = generateUnderlines(wordToGuess);

    populateLetterButtons(scrambledLetters);
}

// Shuffla bokstäverna
function shuffleWord(word) {
    let letters = word.split("");
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join("");
}

// Skapa understreck för ordet
function generateUnderlines(word) {
    return word.split("").map(() => "_").join(" ");
}

// Skapa dynamiska bokstavsknappar
function populateLetterButtons(letters) {
    const lettersContainer = document.getElementById("letters");
    lettersContainer.innerHTML = ""; // Töm tidigare bokstäver
    letters.split("").forEach(letter => {
        const button = document.createElement("button");
        button.textContent = letter;
        button.classList.add("letter");
        button.addEventListener("click", () => handleLetterClick(button));
        lettersContainer.appendChild(button);
    });
}
// Hantera klick på en bokstav
function handleLetterClick(button) {
    const letter = button.textContent;

    // Om bokstaven redan är vald, ta bort den
    if (button.classList.contains("selected")) {
        guessedWord = guessedWord.slice(0, guessedWord.lastIndexOf(letter))
            + guessedWord.slice(guessedWord.lastIndexOf(letter) + 1);
        button.disabled = false; // Aktivera knappen igen
        button.classList.remove("selected");
        updateUnderscoreDisplay(); // Uppdatera understrecken
        return; // Avsluta funktionen
    }

    // Lägg till bokstaven om plats finns
    if (guessedWord.length < wordToGuess.length) {
        guessedWord += letter; // Lägg till bokstaven i spelarens gissning
        updateUnderscoreDisplay();
        button.disabled = true; // Inaktivera knappen
        button.classList.add("selected"); // Markera knappen som vald
        updateUnderscoreDisplay(); // Uppdatera understrecken
    }

    if (guessedWord.length === wordToGuess.length) {
        checkWord();
    }
}

// Uppdatera visningen av understreck
function updateUnderscoreDisplay() {
    const underscores = guessedWord
        .split("")
        .concat("_".repeat(wordToGuess.length - guessedWord.length).split(""))
        .join(" ");
    document.querySelector(".underscore").textContent = underscores;
}

// Kontrollera om gissningen är korrekt



function showMessage(message, color) {
    let messageBox = document.getElementById('messageBox');
    
    if (!messageBox) {
        messageBox = document.createElement('div');
        messageBox.id = 'messageBox';
        messageBox.style.position = 'fixed';
        messageBox.style.top = '50%';
        messageBox.style.left = '50%';
        messageBox.style.transform = 'translate(-50%, -50%)';
        messageBox.style.padding = '20px';
        messageBox.style.backgroundColor = '#fff';
        messageBox.style.border = '2px solid #000';
        messageBox.style.borderRadius = '10px';
        messageBox.style.textAlign = 'center';
        messageBox.style.zIndex = '1000';
        messageBox.style.fontSize = '3rem'; // För en kraftigare textstorlek
        messageBox.style.color = color || 'black';
        messageBox.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        messageBox.style.opacity = '0'; // Börjar osynligt
        document.body.appendChild(messageBox);
    }

    // Sätt texten och animerar in
    messageBox.textContent = message;
    messageBox.style.opacity = '1';
    messageBox.style.transform = 'translate(-50%, -50%) scale(1)';

    // Lägg till en stil för att få meddelandet att "explodera" eller "blinka" vid rätt svar
    if (color === "green") {
        messageBox.style.animation = 'pulse 1.5s ease infinite'; // Pulsanimering för rätt ord
    } else if (color === "red") {
        messageBox.style.animation = 'shake 0.5s ease forwards'; // Skakning för fel ord
    }

    // Animera ut och ta bort
    setTimeout(() => {
        messageBox.style.opacity = '0';
        messageBox.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => {
            messageBox.remove();
        }, 500);
    }, 500);
}



function checkWord() {
    if (guessedWord === wordToGuess && timeLeft > 0) {
        score += guessedWord.length + 10; // Lägg till poäng
        totalScore += score; // Uppdatera totalpoängen
        guessedWordsThisRound++; // öka antal gissade ord för denna runda
        updateScoreDisplay();
        showMessage("Rätt ord!", "green"); // Nytt meddelande
        guessedWord = ""; // återställ spelarens gissning

        if (guessedWordsThisRound === requiredCorrectWords) {
            showMessage("Du har klarat 3 ord. Fortsätt gissa tills tiden tar slut!", "blue");
        }
        continueGame();
    } else if (guessedWord !== wordToGuess && guessedWord.length === wordToGuess.length) {
        showMessage("Fel ord!", "red"); // Nytt meddelande
        resetGame(); // återställ gissningen för att försöka igen
    }
}


// avsluta en runda
function endRound() {
    clearInterval(timer);
    totalScore += score; // lägg till rundans poäng till totalpoäng
    updateScoreDisplay(); // uppdatera visning av poäng

    if (guessedWordsThisRound >= requiredCorrectWords){
        if (currentRound < totalRounds){
            alert(`Runda ${currentRound} klar! Du går vidare till nästa runda.`)
            currentRound++;
            guessedWordsThisRound = 0;
            startGame();
        }else{
            endGame(true); // Alla rundor klara, vinst
        }
    }else{
        endGame(false); // förlust om spelaren inte klarar 3 ord
    }
}

// Uppdatera visningen av rundan
function updateRoundDisplay() {
    document.getElementById("round").textContent = `Runda: ${currentRound}`;
}

// Starta spelet
async function startGame() {
    guessedWord = ""; // Töm spelarens gissning
    guessedWordsThisRound = 0; // nollställ gissade ord
    updateRoundDisplay();
    updateScoreDisplay(); // visa poäng som 0
    await getOneWord(); // Hämta ett ord från API
    startTimer(); // Starta timern
}

async function continueGame() {
    guessedWord = ""; // Töm spelarens gissning
    score = 0;
    await getOneWord(); // Hämta ett ord från API
    document.querySelector(".underscore").textContent = generateUnderlines(wordToGuess); // Visa understreck
    updateScoreDisplay();
}

// Starta timern
function startTimer() {
    const timerElement = document.getElementById("epic-time-left");
    clearInterval(timer); // Rensa eventuell tidigare timer
    timeLeft = 45; // Återställ tiden
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            timerElement.textContent = timeLeft;

            // Ändra färg och animera när tiden är låg
            if (timeLeft <= 10) {
                timerElement.style.color = "red";
                timerElement.style.animation = "flash 1s infinite";
            }
        } else {
            clearInterval(timer);
            alert("Tiden är slut!");
            endRound();
            //endGame(true);
        }
    }, 1000);
}

function updateScoreDisplay() {
    document.getElementById("score").textContent = `Poäng: ${totalScore}`;
    document.getElementById("finalScore").textContent = `Poäng: ${totalScore}`;
}

// Avsluta spelet
function endGame(won) {
    clearInterval(timer);
    if (won) {
        messageElement.textContent = `Grattis! Du fick ${totalScore} poäng!`;
        messageElement.style.color = 'green';
    } else {
        messageElement.textContent = 'Tyvärr, du förlorade!';
        messageElement.style.color = 'red';
    }

    guessedWord = "";
    currentRound = 1;
    guessedWordsThisRound = 0;
    totalScore = 0;
    updateScoreDisplay();
    document.getElementById("startEpicTimerBtn").style.display = "block";
}

// Återställ spelet
function resetGame() {
    guessedWord = "";
    document.querySelector(".underscore").textContent = generateUnderlines(wordToGuess);
    populateLetterButtons(scrambledLetters);
}

// Hantera tangentbordsinmatning
document.addEventListener("keydown", (event) => {
    const guessedLetter = event.key.toUpperCase();
    if (scrambledLetters.includes(guessedLetter) && guessedWord.length < wordToGuess.length) {
        const button = Array.from(document.querySelectorAll(".letter")).find(
            el => el.textContent === guessedLetter && !el.disabled
        );
        if (button) handleLetterClick(button);
    }
});

// Hantera namn och fraktion
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

document.getElementById("startEpicTimerBtn").addEventListener("click", function() {
    const blurOverlay = document.getElementById("blur-overlay");

    // Ta bort blur-effekten och starta spelet
    blurOverlay.style.opacity = "0";
    setTimeout(() => {
        blurOverlay.style.display = "none";
        startGame();  // OBS: Kallar den korrekta startGame()-funktionen
    }, 500);
});

// Funktion för att starta spelet (fixad och komplett)
async function startGame() {
    console.log("Spelet har startat!");
    guessedWord = ""; // Töm spelarens gissning
    guessedWordsThisRound = 0; // Nollställ gissade ord
    updateRoundDisplay(); // Uppdatera rundans visning
    updateScoreDisplay(); // Uppdatera poängvisning
    await getOneWord(); // Hämta ett nytt ord och visa bokstäverna
}


// Uppdatera visning av poäng
function updateScoreDisplay() {
    document.getElementById("score").textContent = `Poäng: ${totalScore}`;
    document.getElementById("finalScore").textContent = `Poäng: ${totalScore}`;
}

document.addEventListener("keydown", (event) => {
    // Om Backspace trycks ner, ångra senaste bokstaven
    if (event.key === "Backspace") {
        if (guessedWord.length > 0) {
            // Ta bort senaste bokstaven från gissningen
            const lastLetter = guessedWord[guessedWord.length - 1];
            guessedWord = guessedWord.slice(0, -1);

            // Hitta den tillhörande knappen och återaktivera den
            const button = Array.from(document.querySelectorAll(".letter")).find(
                el => el.textContent === lastLetter && el.disabled
            );
            if (button) {
                button.disabled = false; // Aktivera knappen igen
                button.classList.remove("selected"); // Ta bort markeringsklass
            }

            // Uppdatera visningen av understreck
            updateUnderscoreDisplay();
        }
        event.preventDefault(); // Förhindra standardfunktion för Backspace
        return;
    }

});
