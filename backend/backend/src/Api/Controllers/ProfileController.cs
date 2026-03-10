using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
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
      await _userProfileService.CompleteProfileAsync(userId, userProfileDto, userId);
      return NoContent();
    }

    [HttpPut]
    public async Task<IActionResult> UpdateUserProfile([FromBody] UserProfileRequestDto userProfileDto)
    {
      var userId = GetAuthenticatedUserId();
      await _userProfileService.UpdateProfileAsync(userId, userProfileDto, userId);
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
      var result = await _userProfileService.UploadProfilePictureAsync(userId, uploadDto.File, userId);
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
        return Ok(new UserProfileResponseDto { UserName = username, IsDeleted = true });
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

    [AllowAnonymous]
    [HttpGet("username-exists/{username}")]

    public async Task<ActionResult<bool>> CheckUsernameExists(string username)
    {
      var exists = await _userProfileService.UsernameExistsAsync(username);
      return Ok(exists);
    }

    [AllowAnonymous]
    [HttpGet("email-exists/{email}")]
    public async Task<ActionResult<bool>> CheckEmailExists(string email)
    {
      var exists = await _userProfileService.EmailExistsAsync(email);
      return Ok(exists);
    }

    [AllowAnonymous]
    [EnableRateLimiting("AutocompletePolicy")]
    [HttpGet("autocomplete")]
    public async Task<IActionResult> GetUsernameAutocomplete([FromQuery] string query)
    {
      if (string.IsNullOrWhiteSpace(query) || query.Length > 100)
      {
        return BadRequest("Invalid query length.");
      }

      var usernames = await _userProfileService.GetUsernameAutocompleteAsync(query);
      return Ok(usernames);
    }
  }
}
