using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Exceptions;
using System.ComponentModel.DataAnnotations;
using UGram.src.Domain.Exceptions;

namespace UGram.src.Api.Middleware
{
  public class GlobalExceptionHandler : IExceptionHandler
  {
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
      _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
      var problemDetails = new ProblemDetails
      {
        Instance = httpContext.Request.Path,
      };

      switch (exception)
      {
        case ApiException apiException:
          httpContext.Response.StatusCode = apiException.StatusCode;
          problemDetails.Status = apiException.StatusCode;
          problemDetails.Title = apiException.Title;
          problemDetails.Detail = apiException.Message;
          problemDetails.Type = $"https://httpstatuses.com/{apiException.StatusCode}";
          _logger.LogWarning("API Exception: {Message}", apiException.Message);
          break;
        case ValidationException validationException:
          httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
          problemDetails.Status = StatusCodes.Status400BadRequest;
          problemDetails.Title = "Validation Error";
          problemDetails.Detail = validationException.Message;
          problemDetails.Type = "https://httpstatuses.com/400";
          _logger.LogWarning("Validation Exception: {Message}", validationException.Message);
          break;
        case UnauthorizedAccessException unauthorizedAccessException:
          httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
          problemDetails.Status = StatusCodes.Status401Unauthorized;
          problemDetails.Title = "Unauthorized";
          problemDetails.Detail = unauthorizedAccessException.Message;
          problemDetails.Type = "https://httpstatuses.com/401";
          _logger.LogWarning("Unauthorized Access: {Message}", unauthorizedAccessException.Message);
          break;
        case ArgumentException argumentException:
          httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
          problemDetails.Status = StatusCodes.Status400BadRequest;
          problemDetails.Title = "Invalid Argument";
          problemDetails.Detail = argumentException.Message;
          problemDetails.Type = "https://httpstatuses.com/400";
          _logger.LogWarning("Argument Exception: {Message}", argumentException.Message);
          break;
        default:
          httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;
          problemDetails.Status = StatusCodes.Status500InternalServerError;
          problemDetails.Title = "Internal Server Error";
          problemDetails.Detail = "An unexpected error occurred.";
          problemDetails.Type = "https://httpstatuses.com/500";
          _logger.LogError(exception, "Unhandled Exception: {Message}", exception.Message);
          break;
      }

      await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
      return true;
    }
  }
}
