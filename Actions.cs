using Npgsql;

namespace Wordapp;

public class Actions
{

    Database database = new();
    private NpgsqlDataSource db;
    public Actions(WebApplication app)
    {
        db = database.Connection();
        
        // Map incomming TestWord GET route from client to method
        app.MapGet("/test-word/{word}", TestWord);

        // Map incomming NewWord POST route from client to method
        app.MapPost("/new-word", async (HttpContext context) =>
        {
            var requestBody = await context.Request.ReadFromJsonAsync<Word>();
            if (requestBody?.word is null)
            {
                return Results.BadRequest("Word is required.");
            }
            bool success = await NewWord(requestBody.word, context.Request.Cookies["ClientId"]);
            return success ? Results.Ok("Word added successfully.") : Results.StatusCode(500);
        });
    }
    
    // Process incomming TestWord from client
    async Task<bool> TestWord(string word)
    {
        await using var cmd = db.CreateCommand("SELECT EXISTS (SELECT 1 FROM words WHERE word = $1)"); // fast if word exists in table query 
        cmd.Parameters.AddWithValue(word);
        bool result = (bool)(await cmd.ExecuteScalarAsync() ?? false); // Execute fast if word exists in table query 
        return result;
    }


    // Process incomming NewWord  from client
    async Task<bool> NewWord(string word, string clientId)
    {
        await using var cmd = db.CreateCommand("INSERT INTO words (word, clientid) VALUES ($1, $2)");
        cmd.Parameters.AddWithValue(word);
        cmd.Parameters.AddWithValue(clientId);
        int rowsAffected = await cmd.ExecuteNonQueryAsync(); // Returns the number of rows affected
        return rowsAffected > 0; // Return true if the insert was successful
    }
}

