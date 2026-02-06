namespace UGram.src.Domain.Exceptions.Users
{
  public class UserAlreadyExistsException : ApiException
  {
    public UserAlreadyExistsException(string email) : base(StatusCodes.Status409Conflict, "User Already Exists", $"The email '{email}' is already registered")
    {
    }
  }
}
