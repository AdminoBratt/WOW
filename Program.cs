using System.Security.Cryptography;
using Wordapp;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Anslutningssträngen läses från konfigurationen (user-secrets, miljövariabel
// eller appsettings.*.json) och checkas aldrig in i koden.
var connectionString = builder.Configuration.GetConnectionString("WordCraftDb");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Anslutningssträngen 'ConnectionStrings:WordCraftDb' saknas. " +
        "Sätt den med 'dotnet user-secrets set \"ConnectionStrings:WordCraftDb\" \"...\"' " +
        "eller miljövariabeln ConnectionStrings__WordCraftDb. Se README.md.");
}

// NpgsqlDataSource är trådsäker och hanterar connection pooling,
// så en enda instans registreras som singleton och injiceras i endpoints.
builder.Services.AddSingleton(_ => NpgsqlDataSource.Create(connectionString));

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();


var app = builder.Build();



// Serve static files from wwwroot
app.UseDefaultFiles(); // Serving index.html as the default file
app.UseStaticFiles(); // Serves other static files like CSS, JS, images, etc.

// Middleware to set or retrieve the client identifier cookie
app.Use(async (context, next) =>
{
    const string clientIdCookieName = "ClientId";

    if (!context.Request.Cookies.TryGetValue(clientIdCookieName, out var clientId))
    {
        // Generate a new unique client ID
        clientId = GenerateUniqueClientId();
        context.Response.Cookies.Append(clientIdCookieName, clientId, new CookieOptions
        {
            HttpOnly = true, // Prevent client-side JavaScript from accessing the cookie
            Secure = false,   // Use only over HTTPS (false for dev)
            SameSite = SameSiteMode.Strict,
            MaxAge = TimeSpan.FromDays(365) // Cookie expiration
        });
        Console.WriteLine($"New client ID generated and set: {clientId}");
    }
    else
    {
        Console.WriteLine($"Existing client ID found: {clientId}");
    }

    // Pass to the next middleware
    await next();
});

// Helper function to generate a unique client ID
static string GenerateUniqueClientId()
{
    using var rng = RandomNumberGenerator.Create();
    var bytes = new byte[16];
    rng.GetBytes(bytes);
    return Convert.ToBase64String(bytes);
}

// Registrera API-endpoints (se Actions.cs)
app.MapWordAppEndpoints();

app.Run();
