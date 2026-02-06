using UGram.src.Api;
using UGram.src.Application;
using UGram.src.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddApplication()
                .AddInfrastructure(builder.Configuration)
                .AddWebAPI(builder.Configuration);

var app = builder.Build();

// Apply database migrations automatically on startup
using (var scope = app.Services.CreateScope())
{
  var services = scope.ServiceProvider;
  try
  {
    var context = services.GetRequiredService<AppDbContext>();
    context.Database.Migrate();
    Console.WriteLine("Database migrations applied successfully.");
  }
  catch (Exception ex)
  {
    Console.WriteLine($"An error occurred while migrating the database: {ex.Message}");
  }
}

app.ConfigurePipeline();
app.Run();
