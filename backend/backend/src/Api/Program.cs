using UGram.src.Api;
using UGram.src.Application;
using UGram.src.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;
using UGram.src.Application.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<FileUploadSettings>(
    builder.Configuration.GetSection("FileUpload"));

builder.Services.AddApplication()
                .AddInfrastructure(builder.Configuration)
                .AddWebAPI(builder.Configuration);

var app = builder.Build();

app.ConfigurePipeline();

app.Run();
