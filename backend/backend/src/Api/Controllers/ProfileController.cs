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

    [HttpPut("update-profile")]
    public async Task<IActionResult> UpdateUserProfile([FromBody] UserProfileRequestDto userProfileDto)
    {
      var userId = GetAuthenticatedUserId();
      await _userProfileService.UpdateProfileAsync(userId, userProfileDto);
      return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> GetUserProfile()
    {
      var userId = GetAuthenticatedUserId();
      return Ok(await _userProfileService.GetUserProfileAsync(userId));
    }

    [HttpPost("profile-picture")]
    public async Task<IActionResult> UploadProfilePicture([FromForm] ProfilePictureUploadDto uploadDto)
    {
      var userId = GetAuthenticatedUserId();
      var result = await _userProfileService.UploadProfilePictureAsync(userId, uploadDto.File);
      return Ok(result);
    }

    [HttpGet("all")]
    public async Task<ActionResult<List<UserProfileResponseDto>>> GetAllProfiles()
    {
      var profiles = await _userProfileService.GetAllProfilesAsync();
      return Ok(profiles);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserProfileResponseDto>> GetProfileById(string id)
    {
      var profile = await _userProfileService.GetProfileByIdAsync(id);
      if (profile == null)
      {
        return NotFound();
      }
      return Ok(profile);
    }

    [HttpGet("username/{username}")]
    public async Task<ActionResult<UserProfileResponseDto>> GetProfileByUsername(string username)
    {
      var profile = await _userProfileService.GetProfileByUsernameAsync(username);
      if (profile == null)
      {
        return NotFound();
      }
      return Ok(profile);
    }

    [HttpGet("{id}/images")]
    public async Task<ActionResult<List<ImageResponseDto>>> GetProfileImages(string id)
    {
      var profile = await _userProfileService.GetProfileByIdAsync(id);
      if (profile == null)
      {
        return NotFound();
      }
      var images = await _userProfileService.GetProfileImagesAsync(id);
      return Ok(images);
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
