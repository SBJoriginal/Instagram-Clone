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

      AddImageStorageService(services, configuration);

      AddExceptionHandler(services);

      return services;
    }

    private static void AddImageStorageService(IServiceCollection services, IConfiguration configuration)
    {
      var environment = configuration["ASPNETCORE_ENVIRONMENT"] ?? "Development";

      if (environment == "Production" || environment == "Staging")
      {
        // AWS S3 service commented out until properly configured
        //services.AddAWSService<IAmazonS3>();
        //services.AddScoped<IImageStorageService, S3ImageStorageService>();

        // Fallback to local storage if S3 not configured
        services.AddScoped<IImageStorageService, LocalImageStorageService>();
      }
      else
      {
        // Use local storage for development
        services.AddScoped<IImageStorageService, LocalImageStorageService>();
      }
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
