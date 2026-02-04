namespace UGram.src.Application.Interfaces
{

  public interface IImageStorageService
  {
    Task<string> SaveImageAsync(IFormFile file, string folder);
    Task DeleteImageAsync(string filePath);
    string GetImageUrl(string filePath);
  }
}
