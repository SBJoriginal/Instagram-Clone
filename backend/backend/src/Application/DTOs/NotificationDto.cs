namespace UGram.src.Application.DTOs
{
  public class NotificationDto
  {
    public int Id { get; set; }
    public string ActorUsername { get; set; } = string.Empty;
    public string? ActorProfilePictureUrl { get; set; }
    public int ImageId { get; set; }
    public string Type { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Message { get; set; } = string.Empty;
  }
}
