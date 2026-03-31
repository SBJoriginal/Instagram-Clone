using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using UGram.src.Application.Interfaces;

namespace UGram.src.Application.Services;

public class ReactionService : IReactionService
{
  private readonly AppDbContext _context;

  public ReactionService(AppDbContext context)
  {
    _context = context;
  }

  public async Task<bool> ToggleReactionAsync(int imageId, string userId)
  {
    var existingReaction = await _context.Reactions
        .FirstOrDefaultAsync(r => r.ImageId == imageId && r.UserId == userId);

    if (existingReaction != null)
    {
      _context.Reactions.Remove(existingReaction);
      await _context.SaveChangesAsync();
      return false; // Reaction removed
    }

    var imageExists = await _context.Images.AnyAsync(i => i.Id == imageId);
    if (!imageExists)
    {
      throw new KeyNotFoundException("Image not found");
    }

    var reaction = new Reaction
    {
      ImageId = imageId,
      UserId = userId
    };

    _context.Reactions.Add(reaction);
    await _context.SaveChangesAsync();
    return true; // Reaction added
  }
}
