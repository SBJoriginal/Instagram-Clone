using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Exceptions;
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

      if (exception is ApiException apiException)
      {
        httpContext.Response.StatusCode = apiException.StatusCode;
        problemDetails.Status = apiException.StatusCode;
        problemDetails.Title = apiException.Title;
        problemDetails.Detail = apiException.Message;
        problemDetails.Type = $"https://httpstatuses.com/{apiException.StatusCode}";
        _logger.LogWarning("API Exception: {Message}", apiException.Message);
      }
      else
      {
        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;
        problemDetails.Status = StatusCodes.Status500InternalServerError;
        problemDetails.Title = "Internal Server Error";
        problemDetails.Detail = "An unexpected error occurred.";
        problemDetails.Type = "https://httpstatuses.com/500";
        _logger.LogError(exception, "Unhandled Exception: {Message}", exception.Message);
      }

      await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
      return true;
    }
  }
}
