using Application.Interfaces;
using Application.Services;
using FluentValidation;
using FluentValidation.AspNetCore;
using UGram.src.Application.Interfaces;
using UGram.src.Application.Services;
using UGram.src.Application.Validators;

namespace UGram.src.Application
{
  public static class DependencyInjection
  {
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
      AddAuthenticationServices(services);
      AddValidators(services);
      return services;
    }

    private static void AddValidators(IServiceCollection services)
    {
      services.AddFluentValidationAutoValidation();
      services.AddValidatorsFromAssemblyContaining<RegisterUserValidator>();
    }

    private static void AddAuthenticationServices(IServiceCollection services)
    {
      services.AddScoped<IAuthService, AuthService>();
      services.AddScoped<IUserProfileService, ProfileService>();
      services.AddScoped<ITokenService, JwtTokenService>();
      services.AddScoped<IImageStorageService, LocalImageStorageService>();
      services.AddScoped<IImageService, ImageService>();
      services.AddScoped<IReactionService, ReactionService>();
      services.AddScoped<ICommentService, CommentService>();
      services.AddScoped<INotificationService, NotificationService>();
      services.AddScoped<IHealthService, HealthService>();
      services.AddHttpClient<IAnalyticsService, AnalyticsService>();
    }
  }
}
