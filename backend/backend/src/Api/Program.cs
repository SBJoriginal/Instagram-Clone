using UGram.src.Api;
using UGram.src.Application;
using UGram.src.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddApplication()
                .AddInfrastructure(builder.Configuration)
                .AddWebAPI();

var app = builder.Build();

app.ConfigurePipeline();
app.Run();
