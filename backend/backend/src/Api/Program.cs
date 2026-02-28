using UGram.src.Api;
using UGram.src.Application;
using UGram.src.Infrastructure;
using UGram.src.Application.Configuration;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

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

app.ConfigurePipeline();

app.Run();
