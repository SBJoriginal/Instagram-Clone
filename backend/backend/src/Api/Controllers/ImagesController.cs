using System.Security.Claims;
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

    public ImagesController(IImageService imageService, ILogger<ImagesController> logger)
    {
      _imageService = imageService;
      _logger = logger;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Upload([FromForm] ImageUploadRequestDto upload)
    {
      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(userId))
        return Unauthorized();

      var result = await _imageService.UploadImageAsync(upload, userId);
      return CreatedAtAction(nameof(GetImages), new { id = result.Id }, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetImages([FromQuery] int page = 1, [FromQuery] int limit = 15)
    {
      var images = await _imageService.GetAllImagesAsync();
      return Ok(images);
    }

    [Authorize]
    [HttpGet("my-images")]
    public async Task<IActionResult> GetMyImages()
    {
      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(userId))
        return Unauthorized();

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
      var images = await _imageService.GetImagesByUsernameAsync(username);
      return Ok(images);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetImageById(int id)
    {
      var result = await _imageService.GetImageByIdAsync(id);

      if (result == null)
        return NotFound();

      return Ok(result);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ImageUpdateDto update)
    {
      var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(currentUserId))
        return Unauthorized();

      var result = await _imageService.UpdateImageAsync(id, update, currentUserId);
      if (result == null)
        return NotFound();
      return Ok(result);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
      var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(currentUserId))
        return Unauthorized();

      var result = await _imageService.DeleteImageAsync(id, currentUserId);
      if (result == null)
        return NotFound();
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
