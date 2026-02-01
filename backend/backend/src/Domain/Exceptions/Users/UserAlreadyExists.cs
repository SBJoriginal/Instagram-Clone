namespace UGram.src.Domain.Exceptions.Users
{
  public class UserAlreadyExists : ApiException
  {
    public UserAlreadyExists(string email) : base(StatusCodes.Status409Conflict, "User Already Exists", $"The email '{email}' is already registered")
    {
    }
  }
}
