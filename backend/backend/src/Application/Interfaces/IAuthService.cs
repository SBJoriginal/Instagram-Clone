using backend.src.Application.DTOs;
using UGram.src.Application.DTOs;

namespace UGram.src.Application.Interfaces
{
  public interface IAuthService
  {
    public Task<UserDto> RegisterAsync(RegisterDto registerDto);
  }
}
