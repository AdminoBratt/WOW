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
    
}
