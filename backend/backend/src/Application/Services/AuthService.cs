using backend.src.Application.DTOs;
using backend.src.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;
using UGram.src.Domain.Exceptions.Users;

namespace UGram.src.Application.Services
{
  public class AuthService : IAuthService
  {
    private readonly UserManager<ApplicationUser> _userManager;
    public AuthService(UserManager<ApplicationUser> userManager)
    {
      _userManager = userManager;
    }

    public Task<UserDto> RegisterAsync(RegisterDto registerDto)
    {
      var existingUser = _userManager.FindByEmailAsync(registerDto.Email).Result;

      if (existingUser != null)
      {
        throw new UserAlreadyExistsException(registerDto.Email);
      }

      var newUser = new ApplicationUser
      {
        UserName = registerDto.Email,
        Email = registerDto.Email,
      };

      var result = _userManager.CreateAsync(newUser, registerDto.Password).Result;

      if (!result.Succeeded)
      {
        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
        throw new Exception($"User registration failed: {errors}");
      }
      var userDto = new UserDto
      {
        Id = int.Parse(newUser.Id),
        Email = newUser.Email
      };
      return Task.FromResult(userDto);
    }
  }
}
