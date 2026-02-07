using System;
using System.Threading.Tasks;
using Api.Controllers;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;
using Xunit;

namespace UGram.Tests.Unit.Controllers
{
  public class ImagesControllerTests
  {
    private readonly Mock<IImageService> _mockImageService;
    private readonly AppDbContext _context;
    private readonly Mock<IWebHostEnvironment> _mockEnvironment;
    private readonly ImagesController _controller;

    public ImagesControllerTests()
    {
      _mockImageService = new Mock<IImageService>();

      var options = new DbContextOptionsBuilder<AppDbContext>()
          .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
          .Options;
      _context = new AppDbContext(options);

      _mockEnvironment = new Mock<IWebHostEnvironment>();

      _controller = new ImagesController(_mockImageService.Object, _context, _mockEnvironment.Object);
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

      _mockImageService.Setup(s => s.UploadImageAsync(It.IsAny<IFormFile>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
          .ReturnsAsync(imageResult);


      var result = await _controller.Upload(uploadDto);


      var createdResult = Assert.IsType<CreatedAtActionResult>(result);
      Assert.Equal(201, createdResult.StatusCode);
      Assert.Equal(imageResult, createdResult.Value);
    }

    [Fact]
    public async Task Update_ReturnsOk_WhenImageExists()
    {

      var image = new Image { Id = 1, Description = "Old" };
      _context.Images.Add(image);
      await _context.SaveChangesAsync();

      var updateDto = new ImageUpdateDto { Description = "New" };


      var result = await _controller.Update(1, updateDto);


      var okResult = Assert.IsType<OkObjectResult>(result);
      var updatedImage = Assert.IsType<Image>(okResult.Value);
      Assert.Equal("New", updatedImage.Description);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_WhenImageDoesNotExist()
    {

      var result = await _controller.Update(999, new ImageUpdateDto());


      Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenImageExists()
    {

      var image = new Image { Id = 2, Description = "To Delete" };
      _context.Images.Add(image);
      await _context.SaveChangesAsync();


      var result = await _controller.Delete(2);


      Assert.IsType<NoContentResult>(result);
      Assert.Null(await _context.Images.FindAsync(2));
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenImageDoesNotExist()
    {

      var result = await _controller.Delete(999);


      Assert.IsType<NotFoundResult>(result);
    }
  }
}
