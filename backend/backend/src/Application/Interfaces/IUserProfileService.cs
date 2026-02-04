using backend.src.Application.DTOs;
using UGram.src.Application.DTOs;

namespace UGram.src.Application.Interfaces
{
  public interface IUserProfileService
  {
    Task CompleteProfileAsync(string userId, UserProfileRequestDto userProfileDto);

    Task<UserProfileResponseDto> GetUserProfileAsync(string userId);
    Task<ProfilePictureResponseDto> UploadProfilePictureAsync(string userId, IFormFile file);
    Task DeleteProfilePictureAsync(string userId);
  }
}
