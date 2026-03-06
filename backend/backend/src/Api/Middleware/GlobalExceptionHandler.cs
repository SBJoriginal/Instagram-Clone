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
    private readonly IWebHostEnvironment _env;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IWebHostEnvironment env)
    {
      _logger = logger;
      _env = env;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
      var traceId = httpContext.TraceIdentifier;

      var problemDetails = new ProblemDetails
      {
        Instance = httpContext.Request.Path,
        Extensions = { ["traceId"] = traceId }
      };

      switch (exception)
      {
        case ApiException apiException:
          httpContext.Response.StatusCode = apiException.StatusCode;
          problemDetails.Status = apiException.StatusCode;
          problemDetails.Title = apiException.Title;
          problemDetails.Detail = apiException.Message;
          problemDetails.Type = $"https://httpstatuses.com/{apiException.StatusCode}";
          _logger.LogWarning("API Exception: {Message} [TraceId: {TraceId}]", apiException.Message, traceId);
          break;
        case ValidationException validationException:
          httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
          problemDetails.Status = StatusCodes.Status400BadRequest;
          problemDetails.Title = "Validation Error";
          problemDetails.Detail = validationException.Message;
          problemDetails.Type = "https://httpstatuses.com/400";
          _logger.LogWarning("Validation Exception: {Message} [TraceId: {TraceId}]", validationException.Message, traceId);
          break;
        case UnauthorizedAccessException unauthorizedAccessException:
          httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
          problemDetails.Status = StatusCodes.Status401Unauthorized;
          problemDetails.Title = "Unauthorized";
          problemDetails.Detail = unauthorizedAccessException.Message;
          problemDetails.Type = "https://httpstatuses.com/401";
          _logger.LogWarning("Unauthorized Access: {Message} [TraceId: {TraceId}]", unauthorizedAccessException.Message, traceId);
          break;
        case ArgumentException argEx:
          httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
          problemDetails.Status = StatusCodes.Status400BadRequest;
          problemDetails.Title = "Bad Request";
          problemDetails.Detail = argEx.Message;
          problemDetails.Type = "https://httpstatuses.com/400";
          _logger.LogWarning("Invalid Argument: {Message} [TraceId: {TraceId}]", argEx.Message, traceId);
          break;
        default:
          httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;
          problemDetails.Status = StatusCodes.Status500InternalServerError;
          problemDetails.Title = "Internal Server Error";

          if (_env.IsEnvironment("Staging"))
          {
            problemDetails.Detail = $"{exception.Message} | {exception.StackTrace}";
          }
          else
          {
            problemDetails.Detail = "An unexpected error occurred.";
          }

          problemDetails.Type = "https://httpstatuses.com/500";
          _logger.LogError(exception, "Unhandled Exception: {Message} [TraceId: {TraceId}]", exception.Message, traceId);
          break;
      }

      await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
      return true;
    }
  }
}
