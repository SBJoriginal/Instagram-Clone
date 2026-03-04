using UGram.src.Api;
using UGram.src.Application;
using UGram.src.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;
using UGram.src.Application.Configuration;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddEnvironmentVariables();

builder.Services.Configure<FileUploadSettings>(
    builder.Configuration.GetSection("FileUpload"));

builder.Services.AddApplication()
                .AddInfrastructure(builder.Configuration)
                .AddWebAPI(builder.Configuration);

builder.Services.AddRateLimiter(options =>
{
  options.AddFixedWindowLimiter("login", opt =>
  {
    opt.PermitLimit = 5;
    opt.Window = TimeSpan.FromMinutes(1);
    opt.QueueLimit = 0;
  });
  options.AddFixedWindowLimiter("AutocompletePolicy", opt =>
   {
     opt.PermitLimit = 60;
     opt.Window = TimeSpan.FromMinutes(1);
     opt.QueueLimit = 0;
     opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
   });
});

var app = builder.Build();

// Auto-migrate only in local environments — never in Staging or Production.
// Staging/Production migrations run via CI/CD before the deploy step.
if (app.Environment.EnvironmentName is "Development" or "Docker")
{
  using var scope = app.Services.CreateScope();
  var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
  await db.Database.MigrateAsync();
}

app.ConfigurePipeline();

app.Run();
