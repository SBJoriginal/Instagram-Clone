using Infrastructure.Persistence;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using UGram.src.Api.Hubs;
using UGram.src.Application.Configuration;

namespace UGram.src.Api
{
  public static class PipelineConfiguration
  {
    private const string UploadsFolderName = "uploads";
    private const string UploadsRequestPath = "/uploads";

    public static WebApplication ConfigurePipeline(this WebApplication app)
    {
      app.UseExceptionHandler();

      // Security Headers for Google OAuth / GSI
      app.Use(
        async (context, next) =>
        {
          context.Response.Headers.Append("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
          context.Response.Headers.Append("Cross-Origin-Embedder-Policy", "require-corp");
          await next();
        }
      );

      app.UseSwagger();
      app.UseSwaggerUI();

      if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName == "Docker")
      {
        app.MigrateDatabase();
      }

      var fileUploadSettings = app
        .Services.GetRequiredService<IOptions<FileUploadSettings>>()
        .Value;
      var provider = new FileExtensionContentTypeProvider();

      foreach (var mimeType in fileUploadSettings.ImageMimeTypes)
      {
        provider.Mappings[mimeType.Key] = mimeType.Value;
      }

      app.UseStaticFiles(new StaticFileOptions { ContentTypeProvider = provider });
      app.ConfigureUploadsFolder();
      app.UseRouting();
      app.UseCors("AllowAll");
      app.UseRateLimiter();
      app.UseAuthentication();
      app.UseAuthorization();
      app.MapControllers();
      app.MapHub<NotificationHub>("/hubs/notifications");

      return app;
    }

    private static void ConfigureUploadsFolder(this WebApplication app)
    {
      var uploadsPath = Path.Combine(app.Environment.ContentRootPath, UploadsFolderName);

      if (!Directory.Exists(uploadsPath))
      {
        Directory.CreateDirectory(uploadsPath);
      }

      app.UseStaticFiles(
        new StaticFileOptions
        {
          FileProvider = new PhysicalFileProvider(uploadsPath),
          RequestPath = UploadsRequestPath,
        }
      );
    }

    private static void MigrateDatabase(this WebApplication app)
    {
      using var scope = app.Services.CreateScope();
      var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

      try
      {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
        logger.LogInformation("Database migration completed successfully.");
      }
      catch (Exception ex)
      {
        logger.LogError(
          ex,
          "An error occurred while migrating the database. Ensure PostgreSQL is running and the connection string is correct."
        );
        throw;
      }
    }
  }
}
