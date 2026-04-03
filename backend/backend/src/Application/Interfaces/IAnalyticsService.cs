namespace UGram.src.Application.Interfaces
{
  public interface IAnalyticsService
  {
    Task TrackEventAsync(string eventName);
  }
}
