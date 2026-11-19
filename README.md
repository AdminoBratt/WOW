# World of WordCraft (WOW)

Ett webbaserat ordspel med fantasy-tema. Spelaren skapar en karaktär, väljer stil och gissar ord i flera rundor som blir svårare och svårare. Poängen sparas på en highscore-lista. Projektet byggdes i grupp under utbildningen på NBI/Handelsakademin.

## Teknik

- **Backend:** ASP.NET Core (.NET 8) med Minimal API
- **Databas:** PostgreSQL via [Npgsql](https://www.npgsql.org/) med parametriserade SQL-frågor
- **Frontend:** HTML, CSS och JavaScript som serveras som statiska filer från `wwwroot/`
- **Arbetssätt:** Git med feature-branches och gemensamma kodgenomgångar före merge

## Arkitektur i korthet

- `Program.cs` konfigurerar appen. Den läser anslutningssträngen från konfigurationen, registrerar `NpgsqlDataSource` som singleton i DI-containern och sätter upp statiska filer och en middleware som ger varje klient ett `ClientId` i en HttpOnly-cookie.
- `Actions.cs` innehåller API-endpoints. Där registreras de som en extension-metod (`app.MapWordAppEndpoints()`). Databasanslutningen injiceras i varje endpoint via dependency injection.
- `HighScoreRequest.cs` och `Word.cs` innehåller DTO:er för request och response.

## API

| Metod | Route | Beskrivning |
|-------|-------|-------------|
| GET   | `/api/getrandomword/{round}` | Slumpar ett ord. Ordets längd beror på rundan (1: ≤ 4 bokstäver, 2: ≤ 6, därefter ≥ 7). |
| POST  | `/api/savehighscore` | Sparar `{ playerName, faction, score }`. |
| GET   | `/api/gethighscores` | Returnerar de tio bästa resultaten. |

## Kom igång

**Krav:** .NET 8 SDK och en PostgreSQL-databas med tabellerna `svenska_ord (ord)` och `highscore (player_name, faction, score)`.

1. Klona repot och gå till mappen.
2. Ange anslutningssträngen. Den checkas **aldrig** in i koden. Välj ett av sätten:

   ```bash
   # Lokalt med user-secrets (sparas utanför repot)
   dotnet user-secrets set "ConnectionStrings:WordCraftDb" "Host=localhost;Port=5432;Database=worldofwordcraft;Username=<användare>;Password=<lösenord>"
   ```

   ```bash
   # Eller med en miljövariabel, till exempel vid driftsättning
   export ConnectionStrings__WordCraftDb="Host=...;Port=...;Database=...;Username=...;Password=..."
   ```

3. Starta appen:

   ```bash
   dotnet run
   ```

   Öppna adressen som visas i terminalen, till exempel `http://localhost:5185`.

Om anslutningssträngen saknas avbryts starten med ett tydligt felmeddelande.
