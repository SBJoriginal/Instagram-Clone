using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UGram.src.Application.Interfaces;

namespace Api.Controllers;

[ApiController]
[Route("api/images/{imageId}/[controller]")]
public class ReactionsController : ControllerBase
{
    private readonly IReactionService _reactionService;

    public ReactionsController(IReactionService reactionService)
    {
        _reactionService = reactionService;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Toggle(int imageId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        try
        {
            var isAdded = await _reactionService.ToggleReactionAsync(imageId, userId);
            return Ok(new { isReacted = isAdded });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
