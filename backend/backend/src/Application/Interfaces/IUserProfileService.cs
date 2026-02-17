using backend.src.Application.DTOs;
using UGram.src.Application.DTOs;

namespace UGram.src.Application.Interfaces
{
  public interface IUserProfileService
  {
    Task CompleteProfileAsync(string userId, UserProfileRequestDto userProfileDto, string requesterUserId);

    Task<UserProfileResponseDto> GetUserProfileAsync(string userId);
    Task<List<UserProfileResponseDto>> GetAllProfilesAsync();
    Task<UserProfileResponseDto?> GetProfileByIdAsync(string userId);
    Task<UserProfileResponseDto?> GetProfileByUsernameAsync(string username);
    Task<List<ImageResponseDto>> GetProfileImagesAsync(string userId);
    Task<ProfilePictureResponseDto> UploadProfilePictureAsync(string userId, IFormFile file, string requesterUserId);
    Task DeleteProfilePictureAsync(string userId, string requesterUserId);
    Task UpdateProfileAsync(string userId, UserProfileRequestDto userProfileDto, string requesterUserId);
  }
}
