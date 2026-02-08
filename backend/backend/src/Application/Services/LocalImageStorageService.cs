using UGram.src.Application.Interfaces;

namespace UGram.src.Application.Services
{
  public class LocalImageStorageService : IImageStorageService
  {
    private readonly IWebHostEnvironment _environment;

    public LocalImageStorageService(IWebHostEnvironment environment)
    {
      _environment = environment;
    }

    public async Task<string> SaveImageAsync(IFormFile file, string folder)
    {
      if (file == null || file.Length == 0)
        throw new ArgumentException("File is empty or null.", nameof(file));

      var rootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
      var uploadsFolder = Path.Combine(rootPath, folder);

      var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(file.FileName);
      var filePath = Path.Combine(uploadsFolder, uniqueFileName);

      using (var stream = new FileStream(filePath, FileMode.Create))
      {
        await file.CopyToAsync(stream);
      }

      // Retourner le chemin relatif pour l'accès statique
      var relativePath = $"/{folder}/{uniqueFileName}".Replace("\\", "/");
      return relativePath;
    }

    public async Task DeleteImageAsync(string filePath)
    {
      if (string.IsNullOrEmpty(filePath))
        return;

      var fullPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, filePath.TrimStart('/'));

      if (File.Exists(fullPath))
      {
        File.Delete(fullPath);
      }

      await Task.CompletedTask;
    }


    public string GetImageUrl(string filePath)
    {
      if (string.IsNullOrEmpty(filePath))
        return string.Empty;

      return filePath.StartsWith("/") ? filePath : $"/{filePath}";
    }
  }
}
