namespace UGram.src.Domain.Exceptions
{
  public class NotFoundException : ApiException
  {
    public NotFoundException(string key, string value) : base(StatusCodes.Status404NotFound, $"{key} Not Found", $"Did not find {key} : {value}")
    {
    }
  }
}
