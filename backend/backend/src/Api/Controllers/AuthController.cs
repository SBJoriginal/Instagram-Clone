using backend.src.Application.DTOs;
using Microsoft.AspNetCore.Mvc;
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
  }
}
