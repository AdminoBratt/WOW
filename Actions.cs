using Npgsql;

namespace Wordapp;

public class Actions
{

    Database database = new();
    private NpgsqlDataSource db;

    public Actions(WebApplication app)
    {
        db = database.Connection();
        
        
        app.MapGet("/api/getrandomword", FetchWord);
    
        async Task<Word> FetchWord()
        {
            await using var cmd = db.CreateCommand("Select ord from svenska_ord order by random() limit 1");
            await using var reader = await cmd.ExecuteReaderAsync();
            {
                if (await reader.ReadAsync())
                {
                    return new Word(reader.GetString(0));
                }
            }
            throw new InvalidOperationException("Inga ord hittades i databasen."); // Felhantering

        }
    }
    }
    
    
