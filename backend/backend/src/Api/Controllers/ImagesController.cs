
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Domain.Entities;
using Infrastructure.Persistence;

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
    public async Task<IActionResult> GetImages()
    {
      var images = await _context.Images.OrderByDescending(i => i.CreatedAt).ToListAsync();
      return Ok(images);
    }
  }

  public class ImageUploadDto
  {
    public required IFormFile File { get; set; }
    public string? Description { get; set; }
    public string? Hashtags { get; set; }
    public string? Mentions { get; set; }
  }
}
