namespace UGram.src.Application.DTOs
{
  public class ImageResponseDto
  {
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Hashtags { get; set; } = string.Empty;
    public string Mentions { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
  }
}
