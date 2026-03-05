using System.Security.Claims;
using backend.src.Domain.Entities;
using Google.Apis.Auth;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;
using UGram.src.Domain.Exceptions.Users;

namespace UGram.src.Application.Services
{
  public class AuthService : IAuthService
  {
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly AppDbContext _context;
    private readonly IImageStorageService _imageStorageService;
    private readonly IConfiguration _configuration;

    public AuthService(
      UserManager<ApplicationUser> userManager,
      ITokenService tokenService,
      AppDbContext context,
      IImageStorageService imageStorageService,
      IConfiguration configuration
    )
    {
      _userManager = userManager;
      _tokenService = tokenService;
      _context = context;
      _imageStorageService = imageStorageService;
      _configuration = configuration;
    }

    public async Task<RegisterResponseDto> RegisterAsync(RegisterDto registerDto)
    {
      var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);

      if (existingUser != null)
      {
        throw new UserAlreadyExistsException(registerDto.Email);
      }

      var newUser = new ApplicationUser { UserName = registerDto.Email, Email = registerDto.Email };

      await RegisterUserAsync(registerDto, newUser);

      var token = _tokenService.GenerateToken(newUser);
      var refreshToken = _tokenService.GenerateRefreshToken();

      var userDto = new RegisterResponseDto
      {
        Id = newUser.Id,
        Email = newUser.Email,
        Token = token,
        RefreshToken = refreshToken,
      };
      return userDto;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginDto loginDto)
    {
      var user = await _userManager.FindByEmailAsync(loginDto.Email);

      if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
      {
        throw new UnauthorizedAccessException("Invalid email or password.");
      }

      var token = _tokenService.GenerateToken(user);
      var refreshToken = _tokenService.GenerateRefreshToken();

      return new LoginResponseDto
      {
        Id = user.Id,
        Email = user.Email ?? string.Empty,
        Token = token,
        RefreshToken = refreshToken,
      };
    }

    public async Task<LoginResponseDto> GoogleLoginAsync(string idToken)
    {
      var settings = new GoogleJsonWebSignature.ValidationSettings
      {
        Audience = new[] { _configuration["Google:ClientId"] },
      };

      GoogleJsonWebSignature.Payload payload;
      try
      {
        payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
      }
      catch (Exception ex)
      {
        throw new UnauthorizedAccessException("Invalid Google token.", ex);
      }

      var user = await _userManager.FindByEmailAsync(payload.Email);

      if (user == null)
      {
        user = new ApplicationUser
        {
          UserName = payload.Email,
          Email = payload.Email,
          EmailConfirmed = true, // Google emails are verified
        };

        var result = await _userManager.CreateAsync(user);
        if (!result.Succeeded)
        {
          var errors = string.Join(", ", result.Errors.Select(e => e.Description));
          throw new Exception($"User creation failed during Google login: {errors}");
        }
      }

      var token = _tokenService.GenerateToken(user);
      var refreshToken = _tokenService.GenerateRefreshToken();

      return new LoginResponseDto
      {
        Id = user.Id,
        Email = user.Email ?? string.Empty,
        Token = token,
        RefreshToken = refreshToken,
      };
    }

    public LoginResponseDto RefreshToken(string accessToken, string refreshToken)
    {
      var principal = _tokenService.GetPrincipalFromExpiredToken(accessToken);

      if (principal == null)
      {
        throw new UnauthorizedAccessException("Invalid access token.");
      }

      var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(userId))
      {
        throw new UnauthorizedAccessException("User ID claim not found in token.");
      }

      var newAccessToken = _tokenService.GenerateToken(new ApplicationUser { Id = userId });
      var newRefreshToken = _tokenService.GenerateRefreshToken();

      return new LoginResponseDto
      {
        Id = userId,
        Email = principal.FindFirstValue(ClaimTypes.Email) ?? string.Empty,
        Token = newAccessToken,
        RefreshToken = newRefreshToken,
      };
    }

    private async Task RegisterUserAsync(RegisterDto registerDto, ApplicationUser newUser)
    {
      var result = await _userManager.CreateAsync(newUser, registerDto.Password);

      if (!result.Succeeded)
      {
        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
        throw new Exception($"User registration failed: {errors}");
      }
    }

    public async Task DeleteAccountAsync(string userId)
    {
      var user = await _userManager.FindByIdAsync(userId);
      if (user == null)
        throw new Exception("User not found.");

      var userImages = await _context.Images.Where(i => i.UserId == userId).ToListAsync();

      foreach (var image in userImages)
      {
        await _imageStorageService.DeleteImageAsync(image.FilePath);
      }

      _context.Images.RemoveRange(userImages);

      var username =
        user.UserProfile?.UserName
        ?? (await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId))?.UserName;

      await _context.SaveChangesAsync();

      var result = await _userManager.DeleteAsync(user);
      if (!result.Succeeded)
      {
        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
        throw new Exception($"Failed to delete user account: {errors}");
      }
    }
  }
}
