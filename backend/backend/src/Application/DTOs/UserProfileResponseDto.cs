namespace UGram.src.Application.DTOs
{
  public class UserProfileResponseDto
  {
    public string Id { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public DateTime SignUpDate { get; set; } = DateTime.Now;

    public string? ProfilePictureUrl { get; set; }

    public bool IsDeleted { get; set; } = false;
  }
}
