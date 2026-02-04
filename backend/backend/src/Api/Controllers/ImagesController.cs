
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

    public ImagesController(IImageService imageService)
    {
      _imageService = imageService;
    }

    [HttpPost]
    public async Task<IActionResult> Upload([FromForm] ImageUploadRequestDto upload)
    {
      try
      {
        var result = await _imageService.UploadImageAsync(
          upload.File,
          upload.Description ?? "",
          upload.Hashtags ?? "",
          upload.Mentions ?? "");

        return CreatedAtAction(nameof(GetImages), new { id = result.Id }, result);
      }
      catch (ArgumentException ex)
      {
        return BadRequest(new { error = ex.Message });
      }
      catch (Exception ex)
      {
        return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
      }
    }

    [HttpGet]
    public async Task<IActionResult> GetImages()
    {
      try
      {
        var images = await _imageService.GetAllImagesAsync();
        return Ok(images);
      }
      catch (Exception ex)
      {
        return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
      }
    }
  }
}
