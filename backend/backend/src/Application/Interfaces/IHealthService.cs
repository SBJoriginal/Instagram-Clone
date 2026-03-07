namespace UGram.src.Application.Interfaces
{
  public interface IHealthService
  {
    Task<bool> CheckDatabaseConnectionAsync();
  }
}
