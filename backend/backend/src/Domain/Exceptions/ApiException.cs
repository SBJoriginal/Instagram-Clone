using System.Reflection;

namespace UGram.src.Domain.Exceptions
{
  public class ApiException : Exception
  {
    public int StatusCode { get; set; }
    public string Title { get; set; }
    public ApiException(int statusCode, string title, string message) : base(message)
    {
      StatusCode = statusCode;
      Title = title;
    }
  }
}
