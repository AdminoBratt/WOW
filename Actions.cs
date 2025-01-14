using Npgsql;

namespace Wordapp;

public class Actions
{

    Database database = new();
    private NpgsqlDataSource db;

    public Actions(WebApplication app)
    {
        db = database.Connection();
        
        
        app.MapGet("/api/getrandomword/{round}", FetchWord);
    
        async Task<Word> FetchWord(int round)
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
        
        app.MapPost("/api/savehighscore", async (HighScoreRequest request) =>
        {
            string query = "INSERT INTO highscore (player_name, faction, score) VALUES (@name, @faction, @score)";
            
            
            await using var cmd = db.CreateCommand(query);
            cmd.Parameters.AddWithValue("@name", request.PlayerName);
            cmd.Parameters.AddWithValue("@faction", request.Faction);
            cmd.Parameters.AddWithValue("@score", request.Score);
            Console.WriteLine($"Name: {request.PlayerName}, Faction: {request.Faction}, Score: {request.Score}");
            
            int rowsAffected = await cmd.ExecuteNonQueryAsync();
            if (rowsAffected > 0)
            {
                return Results.Ok("Highscore sparat");
            }
            else
            {
                return Results.BadRequest("Kunde inte spara highscore.");
            }
        });
    }
    }
    
    
