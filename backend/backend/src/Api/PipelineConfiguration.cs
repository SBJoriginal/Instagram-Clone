using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

namespace UGram.src.Api
{
  public static class PipelineConfiguration
  {
    private const string UploadsFolderName = "uploads";
    private const string UploadsRequestPath = "/uploads";

    public static WebApplication ConfigurePipeline(this WebApplication app)
    {
      if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName == "Docker")
      {
        app.UseSwagger();
        app.UseSwaggerUI();
        app.MigrateDatabase();
      }

      app.UseHttpsRedirection();
      app.UseStaticFiles();
      app.ConfigureUploadsFolder();
      app.UseCors("AllowAll");
      app.UseAuthentication();
      app.UseAuthorization();
      app.UseExceptionHandler();
      app.MapControllers();

      return app;
    }

    private static void ConfigureUploadsFolder(this WebApplication app)
    {
      var uploadsPath = Path.Combine(app.Environment.ContentRootPath, UploadsFolderName);

      if (!Directory.Exists(uploadsPath))
      {
        Directory.CreateDirectory(uploadsPath);
      }

      app.UseStaticFiles(new StaticFileOptions
      {
        FileProvider = new PhysicalFileProvider(uploadsPath),
        RequestPath = UploadsRequestPath
      });
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
        logger.LogError(ex, "An error occurred while migrating the database. Ensure PostgreSQL is running and the connection string is correct.");
      }
    }
  }
}
