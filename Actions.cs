using Npgsql;

namespace Wordapp;

public static class Actions
{
    // Registrerar spelets API-endpoints. NpgsqlDataSource hämtas via
    // dependency injection i varje endpoint i stället för att skapas här.
    public static WebApplication MapWordAppEndpoints(this WebApplication app)
    {
        app.MapGet("/api/getrandomword/{round}", FetchWord);
    
        async Task<Word> FetchWord(int round, NpgsqlDataSource db)
        {
            string query;
            if (round == 1)
            {
                // Första rundan: ord med max 5 bokstäver
                query = "SELECT ord FROM svenska_ord WHERE LENGTH(ord) <= 4 ORDER BY random() LIMIT 1";
            }
            else if (round == 2)
            {
                query = "SELECT ord FROM svenska_ord WHERE LENGTH(ord) <= 6 ORDER BY random() LIMIT 1";

            }
            else
            {
                query = "SELECT ord FROM svenska_ord WHERE LENGTH(ord) >= 7 ORDER BY random() LIMIT 1";

            }
            
            await using var cmd = db.CreateCommand(query);
            await using var reader = await cmd.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                return new Word(reader.GetString(0));
            }
            
            throw new InvalidOperationException("Inga ord hittades i databasen."); // Felhantering

        }
        
        app.MapPost("/api/savehighscore", async (HighScoreRequest request, NpgsqlDataSource db) =>
        {
            string query = "INSERT INTO highscore (player_name, faction, score) VALUES (@name, @faction, @score)";
            
            
            await using var cmd = db.CreateCommand(query);
            cmd.Parameters.AddWithValue("@name", request.PlayerName);
            cmd.Parameters.AddWithValue("@faction", request.Faction);
            cmd.Parameters.AddWithValue("@score", request.Score);
            Console.WriteLine($"Name: {request.PlayerName}, Faction: {request.Faction}, Score: {request.Score}");
            
            try
            {
                int rowsAffected = await cmd.ExecuteNonQueryAsync();
                if (rowsAffected > 0)
                {
                    return Results.Ok("Highscore sparat");
                }
                else
                {
                    return Results.BadRequest("Kunde inte spara highscore.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Fel vid sparande av highscore: {ex.Message}");
                return Results.Problem("Ett fel inträffade vid sparande av highscore.");
            }   
        });
        // Anslut till databasen
        
        // API för att hämta highscores
        app.MapGet("/api/gethighscores", async (NpgsqlDataSource db) =>
        {
            string query = "SELECT player_name, faction, score FROM highscore ORDER BY score DESC LIMIT 10";

            await using var cmd = db.CreateCommand(query);
            await using var reader = await cmd.ExecuteReaderAsync();

            var highscores = new List<HighScoreResponse>();
            while (await reader.ReadAsync())
            {
                highscores.Add(new HighScoreResponse
                {
                    PlayerName = reader.GetString(0),
                    Faction = reader.GetString(1),
                    Score = reader.GetInt32(2)
                });
            }

            return Results.Ok(highscores);
        });

        return app;
    }
}

    public class HighScoreResponse
    {
        public string PlayerName { get; set; }
        public string Faction { get; set; }
        public int Score { get; set; }
    }
    
    
    
