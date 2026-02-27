using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

namespace UGram.src.Api
{
  public static class DependencyInjection
  {
    public static IServiceCollection AddWebAPI(this IServiceCollection services, IConfiguration configuration)
    {
      services.AddCors(options =>
      {
        options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
      });

      services.AddAuthentication(options =>
      {
        options.DefaultAuthenticateScheme = "Bearer";
        options.DefaultChallengeScheme = "Bearer";
      }).AddJwtBearer("Bearer", options =>
      {
        var jwtSettings = configuration.GetSection("JwtSettings");
        var secret = jwtSettings["Secret"];

        if (string.IsNullOrEmpty(secret))
        {
          throw new InvalidOperationException("JWT Secret is not configured in appsettings.json");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret!));

        options.TokenValidationParameters = new TokenValidationParameters
        {
          ValidateIssuerSigningKey = true,
          IssuerSigningKey = key,
          ValidateIssuer = true,
          ValidIssuer = jwtSettings["Issuer"],
          ValidateAudience = true,
          ValidAudience = jwtSettings["Audience"],
          ValidateLifetime = true,
          ClockSkew = TimeSpan.Zero
        };
      });

      services.AddControllers();
      services.AddEndpointsApiExplorer();
      services.AddSwaggerGen(options =>
      {
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
          Name = "Authorization",
          Type = SecuritySchemeType.Http,
          Scheme = "Bearer",
          BearerFormat = "JWT",
          Description = "Enter your JWT token in the format: {token}"
        });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
          {
            new OpenApiSecurityScheme
            {
              Reference = new OpenApiReference
              {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
              }
            },
            new string[] { }
          }
        });
      });
      return services;
    }
  }
}
