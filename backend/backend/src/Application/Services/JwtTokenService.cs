using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.src.Domain.Entities;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Logging;

namespace UGram.src.Application.Services
{
  public interface ITokenService
  {
    string GenerateToken(ApplicationUser user);

    string GenerateRefreshToken();

    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
  }

  public class JwtTokenService : ITokenService
  {
    private readonly IConfiguration _configuration;
    private readonly ILogger<JwtTokenService> _logger;

    public JwtTokenService(IConfiguration configuration, ILogger<JwtTokenService> logger)
    {
      _configuration = configuration;
      _logger = logger;
    }

    public string GenerateToken(ApplicationUser user)
    {
      var jwtSettings = _configuration.GetSection("JwtSettings");
      var secretKey = jwtSettings["Secret"];
      var issuer = jwtSettings["Issuer"];
      var audience = jwtSettings["Audience"];
      var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? "60");

      if (string.IsNullOrEmpty(secretKey) || string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience))
      {
        throw new InvalidOperationException("JWT settings (Secret, Issuer, Audience) must be configured.");
      }

      var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
      var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

      var claims = new[]
      {
        new Claim(ClaimTypes.NameIdentifier, user.Id),
        new Claim(ClaimTypes.Email, user.Email!),
        new Claim(ClaimTypes.Name, user.UserName!)
      };

      var token = new JwtSecurityToken(
        issuer: issuer,
        audience: audience,
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
        signingCredentials: credentials
      );

      return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
      var randomNumber = new byte[64];
      using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
      {
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
      }
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
      var jwtSettings = _configuration.GetSection("JwtSettings");
      var secretKey = jwtSettings["Secret"];
      var issuer = jwtSettings["Issuer"];
      var audience = jwtSettings["Audience"];

      if (string.IsNullOrEmpty(secretKey))
      {
        throw new InvalidOperationException("JWT Secret must be configured.");
      }

      var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
      var tokenHandler = new JwtSecurityTokenHandler();

      try
      {
        var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
        {
          ValidateIssuerSigningKey = true,
          IssuerSigningKey = key,
          ValidateIssuer = true,
          ValidIssuer = issuer,
          ValidateAudience = true,
          ValidAudience = audience,
          ValidateLifetime = false,
          ClockSkew = TimeSpan.Zero
        }, out SecurityToken securityToken);

        if (!(securityToken is JwtSecurityToken jwtSecurityToken) ||
            !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
        {
          return null;
        }

        return principal;
      }
      catch (SecurityTokenException)
      {
        return null;
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "JWT validation error");
        return null;
      }
    }
  }
}
