async function fetchAndDisplayHighscores() {
    try {
        console.log("highscore.js laddat!"); // Bekräfta att rätt script körs

        const response = await fetch("/api/gethighscores");
        console.log("API Response Status:", response.status); // Kontrollera API-svar
        if (!response.ok) {
            throw new Error("Misslyckades med att hämta highscores");
        }

        const highscores = await response.json();
        console.log("Fetched Highscores:", highscores); // Kontrollera datan

        const tableBody = document.querySelector("#highscoreTable tbody");
        if (!tableBody) {
            console.error("Table body not found!");
            return;
        }

        tableBody.innerHTML = ""; // Rensa tidigare innehåll

        highscores.forEach((highscore) => {
            const row = document.createElement("tr");
            row.innerHTML = `
        <td>${highscore.playerName}</td>
        <td>${highscore.faction}</td>
        <td>${highscore.score}</td>
    `;
            console.log("Adding row:", row.innerHTML); // Kontrollera att rätt värden loggas
            tableBody.appendChild(row);
        });

        console.log("Highscores renderade i tabellen");
    } catch (error) {
        console.error("Fel vid hämtning av highscores:", error);
    }
}

// Kör funktionen när sidan laddas
document.addEventListener("DOMContentLoaded", fetchAndDisplayHighscores);
