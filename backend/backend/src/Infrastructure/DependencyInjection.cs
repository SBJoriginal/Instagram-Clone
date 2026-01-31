using backend.src.Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UGram.src.Api.Middleware;


namespace UGram.src.Infrastructure
{
  public static class DependencyInjection
  {
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
      AddDBService(services, configuration);

      AddIdentityManagement(services);

      AddExceptionHandler(services);

      return services;
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
