using Api.Controllers;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;

namespace Backend.Tests
{
  public class ImagesControllerTests
  {
    private readonly AppDbContext _context;
    private readonly Mock<IWebHostEnvironment> _mockEnvironment;
    private readonly Mock<IImageService> _mockImageService;
    private readonly ImagesController _controller;

    public ImagesControllerTests()
    {
      var options = new DbContextOptionsBuilder<AppDbContext>()
          .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
          .Options;
      _context = new AppDbContext(options);
      _mockEnvironment = new Mock<IWebHostEnvironment>();
      _mockImageService = new Mock<IImageService>();

      // Setup default environment paths
      _mockEnvironment.Setup(e => e.WebRootPath).Returns("wwwroot");
      _mockEnvironment.Setup(e => e.ContentRootPath).Returns("root");

      _controller = new ImagesController(_mockImageService.Object, _context, _mockEnvironment.Object);
    }

    [Fact]
    public async Task Update_ReturnsOk_WhenImageExists()
    {
      // Arrange
      var image = new Image { Id = 1, Description = "Old", FilePath = "/local.png", CreatedAt = DateTime.UtcNow };
      _context.Images.Add(image);
      await _context.SaveChangesAsync();

      var dto = new ImageUpdateDto { Description = "New", Hashtags = "#new", Mentions = "@new" };

      // Act
      var result = await _controller.Update(1, dto);

      // Assert
      var okResult = Assert.IsType<OkObjectResult>(result);
      var returnedImage = Assert.IsType<Image>(okResult.Value);
      Assert.Equal("New", returnedImage.Description);
      Assert.Equal("#new", returnedImage.Hashtags);
      Assert.Equal("@new", returnedImage.Mentions);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_WhenImageDoesNotExist()
    {
      var result = await _controller.Update(99, new ImageUpdateDto());
      Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenImageExists()
    {
      // Arrange
      var image = new Image { Id = 2, Description = "Delete Me", FilePath = "/delete.png", CreatedAt = DateTime.UtcNow };
      _context.Images.Add(image);
      await _context.SaveChangesAsync();

      // Act
      var result = await _controller.Delete(2);

      // Assert
      Assert.IsType<NoContentResult>(result);
      Assert.Null(await _context.Images.FindAsync(2));
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenImageDoesNotExist()
    {
      var result = await _controller.Delete(99);
      Assert.IsType<NotFoundResult>(result);
    }
  }
}
