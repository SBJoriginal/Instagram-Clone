using UGram.src.Application.DTOs;

namespace UGram.src.Application.Interfaces
{
  public interface IImageService
  {
    Task<ImageUploadResponseDto> UploadImageAsync(ImageUploadRequestDto upload, string userId);

    Task<IEnumerable<ImageResponseDto>> GetAllImagesAsync(string? userId = null);

    Task<ImageResponseDto?> GetImageByIdAsync(int id);
    Task<IEnumerable<ImageResponseDto>> SearchImagesAsync(string filterType, string query, int page, int pageSize);

  }
}
