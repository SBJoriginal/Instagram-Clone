using UGram.src.Api;
using UGram.src.Application;
using UGram.src.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;
using UGram.src.Application.Configuration;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Http.Features;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddEnvironmentVariables();

var sentryDsn = Environment.GetEnvironmentVariable("SENTRY_DSN");

builder.WebHost.UseSentry(options =>
{
  // If no DSN is provided (e.g. during EF Core migrations in CI), explicitly
  // setting it to an empty string safely disables Sentry and prevents exceptions.
  options.Dsn = string.IsNullOrWhiteSpace(sentryDsn) ? "" : sentryDsn;
  options.TracesSampleRate = 0.1; // Capture 10% of requests
});

builder.Services.Configure<FileUploadSettings>(
    builder.Configuration.GetSection("FileUpload"));

builder.Services.AddApplication()
                .AddInfrastructure(builder.Configuration)
                .AddWebAPI(builder.Configuration);

builder.WebHost.ConfigureKestrel(serverOptions =>
{
  serverOptions.Limits.MaxRequestBodySize = 20 * 1024 * 1024;
});

builder.Services.Configure<FormOptions>(options =>
{
  options.MultipartBodyLengthLimit = 20 * 1024 * 1024;
});

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
  options.AddFixedWindowLimiter("InteractionPolicy", opt =>
  {
    opt.PermitLimit = 10;
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
