namespace backend.Application.DTOs;

public class UserDto
{
  public int Id { get; set; }
  public string Username { get; set; } = string.Empty;
  public string FirstName { get; set; } = string.Empty;
  public string LastName { get; set; } = string.Empty;
  public string Email { get; set; } = string.Empty;
  public string PhoneNumber { get; set; } = string.Empty;
  public string ProfilePictureUrl { get; set; } = string.Empty;
  public string RegistrationDate { get; set; } = string.Empty;
}
