using UGram.src.Api;
using UGram.src.Application;
using UGram.src.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddApplication()
                .AddInfrastructure(builder.Configuration)
                .AddWebAPI(builder.Configuration);

var app = builder.Build();

app.ConfigurePipeline();

app.Run();
