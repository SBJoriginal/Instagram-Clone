using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.src.Domain.Entities
{
  public class UserProfile
  {
    [Key]
    public Guid Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [ForeignKey("UserId")]
    public ApplicationUser User { get; set; } = null!;

    public string? FirstName { get; set; }
    public string? LastName { get; set; }

    public string? PhoneNumber { get; set; }

    public DateTime? SignUpDate { get; set; }
  }
}
