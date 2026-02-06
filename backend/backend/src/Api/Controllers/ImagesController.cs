
using Microsoft.AspNetCore.Mvc;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;
using Domain.Entities;

namespace Api.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class ImagesController : ControllerBase
  {
    private readonly IImageService _imageService;
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public ImagesController(IImageService imageService, AppDbContext context, IWebHostEnvironment environment)
    {
      _imageService = imageService;
      _context = context;
      _environment = environment;
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
    public async Task<IActionResult> GetImages([FromQuery] int page = 1, [FromQuery] int limit = 15)
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

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ImageUpdateDto update)
    {
      var image = await _context.Images.FindAsync(id);
      if (image == null) return NotFound();

      image.Description = update.Description ?? "";
      image.Hashtags = update.Hashtags ?? "";
      image.Mentions = update.Mentions ?? "";

      await _context.SaveChangesAsync();
      return Ok(image);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
      var image = await _context.Images.FindAsync(id);
      if (image == null) return NotFound();

      // Delete file from disk
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
