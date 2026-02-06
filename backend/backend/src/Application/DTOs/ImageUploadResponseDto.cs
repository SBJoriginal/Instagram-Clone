namespace UGram.src.Application.DTOs
{
  public class ImageUploadResponseDto
  {
    public int Id { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public string UserId { get; set; } = string.Empty; //replaced with username when that is implemented

    public DateTime CreatedAt { get; set; }
  }
}
