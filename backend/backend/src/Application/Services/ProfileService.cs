using backend.src.Domain.Entities;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;
using UGram.src.Domain.Exceptions;
using UGram.src.Domain.Exceptions.Users;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.ComponentModel.DataAnnotations;
using UGram.src.Application.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using Microsoft.AspNetCore.Http;

namespace UGram.src.Application.Services
{
  public class ProfileService : IUserProfileService
  {
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;
    private readonly IImageStorageService _imageStorageService;
    private readonly FileUploadSettings _fileUploadSettings;
    private readonly ILogger<ProfileService> _logger;

    public ProfileService(
      UserManager<ApplicationUser> userManager,
      AppDbContext context,
      IImageStorageService imageStorageService,
      IOptions<FileUploadSettings> fileUploadSettings,
      ILogger<ProfileService> logger)
    {
      _userManager = userManager;
      _context = context;
      _imageStorageService = imageStorageService;
      _fileUploadSettings = fileUploadSettings.Value;
      _logger = logger;
    }

    public async Task<UserProfileResponseDto?> GetUserProfileAsync(string userId)
    {
      await VerifyUserExistence(userId);
      var userProfile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

      if (userProfile == null)
      {
        return null;
      }

      var userProfileDto = new UserProfileResponseDto
      {
        Id = userProfile.UserId,
        UserName = userProfile.UserName,
        FirstName = userProfile.FirstName,
        LastName = userProfile.LastName,
        Email = userProfile.Email,
        PhoneNumber = userProfile.PhoneNumber,
        SignUpDate = userProfile.SignUpDate,
        ProfilePictureUrl = await _imageStorageService.GetImageUrlAsync(userProfile.ProfilePictureUrl ?? string.Empty)
      };

      return userProfileDto;
    }

    public async Task<List<UserProfileResponseDto>> GetAllProfilesAsync()
    {
      var dbProfiles = await _context.UserProfiles.ToListAsync();
      var profiles = await Task.WhenAll(dbProfiles.Select(async p => new UserProfileResponseDto
      {
        Id = p.UserId,
        UserName = p.UserName,
        FirstName = p.FirstName,
        LastName = p.LastName,
        Email = p.Email,
        PhoneNumber = p.PhoneNumber,
        SignUpDate = p.SignUpDate,
        ProfilePictureUrl = await _imageStorageService.GetImageUrlAsync(p.ProfilePictureUrl ?? string.Empty)
      }));

      return profiles.ToList();
    }

    public async Task<UserProfileResponseDto?> GetProfileByIdAsync(string userId)
    {
      var profile = await _context.UserProfiles
          .FirstOrDefaultAsync(p => p.UserId == userId);

      if (profile == null)
      {
        return null;
      }

      return new UserProfileResponseDto
      {
        Id = profile.UserId,
        UserName = profile.UserName,
        FirstName = profile.FirstName,
        LastName = profile.LastName,
        Email = profile.Email,
        PhoneNumber = profile.PhoneNumber,
        SignUpDate = profile.SignUpDate,
        ProfilePictureUrl = await _imageStorageService.GetImageUrlAsync(profile.ProfilePictureUrl ?? string.Empty)
      };
    }

    public async Task<UserProfileResponseDto?> GetProfileByUsernameAsync(string username)
    {
      var user = await _userManager.Users
        .FirstOrDefaultAsync(u => u.UserName == username);

      if (user == null) return null;

      var profile = await _context.UserProfiles
          .FirstOrDefaultAsync(p => p.UserId == user.Id);

      if (profile == null)
      {
        return null;
      }

      return new UserProfileResponseDto
      {
        Id = profile.UserId,
        UserName = user.UserName!,
        FirstName = profile.FirstName,
        LastName = profile.LastName,
        Email = profile.Email,
        PhoneNumber = profile.PhoneNumber,
        SignUpDate = profile.SignUpDate,
        ProfilePictureUrl = await _imageStorageService.GetImageUrlAsync(profile.ProfilePictureUrl ?? string.Empty)
      };
    }

    public async Task<List<ImageResponseDto>> GetProfileImagesAsync(string userId)
    {
      var dbImages = await _context.Images
          .Where(img => img.UserId == userId && !img.Description.EndsWith("has changed their profile picture"))
          .ToListAsync();

      var images = await Task.WhenAll(dbImages.Select(async img => new ImageResponseDto
      {
        Id = img.Id,
        FileName = img.FileName,
        ContentType = img.ContentType,
        Size = img.Size,
        Description = img.Description,
        Hashtags = img.Hashtags,
        Mentions = img.Mentions,
        FilePath = await _imageStorageService.GetImageUrlAsync(img.FilePath),
        CreatedAt = img.CreatedAt
      }));

      return images.ToList();
    }

