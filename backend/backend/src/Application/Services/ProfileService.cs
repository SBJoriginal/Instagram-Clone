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

namespace UGram.src.Application.Services
{
  public class ProfileService : IUserProfileService
  {
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;
    private readonly IImageStorageService _imageStorageService;

    public ProfileService(
      UserManager<ApplicationUser> userManager,
      AppDbContext context,
      IImageStorageService imageStorageService)
    {
      _userManager = userManager;
      _context = context;
      _imageStorageService = imageStorageService;
    }

    public async Task<UserProfileResponseDto> GetUserProfileAsync(string userId)
    {
      ApplicationUser user = await GetUserById(userId);
      UserProfile userProfile = GetUserProfile(userId);

      var userProfileDto = new UserProfileResponseDto
      {
        Username = user.UserName ?? string.Empty,
        FirstName = userProfile.FirstName,
        LastName = userProfile.LastName,
        Email = userProfile.Email,
        PhoneNumber = userProfile.PhoneNumber,
        SignUpDate = userProfile.SignUpDate,
        ProfilePictureUrl = userProfile.ProfilePictureUrl
      };

      return userProfileDto;
    }

    public async Task CompleteProfileAsync(string userId, UserProfileRequestDto userProfileDto)
    {
      ApplicationUser user = await GetUserById(userId);
      await VerifyProfileDoesntExist(userId);

      user.UserName = userProfileDto.Username;
      await _userManager.UpdateAsync(user);

      var newProfile = new UserProfile
      {
        UserId = userId,
        FirstName = userProfileDto.FirstName,
        LastName = userProfileDto.LastName,
        Email = user.Email ?? string.Empty,
        PhoneNumber = userProfileDto.PhoneNumber
      };

      _context.UserProfiles.Add(newProfile);

      await _context.SaveChangesAsync();
    }

    public async Task UpdateProfileAsync(string userId, UserProfileRequestDto userProfileDto)
    {
      ApplicationUser user = await GetUserById(userId);
      UserProfile userProfile = GetUserProfile(userId);

      // Mettre à jour le nom d'utilisateur dans Identity
      if (!string.IsNullOrEmpty(userProfileDto.Username) && user.UserName != userProfileDto.Username)
      {
        user.UserName = userProfileDto.Username;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
          throw new Exception($"Failed to update username: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }
      }

      // Mettre à jour les autres champs dans UserProfile
      userProfile.FirstName = userProfileDto.FirstName;
      userProfile.LastName = userProfileDto.LastName;
      userProfile.PhoneNumber = userProfileDto.PhoneNumber;

      await _context.SaveChangesAsync();
    }

    public async Task<ProfilePictureResponseDto> UploadProfilePictureAsync(string userId, IFormFile file)
    {
      await VerifyUserExistence(userId);
      UserProfile userProfile = GetUserProfile(userId);

      ValidateImageFile(file);

      // Save the new image
      string imagePath = await _imageStorageService.SaveImageAsync(file, "profile-pictures");

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
        Description = "Profile Picture"
      };
      _context.Images.Add(image);
      await _context.SaveChangesAsync();

      return new ProfilePictureResponseDto
      {
        ProfilePictureUrl = imagePath,
        ImageId = image.Id
      };
    }

    public async Task<ProfilePictureResponseDto> GetProfilePictureAsync(string userId)
    {
      await VerifyUserExistence(userId);
      UserProfile userProfile = GetUserProfile(userId);

      if (string.IsNullOrEmpty(userProfile.ProfilePictureUrl))
      {
        throw new NotFoundException("Profile Picture", userId);
      }

      // Récupérer l'image depuis la base de données
      var image = await _context.Images
        .FirstOrDefaultAsync(i => i.FilePath == userProfile.ProfilePictureUrl && i.UserId == userId);

      if (image == null)
      {
        throw new NotFoundException("Profile Picture", userId);
      }

      return new ProfilePictureResponseDto
      {
        ProfilePictureUrl = userProfile.ProfilePictureUrl,
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

    private void ValidateImageFile(IFormFile file)
    {
      const long maxFileSize = 5 * 1024 * 1024; // 5 MB
      var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };

      if (file == null || file.Length == 0)
      {
        throw new ArgumentException("File is empty or null.", nameof(file));
      }

      if (file.Length > maxFileSize)
      {
        throw new ArgumentException($"File size exceeds maximum limit of {maxFileSize / (1024 * 1024)} MB.", nameof(file));
      }

      var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
      if (!allowedExtensions.Contains(fileExtension))
      {
        throw new ArgumentException($"File type '{fileExtension}' is not allowed.", nameof(file));
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
