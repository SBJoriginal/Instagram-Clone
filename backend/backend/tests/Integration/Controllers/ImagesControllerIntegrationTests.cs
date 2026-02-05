using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using UGram.Tests.Integration.Setup;
using UGram.src.Application.DTOs;
using Xunit;
using UGram.src.Application.Interfaces;

namespace UGram.Tests.Integration.Controllers
{
  public class ImagesControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory<Program>>
  {
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory<Program> _factory;

    public ImagesControllerIntegrationTests(CustomWebApplicationFactory<Program> factory)
    {
      _factory = factory;
      _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetImages_ReturnsOkResponse()
    {

      var response = await _client.GetAsync("/api/images");


      response.EnsureSuccessStatusCode();
      var responseString = await response.Content.ReadAsStringAsync();
      Assert.Contains("[]", responseString);
    }

  }
}
