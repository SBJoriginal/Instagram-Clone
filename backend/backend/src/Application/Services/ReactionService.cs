using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using UGram.src.Application.Interfaces;

namespace UGram.src.Application.Services;

using UGram.src.Application.DTOs;


public class ReactionService : IReactionService
{
  private readonly AppDbContext _context;
  private readonly INotificationService _notificationService;
  private readonly IImageStorageService _imageStorageService;

  public ReactionService(AppDbContext context, INotificationService notificationService, IImageStorageService imageStorageService)
  {
    _context = context;
    _notificationService = notificationService;
    _imageStorageService = imageStorageService;
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

  public async Task<List<UserProfileResponseDto>> GetUsersWhoReactedAsync(int imageId)
  {
    var reactions = await _context.Reactions
      .Where(r => r.ImageId == imageId)
      .Join(
        _context.UserProfiles,
        reaction => reaction.UserId,
        profile => profile.UserId,
        (reaction, profile) => profile
      )
      .ToListAsync();

    var userDtos = new List<UserProfileResponseDto>();
    foreach (var profile in reactions)
    {
      userDtos.Add(new UserProfileResponseDto
      {
        Id = profile.UserId,
        UserName = profile.UserName,
        ProfilePictureUrl = !string.IsNullOrEmpty(profile.ProfilePictureUrl)
          ? await _imageStorageService.GetImageUrlAsync(profile.ProfilePictureUrl)
          : null,
      });
    }

    return userDtos;
  }
}
