// Globala "variabler
//const words = [];
let scrambledLetters = ""; // Blandade bokstäver
let guessedWords = []; // Lista över gissade ord
let score = 0; // Poäng
let timeLeft = 60; // Tidsbegränsning i sekunder
let timer; // För att hantera tiden

async function getOneWord() {
    let response = await fetch("api/getrandomword");
    let data = await response.json();
    let word = data.word.toUpperCase();
    console.log(word);
    words = [word];
    scrambledLetters = shuffleWord(word).toUpperCase();
    console.log(words, scrambledLetters);

    const wordContainer = document.getElementById("word-box");

    // Generera understreck för ordet
    let underlines = generateUnderlines(word);

    wordContainer.innerHTML = `
        <h2>Ord att lösa</h2>
        <p class="underscore">${underlines}</p>
        <p class="shuffled-word">Shufflade bokstäver: ${scrambledLetters}</p>
        `;
}

function shuffleWord(word) {
    // Omvandla ordet till en array av bokstäver
    let letters = word.split("");

    // shuffla bokstäver med Fisher-Yates algoritm
    for (let i = letters.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // slumpmässigt index
        [letters[i], letters[j]] = [letters[j], letters[i]]; // Byt plats
    }

    // returnera det shufflade ordet
    return letters.join("");
}

function generateUnderlines(word){
    return word.split("").map(() => "_").join(" ");
}

function saveName(faction) {
  let nameInput;
  if (faction === 'alliance') {
    nameInput = document.getElementById('player-name-alliance').value;
  } else if (faction === 'horde') {
    nameInput = document.getElementById('player-name-horde').value;
  }

  if (nameInput.trim() !== "") {
    localStorage.setItem("playerName", nameInput);
    startGame(); // spelet startar
    window.location.href = "gameplay.html";
  } else {
    alert("Vänligen skriv in ett namn");
  }
}

// Starta spelet
async function startGame() {
   await getOneWord();
  // Välj ord och mixa bokstäver
  //scrambledLetters = words.join('').split('').sort(() => Math.random() - 0.5).join('');
  // Visa orden och blandade bokstäver
  document.getElementById("letters").innerText = scrambledLetters;
  document.getElementById("words").innerHTML = words.map(word => `<p>${"_ ".repeat(word.length)} (${word.length})</p>`).join(''); // Visa ord som ska gissas
  // Starta timer
  startTimer();
}

// Kontrollera gissning
function checkWord() {
  const input = document.getElementById("guess").value.trim().toLowerCase();
  if (words.includes(input) && !guessedWords.includes(input)) {
    guessedWords.push(input);
    score += input.length + 10; // Bokstavspoäng + bonus
    updateGame(input);
    alert("Rätt ord!");
  } else {
    alert("Fel eller redan gissat ord!");
  }
  document.getElementById("guess").value = ""; // Töm inmatningsfältet
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

  // Kontrollera om spelet är klart
  if (guessedWords.length === words.length) {
    endGame(true);
  }
}

// Starta timer
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").innerText = `Tid kvar: ${timeLeft}s`;
    if (timeLeft <= 0) {
      endGame(false);
    }
  }, 1000);
}

// Stoppa timer
function stopTimer() {
  clearInterval(timer);
}

// Ge en hjälpande bokstav
function useHint() {
  if (scrambledLetters.length > 0) {
    const hintLetter = scrambledLetters[0];
    scrambledLetters = scrambledLetters.slice(1);
    document.getElementById("letters").innerText = scrambledLetters;
    timeLeft -= 5; // Dra av tid för hjälp
    alert(`En bokstav: ${hintLetter}`);
  } else {
    alert("Inga fler bokstäver kvar!");
  }
}

function endGame(won) {
  stopTimer();
  if (won) {
    alert(`Grattis! Du klarade alla ord! Slutpoäng: ${score}`);
  } else {
    alert(`Tiden är slut! Din poäng: ${score}`);
  }
  // Starta om spelet eller navigera till en annan sida
  location.href = "index.html"; // Tillbaka till startsidan
}

// Kör när sidan laddas
window.onload = () => {
  startGame();
  document.getElementById("checkWordBtn").onclick = checkWord;
  document.getElementById("useHintBtn").onclick = useHint;
};

lettersContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("letter")) {
        // Om den redan är markerad, avmarkera den
        if (event.target.classList.contains("clicked")) {
            event.target.classList.remove("clicked");
        } else {
            // Annars avmarkera alla andra och markera den klickade
            document.querySelectorAll(".letter").forEach(letter => {
                letter.classList.remove("clicked");
            });
            event.target.classList.add("clicked");
        }
    }
    ;

// Get the button element
    const button = document.getElementById('getword');

// Add an onclick event listener
    button.addEventListener('click', getOneWord);



// calculate area
    function calc(x, y) {
        return x * y;
    }

    function calculateArea(length, height) {
        return length * height;
    }
});