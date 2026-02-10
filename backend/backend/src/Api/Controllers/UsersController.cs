using backend.Application.DTOs;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
  private readonly AppDbContext _context;

  public UsersController(AppDbContext context)
  {
    _context = context;
  }

  [HttpGet]
  public async Task<ActionResult<List<UserDto>>> GetAllUsers()
  {
    var users = await _context.UserProfiles
        .Include(p => p.User)
        .Select(p => new UserDto
        {
          Id = p.UserId,
          Username = p.User.UserName ?? "",
          FirstName = p.FirstName,
          LastName = p.LastName,
          Email = p.Email,
          PhoneNumber = p.PhoneNumber,
          ProfilePictureUrl = p.ProfilePictureUrl ?? "",
          RegistrationDate = p.SignUpDate.ToString("yyyy-MM-dd"),
        })
        .ToListAsync();

    return Ok(users);
  }

  [HttpGet("{id}")]
  public async Task<ActionResult<UserDto>> GetUserById(string id)
  {
    var profile = await _context.UserProfiles
        .Include(p => p.User)
        .FirstOrDefaultAsync(p => p.UserId == id);

    if (profile == null)
    {
      return NotFound();
    }

    var userDto = new UserDto
    {
      Id = profile.UserId,
      Username = profile.User.UserName ?? "",
      FirstName = profile.FirstName,
      LastName = profile.LastName,
      Email = profile.Email,
      PhoneNumber = profile.PhoneNumber,
      ProfilePictureUrl = profile.ProfilePictureUrl ?? "",
      RegistrationDate = profile.SignUpDate.ToString("yyyy-MM-dd"),
    };

    return Ok(userDto);
  }

  [HttpGet("{id}/images")]
  public async Task<ActionResult<List<ImagePostDto>>> GetUserImages(string id)
  {
    var profile = await _context.UserProfiles
        .FirstOrDefaultAsync(p => p.UserId == id);

    if (profile == null)
    {
      return NotFound();
    }

    var images = await _context.Images
        .Where(img => img.UserId == id)
        .Select(img => new ImagePostDto
        {
          Id = img.Id,
          UserId = img.UserId,
          ImageUrl = img.FilePath,
          Description = img.Description,
          Hashtags = string.IsNullOrEmpty(img.Hashtags)
              ? new List<string>()
              : img.Hashtags.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList(),
          MentionedUser = img.Mentions,
          CreatedAt = img.CreatedAt.ToString("yyyy-MM-dd"),
        })
        .ToListAsync();

    return Ok(images);
  }
}
