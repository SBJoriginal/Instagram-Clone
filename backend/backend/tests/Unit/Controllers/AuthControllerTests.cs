using System.Threading.Tasks;
using backend.src.Api.Controllers;
using Microsoft.AspNetCore.Mvc;
using Moq;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;
using Xunit;

namespace UGram.Tests.Unit.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IAuthService> _mockAuthService;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _mockAuthService = new Mock<IAuthService>();
            _controller = new AuthController(_mockAuthService.Object);
        }

        [Fact]
        public async Task GoogleLogin_ReturnsOk_WithLoginResponse()
        {
            // Arrange
            var dto = new GoogleAuthDto { IdToken = "valid-token" };
            var expectedResponse = new LoginResponseDto 
            { 
                Id = "user-id", 
                Email = "test@gmail.com", 
                Token = "jwt-token", 
                RefreshToken = "refresh-token" 
            };

            _mockAuthService.Setup(s => s.GoogleLoginAsync(dto.IdToken))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GoogleLogin(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(expectedResponse, okResult.Value);
        }
    }
}
