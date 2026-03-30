using System.Security.Claims;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;

namespace Api.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class ImagesController : ControllerBase
  {
    private readonly IImageService _imageService;
    private readonly ILogger<ImagesController> _logger;
    private readonly IAnalyticsService _analyticsService;

    public ImagesController(IImageService imageService, ILogger<ImagesController> logger, IAnalyticsService analyticsService)
    {
      _imageService = imageService;
      _logger = logger;
      _analyticsService = analyticsService;
    }

    [Authorize]
    [HttpPost]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> Upload([FromForm] ImageUploadRequestDto upload)
    {
      _logger.LogInformation("Received upload request in ImagesController");
      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(userId))
        return Unauthorized();

      var result = await _imageService.UploadImageAsync(upload, userId);
      await _analyticsService.TrackEventAsync("photo_uploaded");
      return CreatedAtAction(nameof(GetImages), new { id = result.Id }, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetImages([FromQuery] int page = 1, [FromQuery] int limit = 15)
    {
      var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      var images = await _imageService.GetAllImagesAsync(null, currentUserId);
      return Ok(images);
    }

    [Authorize]
    [HttpGet("my-images")]
    public async Task<IActionResult> GetMyImages()
    {
      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(userId))
        return Unauthorized();

      var images = await _imageService.GetAllImagesAsync(userId, userId);
      return Ok(images);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetImagesByUserId(string userId)
    {
      var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      var images = await _imageService.GetAllImagesAsync(userId, currentUserId);
      return Ok(images);
    }

    [HttpGet("username/{username}")]
    public async Task<IActionResult> GetImagesByUsername(string username)
    {
      var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      var images = await _imageService.GetImagesByUsernameAsync(username, currentUserId);
      return Ok(images);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetImageById(int id)
    {
      var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      var result = await _imageService.GetImageByIdAsync(id, currentUserId);

      if (result == null)
        return NotFound();

      return Ok(result);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ImageUpdateDto update)
    {
      _logger.LogInformation("Received update request for image {ImageId} in ImagesController", id);
      var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(currentUserId))
        return Unauthorized();

      var result = await _imageService.UpdateImageAsync(id, update, currentUserId);
      if (result == null)
        return NotFound();
      await _analyticsService.TrackEventAsync("photo_updated");
      return Ok(result);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
      _logger.LogInformation("Received delete request for image {ImageId} in ImagesController", id);
      var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(currentUserId))
        return Unauthorized();

      var result = await _imageService.DeleteImageAsync(id, currentUserId);
      if (result == null)
        return NotFound();
      await _analyticsService.TrackEventAsync("photo_deleted");
      return NoContent();
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchImages(
      [FromQuery] string filterType,
      [FromQuery] string query,
      [FromQuery] int page = 1,
      [FromQuery] int pageSize = 15
    )
    {
      var images = await _imageService.SearchImagesAsync(filterType, query, page, pageSize);
      return Ok(images);
    }

    [HttpGet("autocomplete")]
    public async Task<IActionResult> GetAutocomplete(
      [FromQuery] string filterType,
      [FromQuery] string query
    )
    {
      if (string.IsNullOrWhiteSpace(filterType) || string.IsNullOrWhiteSpace(query))
      {
        return BadRequest("filterType and query are required");
      }

      var suggestions = await _imageService.GetAutocompleteAsync(filterType, query);
      return Ok(suggestions);
    }
  }
}
