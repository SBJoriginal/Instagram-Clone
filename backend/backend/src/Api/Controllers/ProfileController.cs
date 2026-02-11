using backend.src.Application.DTOs;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    private readonly AppDbContext _context;

    public ProfileController(IUserProfileService userProfileService, AppDbContext context)
    {
      _userProfileService = userProfileService;
      _context = context;
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
      var profiles = await _context.UserProfiles
          .Select(p => new UserProfileResponseDto
          {
            Id = p.UserId,
            UserName = p.UserName,
            FirstName = p.FirstName,
            LastName = p.LastName,
            Email = p.Email,
            PhoneNumber = p.PhoneNumber,
            SignUpDate = p.SignUpDate,
            ProfilePictureUrl = p.ProfilePictureUrl
          })
          .ToListAsync();

      return Ok(profiles);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserProfileResponseDto>> GetProfileById(string id)
    {
      var profile = await _context.UserProfiles
          .FirstOrDefaultAsync(p => p.UserId == id);

      if (profile == null)
      {
        return NotFound();
      }

      var profileDto = new UserProfileResponseDto
      {
        Id = profile.UserId,
        UserName = profile.UserName,
        FirstName = profile.FirstName,
        LastName = profile.LastName,
        Email = profile.Email,
        PhoneNumber = profile.PhoneNumber,
        SignUpDate = profile.SignUpDate,
        ProfilePictureUrl = profile.ProfilePictureUrl
      };

      return Ok(profileDto);
    }

    [HttpGet("{id}/images")]
    public async Task<ActionResult<List<ImageResponseDto>>> GetProfileImages(string id)
    {
      var profile = await _context.UserProfiles
          .FirstOrDefaultAsync(p => p.UserId == id);

      if (profile == null)
      {
        return NotFound();
      }

      var images = await _context.Images
          .Where(img => img.UserId == id)
          .Select(img => new ImageResponseDto
          {
            Id = img.Id,
            FileName = img.FileName,
            ContentType = img.ContentType,
            Size = img.Size,
            Description = img.Description,
            Hashtags = img.Hashtags,
            Mentions = img.Mentions,
            FilePath = img.FilePath,
            CreatedAt = img.CreatedAt
          })
          .ToListAsync();

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
