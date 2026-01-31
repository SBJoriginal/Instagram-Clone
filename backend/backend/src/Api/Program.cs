using backend.src.Domain.Entities;
using FluentValidation;
using FluentValidation.AspNetCore;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<Infrastructure.Persistence.AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

//builder.Services.AddDbContext<AppDbContext>(options =>
//    options.UseInMemoryDatabase("InMemoryDb"));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddFluentValidationAutoValidation()
                .AddFluentValidationClientsideAdapters();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName == "Docker")
{
  app.UseSwagger();
  app.UseSwaggerUI();

  using (var scope = app.Services.CreateScope())
  {
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
      var db = scope.ServiceProvider.GetRequiredService<Infrastructure.Persistence.AppDbContext>();
      db.Database.Migrate();
      logger.LogInformation("Database migration completed successfully.");
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "An error occurred while migrating the database. Ensure PostgreSQL is running and the connection string is correct.");
    }
  }
}

app.UseHttpsRedirection();
app.UseStaticFiles();

var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
  Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions
{
  FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
  RequestPath = "/uploads"
});
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
