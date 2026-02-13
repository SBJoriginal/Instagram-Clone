using backend.src.Application.DTOs;
using backend.src.Domain.Entities;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;
using UGram.src.Domain.Exceptions;
using UGram.src.Domain.Exceptions.Users;
using Microsoft.Extensions.Options;
using UGram.src.Application.Configuration;
using System.ComponentModel.DataAnnotations;

namespace UGram.src.Application.Services
{
  public class ProfileService : IUserProfileService
  {
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;
    private readonly IImageStorageService _imageStorageService;
    private readonly FileUploadSettings _fileUploadSettings;

    public ProfileService(
      UserManager<ApplicationUser> userManager,
      AppDbContext context,
      IImageStorageService imageStorageService,
      IOptions<FileUploadSettings> fileUploadSettings)
    {
      _userManager = userManager;
      _context = context;
      _imageStorageService = imageStorageService;
      _fileUploadSettings = fileUploadSettings.Value;
    }

    public async Task<UserProfileResponseDto> GetUserProfileAsync(string userId)
    {
      await VerifyUserExistence(userId);
      UserProfile userProfile = GetUserProfile(userId);

      var userProfileDto = new UserProfileResponseDto
      {
        Id = userProfile.UserId,
        UserName = userProfile.UserName,
        FirstName = userProfile.FirstName,
        LastName = userProfile.LastName,
        Email = userProfile.Email,
        PhoneNumber = userProfile.PhoneNumber,
        SignUpDate = userProfile.SignUpDate,
        ProfilePictureUrl = userProfile.ProfilePictureUrl
      };

      return userProfileDto;
    }

    public async Task<List<UserProfileResponseDto>> GetAllProfilesAsync()
    {
      var profiles = await _context.UserProfiles
          .Select(p => new UserProfileResponseDto
          {
            Id = p.UserId,
            UserName = p.UserName,
            FirstName = p.FirstName,
            LastName = p.LastName,
            Email = p.Email,
            PhoneNumber = p.PhoneNumber,
            SignUpDate = p.SignUpDate,
            ProfilePictureUrl = p.ProfilePictureUrl
          })
          .ToListAsync();

      return profiles;
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
        ProfilePictureUrl = profile.ProfilePictureUrl
      };
    }

    public async Task<UserProfileResponseDto?> GetProfileByUsernameAsync(string username)
    {
      var profile = await _context.UserProfiles
          .FirstOrDefaultAsync(p => p.UserName == username);

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
        ProfilePictureUrl = profile.ProfilePictureUrl
      };
    }

    public async Task<List<ImageResponseDto>> GetProfileImagesAsync(string userId)
    {
      var images = await _context.Images
          .Where(img => img.UserId == userId && img.Description.EndsWith("has changed their profile picture"))
          .Select(img => new ImageResponseDto
          {
            Id = img.Id,
            FileName = img.FileName,
            ContentType = img.ContentType,
            Size = img.Size,
            Description = img.Description,
            Hashtags = img.Hashtags,
            Mentions = img.Mentions,
            FilePath = img.FilePath,
            CreatedAt = img.CreatedAt
          })
          .ToListAsync();

      return images;
    }

    public async Task CompleteProfileAsync(string userId, UserProfileRequestDto userProfileDto)
    {
      ApplicationUser user = await GetUserById(userId);
      await VerifyProfileDoesntExist(userId);

      var newProfile = new UserProfile
      {
        UserId = userId,
        UserName = userProfileDto.UserName,
        FirstName = userProfileDto.FirstName,
        LastName = userProfileDto.LastName,
        Email = user.Email ?? string.Empty,
        PhoneNumber = userProfileDto.PhoneNumber
      };

      _context.UserProfiles.Add(newProfile);

      await _context.SaveChangesAsync();
    }

    public async Task<ProfilePictureResponseDto> UploadProfilePictureAsync(string userId, IFormFile file)
    {
      await VerifyUserExistence(userId);
      UserProfile userProfile = GetUserProfile(userId);

      ValidateImageFile(file);

      // Save the new image
      string imagePath = await _imageStorageService.SaveImageAsync(file, "images");

      // Delete old profile picture if it exists
      if (!string.IsNullOrEmpty(userProfile.ProfilePictureUrl))
      {
        await _imageStorageService.DeleteImageAsync(userProfile.ProfilePictureUrl);

        // Delete old image record from database if it exists
        var oldImage = await _context.Images
          .FirstOrDefaultAsync(i => i.FilePath == userProfile.ProfilePictureUrl && i.UserId == userId);

        if (oldImage != null)
        {
          _context.Images.Remove(oldImage);
        }
      }

      // Update profile picture URL
      userProfile.ProfilePictureUrl = imagePath;

      // Create image record and associate with user
      var image = new Image
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

      return new ProfilePictureResponseDto
      {
        ProfilePictureUrl = imagePath,
        ImageId = image.Id
      };
    }

    public async Task DeleteProfilePictureAsync(string userId)
    {
      await VerifyUserExistence(userId);
      UserProfile userProfile = GetUserProfile(userId);

      if (string.IsNullOrEmpty(userProfile.ProfilePictureUrl))
      {
        throw new NotFoundException("Profile Picture", userId);
      }

      // Delete the image file
      await _imageStorageService.DeleteImageAsync(userProfile.ProfilePictureUrl);

      // Delete image record from database
      var image = await _context.Images
        .FirstOrDefaultAsync(i => i.FilePath == userProfile.ProfilePictureUrl && i.UserId == userId);

      if (image != null)
      {
        _context.Images.Remove(image);
      }

      // Clear profile picture URL
      userProfile.ProfilePictureUrl = null;

      await _context.SaveChangesAsync();
    }

    public async Task UpdateProfileAsync(string userId, UserProfileRequestDto userProfileDto)
    {
      ApplicationUser user = await GetUserById(userId);
      await VerifyUserExistence(userId);
      UserProfile userProfile = GetUserProfile(userId);

      if (!string.IsNullOrEmpty(userProfileDto.Email) && user.Email != userProfileDto.Email)
      {
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
  }
}
