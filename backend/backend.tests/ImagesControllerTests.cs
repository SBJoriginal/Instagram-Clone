using Api.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using System.Security.Claims;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;

namespace Backend.Tests
{
  public class ImagesControllerTests
  {
    private readonly Mock<IImageService> _mockImageService;
    private readonly ImagesController _controller;
    private const string TestUserId = "test-user-id";

    public ImagesControllerTests()
    {
      _mockImageService = new Mock<IImageService>();

      _controller = new ImagesController(
          _mockImageService.Object,
          new Mock<ILogger<ImagesController>>().Object,
          new Mock<IAnalyticsService>().Object);

      // Mock the User Claims to prevent NullReferenceException when checking ownership
      var claims = new List<Claim>
      {
          new Claim(ClaimTypes.NameIdentifier, TestUserId)
      };
      var identity = new ClaimsIdentity(claims, "TestAuth");
      var principal = new ClaimsPrincipal(identity);

      _controller.ControllerContext = new ControllerContext
      {
        HttpContext = new DefaultHttpContext { User = principal }
      };
    }

    [Fact]
    public async Task Update_ReturnsOk_WhenImageExists()
    {
      // Arrange
      var dto = new ImageUpdateDto { Description = "New", Hashtags = "#new", Mentions = "@new" };
      var responseDto = new ImageResponseDto
      {
        Id = 1,
        Description = "New",
        Hashtags = "#new",
        Mentions = "@new"
      };

      _mockImageService.Setup(s => s.UpdateImageAsync(1, It.IsAny<ImageUpdateDto>(), TestUserId))
          .ReturnsAsync(responseDto);

      // Act
      var result = await _controller.Update(1, dto);

      // Assert
      var okResult = Assert.IsType<OkObjectResult>(result);
      var returnedImage = Assert.IsType<ImageResponseDto>(okResult.Value);
      Assert.Equal("New", returnedImage.Description);
      Assert.Equal("#new", returnedImage.Hashtags);
      Assert.Equal("@new", returnedImage.Mentions);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_WhenImageDoesNotExist()
    {
      // Arrange
      _mockImageService.Setup(s => s.UpdateImageAsync(99, It.IsAny<ImageUpdateDto>(), TestUserId))
          .ReturnsAsync((ImageResponseDto?)null);

      // Act
      var result = await _controller.Update(99, new ImageUpdateDto());

      // Assert
      Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenImageExists()
    {
      // Arrange
      _mockImageService.Setup(s => s.DeleteImageAsync(2, TestUserId))
          .ReturnsAsync(true);

      // Act
      var result = await _controller.Delete(2);

      // Assert
      Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenImageDoesNotExist()
    {
      // Arrange
      _mockImageService.Setup(s => s.DeleteImageAsync(99, TestUserId))
          .ReturnsAsync((bool?)null);

      // Act
      var result = await _controller.Delete(99);

      // Assert
      Assert.IsType<NotFoundResult>(result);
    }
  }
}
