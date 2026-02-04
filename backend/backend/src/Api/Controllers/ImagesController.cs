
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Domain.Entities;
using Infrastructure.Persistence;
using System.IO;

namespace Api.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class ImagesController : ControllerBase
  {
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public ImagesController(AppDbContext context, IWebHostEnvironment environment)
    {
      _context = context;
      _environment = environment;
    }

    [HttpPost]
    public async Task<IActionResult> Upload([FromForm] ImageUploadDto upload)
    {
      if (upload.File == null || upload.File.Length == 0)
        return BadRequest("No file uploaded.");

      // 1. Save file to disk
      var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads");
      if (!Directory.Exists(uploadsFolder))
        Directory.CreateDirectory(uploadsFolder);

      var uniqueFileName = Guid.NewGuid().ToString() + "_" + upload.File.FileName;
      var filePath = Path.Combine(uploadsFolder, uniqueFileName);

      using (var stream = new FileStream(filePath, FileMode.Create))
      {
        await upload.File.CopyToAsync(stream);
      }

      // 2. Save metadata to DB
      var image = new Image
      {
        FileName = uniqueFileName,
        ContentType = upload.File.ContentType,
        Size = upload.File.Length,
        Description = upload.Description ?? "",
        Hashtags = upload.Hashtags ?? "",
        Mentions = upload.Mentions ?? "",
        FilePath = "/uploads/" + uniqueFileName,
        CreatedAt = DateTime.UtcNow
      };

      _context.Images.Add(image);
      await _context.SaveChangesAsync();

      return Ok(new { image.Id, image.FilePath, image.Description });
    }

    [HttpGet]
    public async Task<IActionResult> GetImages([FromQuery] int page = 1, [FromQuery] int limit = 15)
    {
      var images = await _context.Images
        .OrderByDescending(i => i.CreatedAt)
        .Skip((page - 1) * limit)
        .Take(limit)
        .ToListAsync();

      return Ok(images);
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

  public class ImageUploadDto
  {
    public required IFormFile File { get; set; }
    public string? Description { get; set; }
    public string? Hashtags { get; set; }
    public string? Mentions { get; set; }
  }

  public class ImageUpdateDto
  {
    public string? Description { get; set; }
    public string? Hashtags { get; set; }
    public string? Mentions { get; set; }
  }
}
