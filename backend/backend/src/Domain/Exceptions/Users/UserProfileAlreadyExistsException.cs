namespace UGram.src.Domain.Exceptions.Users
{
  public class UserProfileAlreadyExistsException : ApiException
  {
    public UserProfileAlreadyExistsException(string userId) : base(StatusCodes.Status409Conflict, "User Profile Already Exists", $"User profile already exists for user {userId}")
    {
    }
  }
}
