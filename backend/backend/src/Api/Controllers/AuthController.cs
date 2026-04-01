using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;

namespace backend.src.Api.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class AuthController : ControllerBase
  {
    private readonly IAuthService _authService;
    private readonly IAnalyticsService _analyticsService;

    public AuthController(IAuthService authService, IAnalyticsService analyticsService)
    {
      _authService = authService;
      _analyticsService = analyticsService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
      var createdUser = await _authService.RegisterAsync(registerDto);
      await _analyticsService.TrackEventAsync("sign_up");
      return CreatedAtAction(nameof(Register), new { id = createdUser.Id }, createdUser);
    }

    [EnableRateLimiting("login")]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
      var loginResponse = await _authService.LoginAsync(loginDto);
      await _analyticsService.TrackEventAsync("login");
      return Ok(loginResponse);
    }

    [EnableRateLimiting("login")]
    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthDto googleAuthDto)
    {
      var loginResponse = await _authService.GoogleLoginAsync(googleAuthDto.IdToken);
      await _analyticsService.TrackEventAsync("login");
      return Ok(loginResponse);
    }

    [HttpPost("refresh")]
    public IActionResult RefreshTokenAsync([FromBody] RefreshTokenRequestDto request)
    {
      var authHeader = HttpContext.Request.Headers["Authorization"].ToString();
      var accessToken = authHeader.Replace("Bearer ", "");

      var response = _authService.RefreshToken(accessToken, request.RefreshToken);
      return Ok(response);
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
      await _analyticsService.TrackEventAsync("logout");
      return Ok(new { message = "Logout successful. Please discard your token." });
    }

    [HttpDelete("delete-account")]
    [Authorize]
    public async Task<IActionResult> DeleteAccount()
    {
      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

      if (string.IsNullOrEmpty(userId))
        return Unauthorized();

      await _authService.DeleteAccountAsync(userId);
      await _analyticsService.TrackEventAsync("account_deleted");
      return NoContent();
    }
  }
}
