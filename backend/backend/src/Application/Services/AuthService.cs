using backend.src.Application.DTOs;
using backend.src.Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;
using UGram.src.Domain.Exceptions.Users;

namespace UGram.src.Application.Services
{
  public class AuthService : IAuthService
  {
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;

    public AuthService(UserManager<ApplicationUser> userManager, ITokenService tokenService)
    {
      _userManager = userManager;
      _tokenService = tokenService;
    }

    public async Task<RegisterResponseDto> RegisterAsync(RegisterDto registerDto)
    {
      var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);

      if (existingUser != null)
      {
        throw new UserAlreadyExists(registerDto.Email);
      }

      var newUser = new ApplicationUser
      {
        UserName = registerDto.Email,
        Email = registerDto.Email,
      };

      await RegisterUserAsync(registerDto, newUser);

      var token = _tokenService.GenerateToken(newUser);

      var userDto = new RegisterResponseDto
      {
        Id = newUser.Id,
        Email = newUser.Email,
        Token = token
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
        RefreshToken = refreshToken
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
        RefreshToken = newRefreshToken
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
  }
}
