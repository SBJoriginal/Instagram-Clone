using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;

namespace backend.src.Api.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class AuthController : ControllerBase
  {
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
      _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
      var createdUser = await _authService.RegisterAsync(registerDto);
      return CreatedAtAction(nameof(Register), new { id = createdUser.Id }, createdUser);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
      var loginResponse = await _authService.LoginAsync(loginDto);
      return Ok(loginResponse);
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthDto googleAuthDto)
    {
      var loginResponse = await _authService.GoogleLoginAsync(googleAuthDto.IdToken);
      return Ok(loginResponse);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshTokenAsync([FromBody] RefreshTokenRequestDto request)
    {
      var authHeader = HttpContext.Request.Headers["Authorization"].ToString();
      var accessToken = authHeader.Replace("Bearer ", "");

      var response = _authService.RefreshToken(accessToken, request.RefreshToken);
      return Ok(response);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
      return Ok(new { message = "Logout successful. Please discard your token." });
    }
  }
}
