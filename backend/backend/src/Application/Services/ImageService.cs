using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;

namespace UGram.src.Application.Services
{
  public class ImageService : IImageService
  {
    private readonly AppDbContext _context;
    private readonly IImageStorageService _imageStorageService;

    public ImageService(AppDbContext context, IImageStorageService imageStorageService)
    {
      _context = context;
      _imageStorageService = imageStorageService;
    }

    public async Task<ImageUploadResponseDto> UploadImageAsync(IFormFile file, string description, string hashtags, string mentions, string userId)
    {
      if (file == null || file.Length == 0)
        throw new ArgumentException("No file uploaded.");

      var filePath = await _imageStorageService.SaveImageAsync(file, "images");

      var image = new Image
      {
        FileName = Path.GetFileName(file.FileName),
        ContentType = file.ContentType,
        Size = file.Length,
        Description = description ?? "",
        Hashtags = hashtags ?? "",
        Mentions = mentions ?? "",
        FilePath = filePath,
        UserId = userId,
        CreatedAt = DateTime.UtcNow
      };

      _context.Images.Add(image);
      await _context.SaveChangesAsync();

      return new ImageUploadResponseDto
      {
        Id = image.Id,
        FilePath = image.FilePath,
        Description = image.Description,
        UserId = image.UserId,
        CreatedAt = image.CreatedAt
      };
    }

    public async Task<IEnumerable<ImageResponseDto>> GetAllImagesAsync(string? userId = null)
    {
      var query = _context.Images.AsQueryable();

      if (!string.IsNullOrEmpty(userId))
      {
        query = query.Where(i => i.UserId == userId);
      }

      var images = await query
        .OrderByDescending(i => i.CreatedAt)
        .ToListAsync();

      return images.Select(i => new ImageResponseDto
      {
        Id = i.Id,
        FileName = i.FileName,
        ContentType = i.ContentType,
        Size = i.Size,
        Description = i.Description,
        Hashtags = i.Hashtags,
        Mentions = i.Mentions,
        FilePath = i.FilePath,
        UserId = i.UserId,//replaced with username when that is implemented
        CreatedAt = i.CreatedAt
      });
    }
  }
}
