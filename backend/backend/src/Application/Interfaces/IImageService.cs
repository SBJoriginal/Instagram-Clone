using Microsoft.AspNetCore.Http;
using UGram.src.Application.DTOs;

namespace UGram.src.Application.Interfaces
{
  public interface IImageService
  {
    Task<ImageUploadResponseDto> UploadImageAsync(IFormFile file, string description, string hashtags, string mentions, string userId);

    Task<IEnumerable<ImageResponseDto>> GetAllImagesAsync();

  }
}
