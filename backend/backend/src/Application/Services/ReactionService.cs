using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using UGram.src.Application.Interfaces;

namespace UGram.src.Application.Services;

public class ReactionService : IReactionService
{
  private readonly AppDbContext _context;
  private readonly INotificationService _notificationService;

  public ReactionService(AppDbContext context, INotificationService notificationService)
  {
    _context = context;
    _notificationService = notificationService;
  }

  public async Task<bool> ToggleReactionAsync(int imageId, string userId)
  {
    var existingReaction = await _context.Reactions.FirstOrDefaultAsync(r =>
      r.ImageId == imageId && r.UserId == userId
    );

    if (existingReaction != null)
    {
      _context.Reactions.Remove(existingReaction);
      await _context.SaveChangesAsync();
      return false; // Reaction removed
    }

    var image = await _context.Images.FirstOrDefaultAsync(i => i.Id == imageId);
    if (image == null)
    {
      throw new KeyNotFoundException("Image not found");
    }

    var reaction = new Reaction { ImageId = imageId, UserId = userId };

    _context.Reactions.Add(reaction);
    await _context.SaveChangesAsync();

    await _notificationService.CreateNotificationAsync(image.UserId, userId, imageId, "Like");

    return true; // Reaction added
  }
}
