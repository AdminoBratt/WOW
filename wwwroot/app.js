// Globala variabler
const words = ["apple", "banana", "cherry"];
let scrambledLetters = ""; // Blandade bokstäver
let guessedWords = []; // Lista över gissade ord
let score = 0; // Poäng
let timeLeft = 45; // Tidsbegränsning i sekunder
let timerRunning = false;
let timer;

// Spara namn och fraktion
function saveName(faction) {
  const playerName = faction === 'alliance'
      ? document.getElementById('player-name-alliance').value
      : document.getElementById('player-name-horde').value;

  if (playerName.trim() === "") {
    alert("Vänligen ange ett namn.");
    return;
  }

  localStorage.setItem("playerName", playerName);
  localStorage.setItem("faction", faction); // Spara fraktionen
  window.location.href = "gameplay.html";
}

// Starta spelet
function startGame() {
  if (timerRunning) return;
  timerRunning = true;

  scrambledLetters = words.join('').split('').sort(() => Math.random() - 0.5).join('');
  document.getElementById("available-letters").textContent = scrambledLetters;

  document.getElementById("words").innerHTML = words.map(word =>
      `<p>${"_ ".repeat(word.length)} (${word.length})</p>`
  ).join('');

  startTimer();
}

// Mäktig timer
function startTimer() {
  const timeLeftElement = document.getElementById("epic-time-left");
  timer = setInterval(() => {
    timeLeft--;
    timeLeftElement.textContent = timeLeft;

    timeLeftElement.style.transform = "scale(1.2)";
    setTimeout(() => timeLeftElement.style.transform = "scale(1)", 300);

    if (timeLeft <= 10) {
      timeLeftElement.style.color = "red";
      timeLeftElement.style.animation = "flashRed 1s infinite";
    }

    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame(false);
    }
  }, 1000);
}

// Kontrollera gissning
function checkWord() {
  const input = document.getElementById("guess").value.trim().toLowerCase();
  if (words.includes(input) && !guessedWords.includes(input)) {
    guessedWords.push(input);
    score += input.length + 10;
    updateGame(input);
    alert("Rätt ord!");
  } else {
    alert("Fel eller redan gissat ord!");
  }
  document.getElementById("guess").value = "";
}

function updateGame(word) {
  scrambledLetters = scrambledLetters.split('').filter(char => !word.includes(char)).join('');
  document.getElementById("available-letters").textContent = scrambledLetters;

  document.getElementById("score").textContent = `Poäng: ${score}`;
  document.getElementById("words").innerHTML = words.map(w =>
      guessedWords.includes(w) ? `<p>${w} (${w.length})</p>` : `<p>${"_ ".repeat(w.length)} (${w.length})</p>`
  ).join('');

  if (guessedWords.length === words.length) {
    endGame(true);
  }
}

function endGame(won) {
  clearInterval(timer);
  alert(won ? `Grattis! Poäng: ${score}` : `Tiden är slut! Poäng: ${score}`);
  location.reload();
}

window.onload = () => {
  document.getElementById("startTimerBtn").addEventListener("click", startGame);
  document.getElementById("checkWordBtn").addEventListener("click", checkWord);
};
