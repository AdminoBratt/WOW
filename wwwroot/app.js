// Globala variabler
let scrambledLetters = ""; // Blandade bokstäver
let guessedWord = ""; // Det spelaren gissar
let wordToGuess = ""; // Rätt ord
let score = 0; // Poäng
let timeLeft = 45; // Total tid
let timer; // Timer-instans

async function getOneWord() {
    const response = await fetch("api/getrandomword");
    const data = await response.json();
    wordToGuess = data.word.toUpperCase(); // Spara det rätta ordet
    scrambledLetters = shuffleWord(wordToGuess).toUpperCase(); // Shufflade bokstäver
    console.log(`Rätt ord är: ${wordToGuess}`); // Logga ordet i konsolen

    // Uppdatera gränssnittet
    document.querySelector(".underscore").textContent = generateUnderlines(wordToGuess);
    document.querySelector(".shuffled-word").textContent = `Shufflade bokstäver: ${scrambledLetters}`;
    populateLetterButtons(scrambledLetters);
}

function shuffleWord(word) {
    // Omvandla ordet till en array av bokstäver
    let letters = word.split("");

    // shuffla bokstäver med Fisher-Yates algoritm
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }

    // returnera det shufflade ordet
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
    if (guessedWord.length < wordToGuess.length) {
        guessedWord += letter; // Lägg till bokstaven i spelarens gissning
        updateUnderscoreDisplay();
        button.disabled = true; // Inaktivera knappen
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
function checkWord() {
    if (guessedWord === wordToGuess) {
        score += guessedWord.length * 10; // Lägg till poäng
        alert("Rätt ord!");
        endGame(true);
    } else {
        alert("Fel ord!");
        resetGame();
    }
}

function updateGame(word) {
  // Ta bort bokstäver för det gissade ordet
  for (let char of word) {
    scrambledLetters = scrambledLetters.replace(char, '');
  }
  document.getElementById("letters").innerText = scrambledLetters;

  // Uppdatera poäng och ordstatus
  document.getElementById("score").innerText = `Poäng: ${score}`;
  document.getElementById("words").innerHTML = words.map(w =>
      guessedWords.includes(w) ? `<p>${w} (${w.length})</p>` : `<p>${"_ ".repeat(w.length)}(${w.length})</p>`
  ).join('');

// Starta spelet
async function startGame() {
    guessedWord = ""; // Töm spelarens gissning
    await getOneWord(); // Hämta ett ord från API
    document.querySelector(".underscore").textContent = generateUnderlines(wordToGuess); // Visa understreck
    startTimer(); // Starta timern
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
            endGame(false);
        }
    }, 1000);
}

// Avsluta spelet
function endGame(won) {
    clearInterval(timer);
    if (won) {
        alert(`Grattis! Du vann med poängen ${score}!`);
    } else {
        alert("Tyvärr, du förlorade!");
    }
    resetGame();
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

// Kör spelet när sidan laddas
document.getElementById("startEpicTimerBtn").addEventListener("click", () => {
    document.getElementById("startEpicTimerBtn").style.display = "none"; // Dölj startknappen
    startGame();
});



// calculate area
    function calc(x, y) {
        return x * y;
    }

    function calculateArea(length, height) {
        return length * height;
    }
});