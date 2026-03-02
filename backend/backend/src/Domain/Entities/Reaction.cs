using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

public class Reaction
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ImageId { get; set; }

    [ForeignKey("ImageId")]
    public virtual Image Image { get; set; } = null!;

    [Required]
    public string UserId { get; set; } = string.Empty;

    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime CreatedAt { get; set; }
}
