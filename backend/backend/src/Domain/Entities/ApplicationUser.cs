using Microsoft.AspNetCore.Identity;

namespace backend.src.Domain.Entities
{
  public class ApplicationUser : IdentityUser
  {
    public UserProfile? UserProfile { get; set; }
  }
}
