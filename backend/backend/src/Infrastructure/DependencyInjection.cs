using Amazon.S3;
using backend.src.Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UGram.src.Api.Middleware;
using UGram.src.Application.Interfaces;
using UGram.src.Application.Services;


namespace UGram.src.Infrastructure
{
  public static class DependencyInjection
  {
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
      AddDBService(services, configuration);

      AddIdentityManagement(services);

      AddImageStorageService(services);

      AddExceptionHandler(services);

      return services;
    }

    private static void AddImageStorageService(IServiceCollection services)
    {
      // Uses the AWS SDK default credential and region chain:
      // - Credentials: AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env vars
      // - Region: AWS_REGION env var
      services.AddSingleton<IAmazonS3>(sp =>
      {
        var config = sp.GetRequiredService<IConfiguration>();
        var region = Environment.GetEnvironmentVariable("AWS_REGION") ?? config["AWS:Region"] ?? "us-east-2";
        return new AmazonS3Client(Amazon.RegionEndpoint.GetBySystemName(region));
      });
      services.AddScoped<IImageStorageService, S3ImageStorageService>();
    }

    private static void AddExceptionHandler(IServiceCollection services)
    {
      services.AddExceptionHandler<GlobalExceptionHandler>();
      services.AddProblemDetails();
    }

    private static void AddIdentityManagement(IServiceCollection services)
    {
      services.AddIdentity<ApplicationUser, IdentityRole>()
          .AddEntityFrameworkStores<AppDbContext>()
          .AddDefaultTokenProviders();
    }

    private static IServiceCollection AddDBService(IServiceCollection services, IConfiguration configuration)
    {
      return services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
    }
  }
}
