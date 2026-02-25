using backend.src.Application.DTOs;
using UGram.src.Application.DTOs;

namespace UGram.src.Application.Interfaces
{
  public interface IAuthService
  {
    public Task<RegisterResponseDto> RegisterAsync(RegisterDto registerDto);

    public Task<LoginResponseDto> LoginAsync(LoginDto loginDto);

    public LoginResponseDto RefreshToken(string accessToken, string refreshToken);

    public Task DeleteAccountAsync(string userId);
  }
}
