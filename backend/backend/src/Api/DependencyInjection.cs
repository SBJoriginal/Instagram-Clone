using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace UGram.src.Api
{
  public static class DependencyInjection
  {
    public static IServiceCollection AddWebAPI(
      this IServiceCollection services,
      IConfiguration configuration
    )
    {
      services.AddCors(options =>
      {
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        options.AddPolicy(
          "AllowAll",
          p => p.WithOrigins(allowedOrigins).AllowAnyMethod().AllowAnyHeader().AllowCredentials()
        );
      });

      services
        .AddAuthentication(options =>
        {
          options.DefaultAuthenticateScheme = "Bearer";
          options.DefaultChallengeScheme = "Bearer";
        })
        .AddJwtBearer(
          "Bearer",
          options =>
          {
            var jwtSettings = configuration.GetSection("JwtSettings");
            var secret = jwtSettings["Secret"];

            if (string.IsNullOrEmpty(secret))
            {
              throw new InvalidOperationException(
                "JWT Secret is not configured in appsettings.json"
              );
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
              ClockSkew = TimeSpan.Zero,
            };

            options.Events = new JwtBearerEvents
            {
              OnMessageReceived = context =>
              {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                  context.Token = accessToken;
                }
                return Task.CompletedTask;
              },
            };
          }
        );

      services.AddControllers();
      services.AddSignalR();
      services.AddEndpointsApiExplorer();
      services.AddSwaggerGen(options =>
      {
        var xmlFilename = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
        options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));

        options.AddSecurityDefinition(
          "Bearer",
          new OpenApiSecurityScheme
          {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            Description = "Enter your JWT token: ",
          }
        );

        options.AddSecurityRequirement(
          new OpenApiSecurityRequirement
          {
            {
              new OpenApiSecurityScheme
              {
                Reference = new OpenApiReference
                {
                  Type = ReferenceType.SecurityScheme,
                  Id = "Bearer",
                },
              },
              new string[] { }
            },
          }
        );
      });
      return services;
    }
  }
}
