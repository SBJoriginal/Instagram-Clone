using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UGram.src.Application.Interfaces;

namespace backend.src.Api.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  [AllowAnonymous]
  public class HealthController : ControllerBase
  {
    private readonly IHealthService _healthService;

    public HealthController(IHealthService healthService)
    {
      _healthService = healthService;
    }

    [HttpGet("db")]
    public async Task<IActionResult> CheckDb()
    {
      var isConnected = await _healthService.CheckDatabaseConnectionAsync();
      if (isConnected)
      {
        return Ok(new { status = "Healthy", database = "Connected" });
      }
      return StatusCode(503, new { status = "Unhealthy", database = "Disconnected" });
    }
  }
}
