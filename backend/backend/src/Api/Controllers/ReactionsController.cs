using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using UGram.src.Application.Interfaces;

namespace Api.Controllers;

[ApiController]
[Route("api/images/{imageId}/[controller]")]
public class ReactionsController : ControllerBase
{
  private readonly IReactionService _reactionService;
  private readonly IAnalyticsService _analyticsService;

  public ReactionsController(IReactionService reactionService, IAnalyticsService analyticsService)
  {
    _reactionService = reactionService;
    _analyticsService = analyticsService;
  }

  [Authorize]
  [EnableRateLimiting("InteractionPolicy")]
  [HttpPost]
  public async Task<IActionResult> Toggle(int imageId)
  {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId)) return Unauthorized();

    try
    {
      var isAdded = await _reactionService.ToggleReactionAsync(imageId, userId);
      if (isAdded)
        await _analyticsService.TrackEventAsync("reaction_added");
      return Ok(new { isReacted = isAdded });
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(ex.Message);
    }
  }
}
