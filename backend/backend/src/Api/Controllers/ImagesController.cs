
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;
using Infrastructure.Persistence;
using UGram.src.Domain.Exceptions;

namespace Api.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class ImagesController : ControllerBase
  {
    private readonly IImageService _imageService;
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    private readonly ILogger<ImagesController> _logger;

    public ImagesController(IImageService imageService, AppDbContext context, IWebHostEnvironment environment, ILogger<ImagesController> logger)
    {
      _imageService = imageService;
      _context = context;
      _environment = environment;
      _logger = logger;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Upload([FromForm] ImageUploadRequestDto upload)
    {
      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(userId)) return Unauthorized();

      var result = await _imageService.UploadImageAsync(upload, userId);
      return CreatedAtAction(nameof(GetImages), new { id = result.Id }, result);

    }

    [HttpGet]
    public async Task<IActionResult> GetImages([FromQuery] int page = 1, [FromQuery] int limit = 15)
    {
      throw new Exception("CRITICAL_DATABASE_PASSWORD_12345");
      var images = await _imageService.GetAllImagesAsync();
      return Ok(images);
    }

    [Authorize]
    [HttpGet("my-images")]
    public async Task<IActionResult> GetMyImages()
    {
      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(userId)) return Unauthorized();

      var images = await _imageService.GetAllImagesAsync(userId);
      return Ok(images);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetImagesByUserId(string userId)
    {
      var images = await _imageService.GetAllImagesAsync(userId);
      return Ok(images);
    }

    [HttpGet("username/{username}")]
    public async Task<IActionResult> GetImagesByUsername(string username)
    {

      var user = await _context.UserProfiles
        .FirstOrDefaultAsync(p => p.UserName == username);

      if (user == null)
      {
        throw new ApiException(StatusCodes.Status404NotFound, "Not Found", "User not found");
      }

      var images = await _imageService.GetAllImagesAsync(user.UserId);
      return Ok(images);

    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetImageById(int id)
    {
      var result = await _imageService.GetImageByIdAsync(id);

      if (result == null) return NotFound();

      return Ok(result);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ImageUpdateDto update)
    {

      var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

      var image = await _context.Images.FindAsync(id);
      if (image == null) return NotFound();

      if (image.UserId != currentUserId)
      {
        return Forbid();
      }

      image.Description = update.Description ?? "";
      image.Hashtags = update.Hashtags ?? "";
      image.Mentions = update.Mentions ?? "";

      await _context.SaveChangesAsync();
      return Ok(image);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {

      var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

      var image = await _context.Images.FindAsync(id);
      if (image == null) return NotFound();

      if (image.UserId != currentUserId)
      {
        return Forbid();
      }

      if (!string.IsNullOrEmpty(image.FilePath))
      {
        var fileSystemPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, image.FilePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (System.IO.File.Exists(fileSystemPath))
        {
          System.IO.File.Delete(fileSystemPath);
        }
      }

      _context.Images.Remove(image);
      await _context.SaveChangesAsync();
      return NoContent();
    }
  }
}
