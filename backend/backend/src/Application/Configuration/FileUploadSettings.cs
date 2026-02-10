namespace UGram.src.Application.Configuration
{
  public class FileUploadSettings
  {
    public string[] AllowedImageExtensions { get; set; } = Array.Empty<string>();
    public int MaxFileSizeInMB { get; set; } = 5;
    public Dictionary<string, string> ImageMimeTypes { get; set; } = new();
  }
}