    public async Task CompleteProfileAsync(string userId, UserProfileRequestDto userProfileDto, string requesterUserId)
    {
      if (userId != requesterUserId)
      {
        throw new UnauthorizedAccessException("Broken Access Control: Unauthorized attempt to complete profile.");
      }

      ApplicationUser user = await GetUserById(userId);
      await VerifyProfileDoesntExist(userId);

      user.UserName = userProfileDto.UserName;
      var result = await _userManager.UpdateAsync(user);
      if (!result.Succeeded)
      {
        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
        _logger.LogWarning("Failed to update username for user {UserId}. Errors: {Errors}", userId, errors);
        throw new ValidationException($"Username error: {errors}");
      }

      var newProfile = new UserProfile
      {
        UserId = userId,
        UserName = userProfileDto.UserName,
        FirstName = userProfileDto.FirstName,
        LastName = userProfileDto.LastName,
        Email = user.Email!,
        PhoneNumber = userProfileDto.PhoneNumber
      };

      _context.UserProfiles.Add(newProfile);

      await _context.SaveChangesAsync();
      _logger.LogInformation("Profile completed for user {UserId} with username {UserName}", userId, userProfileDto.UserName);
    }

    public async Task<ProfilePictureResponseDto> UploadProfilePictureAsync(string userId, IFormFile file, string requesterUserId)
    {

      if (userId != requesterUserId)
      {
        throw new UnauthorizedAccessException("Broken Access Control: Unauthorized attempt to change profile picture.");
      }
      await VerifyUserExistence(userId);
      UserProfile userProfile = GetUserProfile(userId);

      ValidateImageFile(file);
      _logger.LogInformation("Uploading profile picture for user {UserId}", userId);

      using var inputStream = file.OpenReadStream();
      using var outputStream = new MemoryStream();
      using (var imageProcessor = await SixLabors.ImageSharp.Image.LoadAsync(inputStream))
      {
        int maxWidth = 1000;
        int maxHeight = 1000;
        if (imageProcessor.Width > maxWidth || imageProcessor.Height > maxHeight)
        {
          imageProcessor.Mutate(x => x.Resize(new SixLabors.ImageSharp.Processing.ResizeOptions
          {
            Size = new SixLabors.ImageSharp.Size(maxWidth, maxHeight),
            Mode = SixLabors.ImageSharp.Processing.ResizeMode.Max
          }));
        }
        await imageProcessor.SaveAsJpegAsync(outputStream, new SixLabors.ImageSharp.Formats.Jpeg.JpegEncoder { Quality = 80 });
      }
      outputStream.Position = 0;
      var filteredFile = new FormFile(outputStream, 0, outputStream.Length, file.Name, file.FileName)
      {
        Headers = file.Headers,
        ContentType = "image/jpeg"
      };

      string imagePath = await _imageStorageService.SaveImageAsync(filteredFile, "images");

      if (!string.IsNullOrEmpty(userProfile.ProfilePictureUrl))
      {
        await _imageStorageService.DeleteImageAsync(userProfile.ProfilePictureUrl);

        var oldImage = await _context.Images
          .FirstOrDefaultAsync(i => i.FilePath == userProfile.ProfilePictureUrl && i.UserId == userId);

        if (oldImage != null)
        {
          _context.Images.Remove(oldImage);
        }
      }

      userProfile.ProfilePictureUrl = imagePath;

      var image = new global::Domain.Entities.Image
      {
        FileName = Path.GetFileName(imagePath),
        ContentType = file.ContentType,
        Size = file.Length,
        FilePath = imagePath,
        CreatedAt = DateTime.UtcNow,
        UserId = userId,
        Description = $"{userProfile.UserName} has changed their profile picture"
      };

      _context.Images.Add(image);
      await _context.SaveChangesAsync();
      _logger.LogInformation("Profile picture successfully updated for user {UserId}. New path: {ImagePath}", userId, imagePath);

      return new ProfilePictureResponseDto
      {
        ProfilePictureUrl = await _imageStorageService.GetImageUrlAsync(imagePath),
        ImageId = image.Id
      };
    }

    public async Task DeleteProfilePictureAsync(string userId, string requesterUserId)
    {
      if (userId != requesterUserId)
      {
        throw new UnauthorizedAccessException("Broken Access Control: Unauthorized attempt to delete profile picture.");
      }

      await VerifyUserExistence(userId);
      UserProfile userProfile = GetUserProfile(userId);

      if (string.IsNullOrEmpty(userProfile.ProfilePictureUrl))
      {
        throw new NotFoundException("Profile Picture", userId);
      }

      await _imageStorageService.DeleteImageAsync(userProfile.ProfilePictureUrl);

      var image = await _context.Images
        .FirstOrDefaultAsync(i => i.FilePath == userProfile.ProfilePictureUrl && i.UserId == userId);

      if (image != null)
      {
        _context.Images.Remove(image);
      }

      userProfile.ProfilePictureUrl = null;

      await _context.SaveChangesAsync();
    }

