using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using UGram.src.Application.Interfaces;

namespace UGram.src.Application.Services
{
  public class AnalyticsService : IAnalyticsService
  {
    private readonly HttpClient _httpClient;
    private readonly string _measurementId;
    private readonly string _apiSecret;
    private const string EndpointUrl = "https://www.google-analytics.com/mp/collect";

    public AnalyticsService(HttpClient httpClient, IConfiguration configuration)
    {
      _httpClient = httpClient;
      _measurementId = configuration["GoogleAnalytics:MeasurementId"] ?? string.Empty;
      _apiSecret = configuration["GoogleAnalytics:ApiSecret"] ?? string.Empty;
    }

    public async Task TrackEventAsync(string eventName)
    {
      if (string.IsNullOrEmpty(_measurementId) || string.IsNullOrEmpty(_apiSecret))
        return;

      var payload = new
      {
        client_id = "backend-server",
        events = new[] { new { name = eventName } },
      };

      var url = $"{EndpointUrl}?measurement_id={_measurementId}&api_secret={_apiSecret}";
      var content = new StringContent(
        JsonSerializer.Serialize(payload),
        Encoding.UTF8,
        "application/json"
      );

      await _httpClient.PostAsync(url, content);
    }
  }
}
