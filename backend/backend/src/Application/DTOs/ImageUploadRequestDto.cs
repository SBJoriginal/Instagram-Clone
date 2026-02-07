namespace UGram.src.Application.DTOs
{
  public class ImageUploadRequestDto
  {
    public required IFormFile File { get; set; }
    public string? Description { get; set; }
    public string? Hashtags { get; set; }
    public string? Mentions { get; set; }
  }
}
