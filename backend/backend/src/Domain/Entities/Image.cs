using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public DateTime CreatedAt { get; set; }

  public string FilePath { get; set; } = string.Empty;

  [Required]
  public string UserId { get; set; } = string.Empty;
}
