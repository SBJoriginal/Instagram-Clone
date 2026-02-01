using backend.src.Application.DTOs;
using backend.src.Domain.Entities;
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

    public ProfileService(UserManager<ApplicationUser> userManager, AppDbContext context)
    {
      _userManager = userManager;
      _context = context;
    }

    public async Task<UserProfileResponseDto> GetUserProfileAsync(string userId)
    {
      await VerifyUserExistence(userId);
      UserProfile userProfile = GetUserProfile(userId);

      var userProfileDto = new UserProfileResponseDto
      {
        FirstName = userProfile.FirstName,
        LastName = userProfile.LastName,
        Email = userProfile.Email,
        PhoneNumber = userProfile.PhoneNumber,
        SignUpDate = userProfile.SignUpDate
      };

      return userProfileDto;
    }

    public async Task CompleteProfileAsync(string userId, UserProfileRequestDto userProfileDto)
    {
      ApplicationUser user = await GetUserById(userId);
      await VerifyProfileDoesntExist(userId);

      var newProfile = new UserProfile
      {
        UserId = userId,
        FirstName = userProfileDto.FirstName,
        LastName = userProfileDto.LastName,
        Email = user.Email ?? string.Empty,
        PhoneNumber = userProfileDto.PhoneNumber,
        SignUpDate = DateTime.UtcNow
      };

      _context.UserProfiles.Add(newProfile);

      await _context.SaveChangesAsync();
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
        throw new UserProfileAlreadyExists(userId);
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
