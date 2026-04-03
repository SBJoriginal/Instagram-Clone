using System.Security.Claims;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace UGram.src.Api.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  [Authorize]
  public class NotificationController : ControllerBase
  {
    private readonly INotificationService _notificationService;

    public NotificationController(INotificationService notificationService)
    {
      _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null)
        return Unauthorized();

      var notifications = await _notificationService.GetNotificationsForUserAsync(userId);
      return Ok(notifications);
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null)
        return Unauthorized();

      await _notificationService.MarkAsReadAsync(id, userId);
      return NoContent();
    }
  }
}
