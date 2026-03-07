using Infrastructure.Persistence;
using UGram.src.Application.Interfaces;

namespace UGram.src.Application.Services
{
  public class HealthService : IHealthService
  {
    private readonly AppDbContext _context;

    public HealthService(AppDbContext context)
    {
      _context = context;
    }

    public async Task<bool> CheckDatabaseConnectionAsync()
    {
      try
      {
        return await _context.Database.CanConnectAsync();
      }
      catch
      {
        return false;
      }
    }
  }
}
