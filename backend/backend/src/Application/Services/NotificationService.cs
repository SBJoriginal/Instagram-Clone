using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using UGram.src.Api.Hubs;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;

namespace Application.Services
{
  public class NotificationService : INotificationService
  {
    private readonly AppDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IImageStorageService _imageStorageService;

    public NotificationService(
      AppDbContext context,
      IHubContext<NotificationHub> hubContext,
      IImageStorageService imageStorageService
    )
    {
      _context = context;
      _hubContext = hubContext;
      _imageStorageService = imageStorageService;
    }

    public async Task CreateNotificationAsync(
      string recipientUserId,
      string actorUserId,
      int imageId,
      string type
    )
    {
      // ne pas notifier si l'utilisateur réagit à sa propre publication
      if (recipientUserId == actorUserId)
        return;

      var notification = new Notification
      {
        RecipientUserId = recipientUserId,
        ActorUserId = actorUserId,
        ImageId = imageId,
        Type = type,
        IsRead = false,
        CreatedAt = DateTime.UtcNow,
      };

      _context.Notifications.Add(notification);
      await _context.SaveChangesAsync();

      var actorProfile = await _context
        .UserProfiles.Where(p => p.UserId == actorUserId)
        .Select(p => new { p.UserName, p.ProfilePictureUrl })
        .FirstOrDefaultAsync();

      var actionText = type == "Like" ? "liked" : "commented on";
      var dto = new NotificationDto
      {
        Id = notification.Id,
        ActorUsername = actorProfile?.UserName ?? "Unknown",
        ActorProfilePictureUrl = !string.IsNullOrEmpty(actorProfile?.ProfilePictureUrl)
          ? await _imageStorageService.GetImageUrlAsync(actorProfile.ProfilePictureUrl)
          : null,
        ImageId = imageId,
        Type = type,
        IsRead = false,
        CreatedAt = notification.CreatedAt,
        Message = $"{actorProfile?.UserName ?? "User"} {actionText} your post",
      };

      // envoi temps réel au destinataire
      await _hubContext.Clients.Group(recipientUserId).SendAsync("ReceiveNotification", dto);
    }

    public async Task<IEnumerable<NotificationDto>> GetNotificationsForUserAsync(string userId)
    {
      var notifications = await _context
        .Notifications.Where(n => n.RecipientUserId == userId)
        .OrderByDescending(n => n.CreatedAt)
        .Take(50)
        .ToListAsync();

      var result = new List<NotificationDto>();
      foreach (var n in notifications)
      {
        var actorProfile = await _context
          .UserProfiles.Where(p => p.UserId == n.ActorUserId)
          .Select(p => new { p.UserName, p.ProfilePictureUrl })
          .FirstOrDefaultAsync();

        var actionText = n.Type == "Like" ? "liked" : "commented on";
        result.Add(
          new NotificationDto
          {
            Id = n.Id,
            ActorUsername = actorProfile?.UserName ?? "Unknown",
            ActorProfilePictureUrl = !string.IsNullOrEmpty(actorProfile?.ProfilePictureUrl)
              ? await _imageStorageService.GetImageUrlAsync(actorProfile.ProfilePictureUrl)
              : null,
            ImageId = n.ImageId,
            Type = n.Type,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt,
            Message = $"{actorProfile?.UserName ?? "User"} {actionText} your post",
          }
        );
      }

      return result;
    }

    public async Task MarkAsReadAsync(int notificationId, string userId)
    {
      var notification = await _context.Notifications.FirstOrDefaultAsync(n =>
        n.Id == notificationId && n.RecipientUserId == userId
      );

      if (notification == null)
        return;

      notification.IsRead = true;
      await _context.SaveChangesAsync();
    }
  }
}
