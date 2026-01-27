using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<Infrastructure.Persistence.AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
  app.UseSwagger();
  app.UseSwaggerUI();

  using (var scope = app.Services.CreateScope())
  {
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
      var db = scope.ServiceProvider.GetRequiredService<Infrastructure.Persistence.AppDbContext>();
      db.Database.EnsureCreated();
      logger.LogInformation("Database initialized successfully.");
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "An error occurred while initializing the database. Ensure PostgreSQL is running and the connection string is correct.");
    }
  }
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowAll");
app.UseAuthorization();

app.MapControllers();

app.Run();
