using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Api.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;
using Xunit;

namespace UGram.Tests.Unit.Controllers
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
          new Mock<ILogger<ImagesController>>().Object);

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
    public async Task Upload_ReturnsCreated_WhenValid()
    {
      var fileMock = new Mock<IFormFile>();
      var uploadDto = new ImageUploadRequestDto
      {
        File = fileMock.Object,
        Description = "Test",
        Hashtags = "#test",
        Mentions = "@test"
      };

      var imageResult = new ImageUploadResponseDto { Id = 1, FilePath = "/path" };

      _mockImageService.Setup(s => s.UploadImageAsync(It.IsAny<ImageUploadRequestDto>(), It.IsAny<string>()))
          .ReturnsAsync(imageResult);

      var result = await _controller.Upload(uploadDto);

      var createdResult = Assert.IsType<CreatedAtActionResult>(result);
      Assert.Equal(201, createdResult.StatusCode);
      Assert.Equal(imageResult, createdResult.Value);
    }

    [Fact]
    public async Task Update_ReturnsOk_WhenImageExists()
    {
      var updateDto = new ImageUpdateDto { Description = "New" };
      var responseDto = new ImageResponseDto
      {
        Id = 1,
        Description = "New"
      };

      _mockImageService.Setup(s => s.UpdateImageAsync(1, It.IsAny<ImageUpdateDto>(), TestUserId))
          .ReturnsAsync(responseDto);

      var result = await _controller.Update(1, updateDto);

      var okResult = Assert.IsType<OkObjectResult>(result);
      var updatedImage = Assert.IsType<ImageResponseDto>(okResult.Value);
      Assert.Equal("New", updatedImage.Description);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_WhenImageDoesNotExist()
    {
      _mockImageService.Setup(s => s.UpdateImageAsync(999, It.IsAny<ImageUpdateDto>(), TestUserId))
          .ReturnsAsync((ImageResponseDto?)null);

      var result = await _controller.Update(999, new ImageUpdateDto());

      Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenImageExists()
    {
      _mockImageService.Setup(s => s.DeleteImageAsync(2, TestUserId))
          .ReturnsAsync(true);

      var result = await _controller.Delete(2);

      Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenImageDoesNotExist()
    {
      _mockImageService.Setup(s => s.DeleteImageAsync(999, TestUserId))
          .ReturnsAsync((bool?)null);

      var result = await _controller.Delete(999);

      Assert.IsType<NotFoundResult>(result);
    }
  }
}
