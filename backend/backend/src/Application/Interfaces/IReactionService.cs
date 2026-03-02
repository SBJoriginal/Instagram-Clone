namespace UGram.src.Application.Interfaces;

public interface IReactionService
{
    Task<bool> ToggleReactionAsync(int imageId, string userId);
}
