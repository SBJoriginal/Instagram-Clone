using UGram.src.Api;
using UGram.src.Application;
using UGram.src.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;
using UGram.src.Application.Configuration;
using Microsoft.AspNetCore.RateLimiting;

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
});

var app = builder.Build();

app.ConfigurePipeline();

app.Run();
