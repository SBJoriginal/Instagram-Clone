namespace backend.Domain.Entities;

public class ImagePost
{
  public int Id { get; set; }
  public int UserId { get; set; }
  public string ImageUrl { get; set; } = string.Empty;
  public string Description { get; set; } = string.Empty;
  public List<string> Hashtags { get; set; } = [];
  public string MentionedUser { get; set; } = string.Empty;
  public DateTime CreatedAt { get; set; }
}
