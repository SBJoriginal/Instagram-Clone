using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

public class Notification
{
  [Key]
  public int Id { get; set; }

  [Required]
  public string RecipientUserId { get; set; } = string.Empty;

  [Required]
  public string ActorUserId { get; set; } = string.Empty;

  [Required]
  public int ImageId { get; set; }

  [ForeignKey("ImageId")]
  public virtual Image Image { get; set; } = null!;

  [Required]
  public string Type { get; set; } = string.Empty;

  public bool IsRead { get; set; } = false;

  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public DateTime CreatedAt { get; set; }
}
