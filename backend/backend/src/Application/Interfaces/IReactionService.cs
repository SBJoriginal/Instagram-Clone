namespace UGram.src.Application.Interfaces;

public interface IReactionService
{
  Task<bool> ToggleReactionAsync(int imageId, string userId);
  Task<List<UGram.src.Application.DTOs.UserProfileResponseDto>> GetUsersWhoReactedAsync(int imageId);
}
