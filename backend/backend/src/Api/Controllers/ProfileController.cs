using backend.src.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;

namespace backend.src.Api.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  [Authorize]
  public class ProfileController : ControllerBase
  {
    private readonly IUserProfileService _userProfileService;

    public ProfileController(IUserProfileService userProfileService)
    {
      _userProfileService = userProfileService;
    }

    [HttpPost("complete-profile")]
    public async Task<IActionResult> CompleteUserProfile([FromBody] UserProfileRequestDto userProfileDto)
    {
      var userId = GetAuthenticatedUserId();
      await _userProfileService.CompleteProfileAsync(userId, userProfileDto);
      return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> GetUserProfile()
    {
      var userId = GetAuthenticatedUserId();
      return Ok(await _userProfileService.GetUserProfileAsync(userId));
    }

    private string GetAuthenticatedUserId()
    {
      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(userId))
      {
        throw new UnauthorizedAccessException("User ID claim not found.");
      }
      return userId;
    }
  }
}
