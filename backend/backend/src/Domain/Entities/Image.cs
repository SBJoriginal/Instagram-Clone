
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

public class Image
{
  [Key]
  public int Id { get; set; }

  [Required]
  public string FileName { get; set; } = string.Empty;

  [Required]
  public string ContentType { get; set; } = string.Empty;

  public long Size { get; set; }

  public string Description { get; set; } = string.Empty;

  public string Hashtags { get; set; } = string.Empty;

  public string Mentions { get; set; } = string.Empty;

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  // In a real app, this might be a link to cloud storage (S3/Azure Blob)
  // For now, we'll store the local path or the relative URL
  public string FilePath { get; set; } = string.Empty;
}
