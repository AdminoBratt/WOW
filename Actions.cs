using Npgsql;

namespace Wordapp;

public class Actions
{

    Database database = new();
    private NpgsqlDataSource db;

    public Actions(WebApplication app)
    {
        db = database.Connection();

    }

    public async Task<Word> fetchAndGiveLetters()
    {
        await using var cmd = db.CreateCommand("Select ord from svenska_ord order by random() limit 1");
        await using var reader = await cmd.ExecuteReaderAsync();
        {
            if (await reader.ReadAsync())
            {
                return new Word(reader.GetString(0), reader.GetString(1));
            }
        }
        throw new InvalidOperationException("Inga ord hittades i databasen."); // Felhantering

    }
}