    public async Task UpdateProfileAsync(string userIdToUpdate, UserProfileRequestDto userProfileDto, string requesterUserId)
    {

      if (userIdToUpdate != requesterUserId)
      {
        throw new UnauthorizedAccessException("Broken Access Control: You are not authorized to update this profile.");
      }

      ApplicationUser user = await GetUserById(userIdToUpdate);
      await VerifyUserExistence(userIdToUpdate);
      UserProfile userProfile = GetUserProfile(userIdToUpdate);

      if (!string.IsNullOrEmpty(userProfileDto.UserName) && user.UserName != userProfileDto.UserName)
      {
        user.UserName = userProfileDto.UserName;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
          var errors = string.Join(", ", result.Errors.Select(e => e.Description));
          throw new ValidationException($"Username error: {errors}");
        }
      }

      if (!string.IsNullOrEmpty(userProfileDto.Email) && user.Email != userProfileDto.Email)
      {
        var existingUser = await _userManager.FindByEmailAsync(userProfileDto.Email);
        if (existingUser != null && existingUser.Id != userIdToUpdate)
        {
          throw new ValidationException($"Email error: Email '{userProfileDto.Email}' is already taken.");
        }

        user.Email = userProfileDto.Email;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
          var errors = string.Join(", ", result.Errors.Select(e => e.Description));
          throw new ValidationException($"Email error: {errors}");
        }
      }

      userProfile.UserName = userProfileDto.UserName;
      userProfile.FirstName = userProfileDto.FirstName;
      userProfile.LastName = userProfileDto.LastName;
      userProfile.Email = userProfileDto.Email;
      userProfile.PhoneNumber = userProfileDto.PhoneNumber;

      await _context.SaveChangesAsync();
    }

    public async Task<bool> UsernameExistsAsync(string username)
    {
      return await _userManager.Users
          .AnyAsync(u => u.NormalizedUserName == username.ToUpper());
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
      return await _userManager.Users
          .AnyAsync(u => u.NormalizedEmail == email.ToUpper());
    }

    private void ValidateImageFile(IFormFile file)
    {
      var maxFileSize = _fileUploadSettings.MaxFileSizeInMB * 1024 * 1024;
      var allowedExtensions = _fileUploadSettings.AllowedImageExtensions;

      if (file == null || file.Length == 0)
      {
        throw new ArgumentException("File is empty or null.", nameof(file));
      }

      if (file.Length > maxFileSize)
      {
        throw new ArgumentException(
            $"File size exceeds maximum limit of {_fileUploadSettings.MaxFileSizeInMB} MB.",
            nameof(file));
      }

      var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
      if (!allowedExtensions.Contains(fileExtension))
      {
        throw new ArgumentException(
            $"File type '{fileExtension}' is not allowed.",
            nameof(file));
      }

      if (!VerifyMagicBytes(file, fileExtension))
      {
        throw new ArgumentException("File content does not match the expected format.", nameof(file));
      }
    }

    private bool VerifyMagicBytes(IFormFile file, string fileExtension)
    {
      var magicBytesDict = new Dictionary<string, byte[]>
      {
        { ".jpg", new byte[] { 0xFF, 0xD8, 0xFF } },
        { ".jpeg", new byte[] { 0xFF, 0xD8, 0xFF } },
        { ".png", new byte[] { 0x89, 0x50, 0x4E, 0x47 } },
        { ".gif", new byte[] { 0x47, 0x49, 0x46, 0x38 } },
        {".webp", new byte[] { 0x52, 0x49, 0x46, 0x46 } },
        { ".avif", new byte[] { 0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66 } }
      };

      if (!magicBytesDict.TryGetValue(fileExtension.ToLower(), out var expectedMagicBytes))
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
    private async Task VerifyUserExistence(string userId)
    {
      var user = await _userManager.FindByIdAsync(userId);

      if (user == null)
      {
        throw new NotFoundException("User", userId);
      }
    }

    private UserProfile GetUserProfile(string userId)
    {
      var userProfile = _context.UserProfiles.Where(p => p.UserId == userId).FirstOrDefault();

      if (userProfile == null)
      {
        throw new NotFoundException("Profile", userId);
      }
      return userProfile;
    }

    private async Task VerifyProfileDoesntExist(string userId)
    {
      var profileExists = await _context.UserProfiles.AnyAsync(p => p.UserId == userId);

      if (profileExists)
      {
        throw new UserProfileAlreadyExistsException(userId);
      }
    }

    private async Task<ApplicationUser> GetUserById(string userId)
    {
      var user = await _userManager.FindByIdAsync(userId);

      if (user == null)
      {
        throw new NotFoundException("User", userId);
      }

      return user;
    }

    public async Task<IEnumerable<string>> GetUsernameAutocompleteAsync(string query)
    {
      var queryLower = query.ToLower();

      var usernames = await _context.UserProfiles
          .Where(p => p.UserName.ToLower().Contains(queryLower) ||
                      (p.FirstName != null && p.FirstName.ToLower().Contains(queryLower)) ||
                      (p.LastName != null && p.LastName.ToLower().Contains(queryLower)))
          .OrderBy(p => p.UserName)
          .Select(p => p.UserName)
          .Distinct()
          .Take(10)
          .ToListAsync();

      return usernames;
    }

  }
}
