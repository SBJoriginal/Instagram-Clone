namespace backend.Application.DTOs;

public class ImagePostDto
{
  public int Id { get; set; }
  public string UserId { get; set; } = string.Empty;
  public string ImageUrl { get; set; } = string.Empty;
  public string Description { get; set; } = string.Empty;
  public List<string> Hashtags { get; set; } = [];
  public string MentionedUser { get; set; } = string.Empty;
  public string CreatedAt { get; set; } = string.Empty;
}
