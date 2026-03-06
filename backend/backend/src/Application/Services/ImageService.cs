using DomainImage = Domain.Entities.Image;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

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

    public async Task<ImageUploadResponseDto> UploadImageAsync(ImageUploadRequestDto upload, string userId)
    {

      if (upload.File == null || upload.File.Length == 0)
        throw new ArgumentException("No file uploaded.");

      var extension = Path.GetExtension(upload.File.FileName).ToLowerInvariant();
      if (!VerifyMagicBytes(upload.File, extension))
      {
        throw new ArgumentException("File content does not match the expected image format.", nameof(upload.File));
      }

      using var inputStream = upload.File.OpenReadStream();
      using var outputStream = new MemoryStream();
      
      using (var imageProcessor = await SixLabors.ImageSharp.Image.LoadAsync(inputStream))
      {
        // Resize if larger than 1920px in either dimension
        int maxWidth = 1920;
        int maxHeight = 1920;
        
        if (imageProcessor.Width > maxWidth || imageProcessor.Height > maxHeight)
        {
          imageProcessor.Mutate(x => x.Resize(new SixLabors.ImageSharp.Processing.ResizeOptions
          {
            Size = new SixLabors.ImageSharp.Size(maxWidth, maxHeight),
            Mode = SixLabors.ImageSharp.Processing.ResizeMode.Max
          }));
        }

        // Save with compression (80% quality)
        await imageProcessor.SaveAsJpegAsync(outputStream, new SixLabors.ImageSharp.Formats.Jpeg.JpegEncoder
        {
          Quality = 80
        });
      }

      outputStream.Position = 0;
      
      // Wrap the compressed stream back into an IFormFile-like structure for the storage service
      var compressedFile = new FormFile(outputStream, 0, outputStream.Length, upload.File.Name, upload.File.FileName)
      {
        Headers = upload.File.Headers,
        ContentType = "image/jpeg"
      };

      var filePath = await _imageStorageService.SaveImageAsync(compressedFile, "images");

      var image = new DomainImage
      {
        Description = upload.Description ?? "",
        Hashtags = upload.Hashtags ?? "",
        Mentions = upload.Mentions ?? "",
        FilePath = filePath,
        UserId = userId,
        CreatedAt = DateTime.UtcNow
      };

      _context.Images.Add(image);
      await _context.SaveChangesAsync();

      var profile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

      return new ImageUploadResponseDto
      {
        Id = image.Id,
        FilePath = await _imageStorageService.GetImageUrlAsync(image.FilePath),
        Description = image.Description,
        UserId = image.UserId,
        Username = profile?.UserName ?? string.Empty,
        CreatedAt = image.CreatedAt
      };
    }


    private bool VerifyMagicBytes(IFormFile file, string fileExtension)
    {
      var magicBytesDict = new Dictionary<string, byte[]>
      {
        { ".jpg", new byte[] { 0xFF, 0xD8, 0xFF } },
        { ".jpeg", new byte[] { 0xFF, 0xD8, 0xFF } },
        { ".png", new byte[] { 0x89, 0x50, 0x4E, 0x47 } },
        { ".gif", new byte[] { 0x47, 0x49, 0x46, 0x38 } },
        { ".webp", new byte[] { 0x52, 0x49, 0x46, 0x46 } }
      };

      if (!magicBytesDict.TryGetValue(fileExtension, out var expectedMagicBytes))
      {
        return false;
      }

      using var stream = file.OpenReadStream();
      using var reader = new BinaryReader(stream);

      var fileMagicBytes = reader.ReadBytes(expectedMagicBytes.Length);

      if (stream.CanSeek)
      {
        stream.Seek(0, SeekOrigin.Begin);
      }

      return fileMagicBytes.SequenceEqual(expectedMagicBytes);
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

      return await MapImagesToDto(images);
    }

    public async Task<IEnumerable<ImageResponseDto>> SearchImagesAsync(string filterType, string query, int page, int pageSize)
    {
      var queryable = _context.Images.AsQueryable();

      if (!string.IsNullOrWhiteSpace(query))
      {
        var lowerQuery = query.ToLower();

        if (filterType.Equals("description", StringComparison.OrdinalIgnoreCase))
        {
          queryable = queryable.Where(i => i.Description.ToLower().Contains(lowerQuery));
        }
        else if (filterType.Equals("hashtag", StringComparison.OrdinalIgnoreCase))
        {
          var hashtags = query.Split(' ', StringSplitOptions.RemoveEmptyEntries);

          foreach (var tag in hashtags)
          {
            var t = tag.ToLower();
            queryable = queryable.Where(i => i.Hashtags.ToLower().Contains(t));
          }
        }
      }

      var images = await queryable
          .OrderByDescending(i => i.CreatedAt)
          .Skip((page - 1) * pageSize)
          .Take(pageSize)
          .ToListAsync();

      return await MapImagesToDto(images);
    }

    public async Task<ImageResponseDto?> GetImageByIdAsync(int id)
    {
      var image = await _context.Images.FindAsync(id);
      if (image == null) return null;

      var profile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == image.UserId);

      return new ImageResponseDto
      {
        Id = image.Id,
        FileName = image.FileName,
        ContentType = image.ContentType,
        Size = image.Size,
        Description = image.Description,
        Hashtags = image.Hashtags,
        Mentions = image.Mentions,
        FilePath = await _imageStorageService.GetImageUrlAsync(image.FilePath),
        UserId = image.UserId,
        Username = profile?.UserName ?? string.Empty,
        CreatedAt = image.CreatedAt
      };
    }

    private async Task<IEnumerable<ImageResponseDto>> MapImagesToDto(IEnumerable<DomainImage> images)
    {
      var imagesList = images.ToList();

      // Get usernames
      var userIds = imagesList.Select(i => i.UserId).Distinct().ToList();
      var profiles = await _context.UserProfiles
        .Where(p => userIds.Contains(p.UserId))
        .ToDictionaryAsync(p => p.UserId, p => p.UserName);

      var imageResults = await Task.WhenAll(images.Select(async i => new ImageResponseDto
      {
        Id = i.Id,
        FileName = i.FileName,
        ContentType = i.ContentType,
        Size = i.Size,
        Description = i.Description,
        Hashtags = i.Hashtags,
        Mentions = i.Mentions,
        FilePath = await _imageStorageService.GetImageUrlAsync(i.FilePath),
        UserId = i.UserId,
        Username = profiles.ContainsKey(i.UserId) ? profiles[i.UserId] : string.Empty,
        CreatedAt = i.CreatedAt
      }));

      return imageResults;
    }

    public async Task<IEnumerable<string>> GetAutocompleteAsync(string filterType, string query)
    {
      var queryLower = query.ToLower();
      var suggestions = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

      var rawData = await _context.Images
          .Where(i => filterType == "hashtag"
              ? i.Hashtags.ToLower().Contains(queryLower)
              : i.Description.ToLower().Contains(queryLower))
          .Select(i => filterType == "hashtag" ? i.Hashtags : i.Description)
          .Take(100)
          .ToListAsync();

      foreach (var text in rawData)
      {
        if (string.IsNullOrEmpty(text)) continue;

        var parts = text.Split(new[] { ' ', ',', '#' }, StringSplitOptions.RemoveEmptyEntries);

        foreach (var part in parts)
        {
          if (part.Length <= 2 && filterType != "hashtag") continue;

          if (part.ToLower().Contains(queryLower))
          {
            var result = filterType == "hashtag" ? $"#{part.TrimStart('#')}" : part;
            suggestions.Add(result);
          }
        }
      }

      return suggestions.OrderBy(s => s).Take(15).ToList();
    }
  }
}
