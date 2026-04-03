using UGram.src.Application.DTOs;

namespace Application.Interfaces
{
  public interface INotificationService
  {
    Task CreateNotificationAsync(
      string recipientUserId,
      string actorUserId,
      int imageId,
      string type
    );
    Task<IEnumerable<NotificationDto>> GetNotificationsForUserAsync(string userId);
    Task MarkAsReadAsync(int notificationId, string userId);
  }
}
