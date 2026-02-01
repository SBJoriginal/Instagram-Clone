namespace UGram.src.Domain.Exceptions.Users
{
  public class UserProfileAlreadyExists : ApiException
  {
    public UserProfileAlreadyExists(string userId) : base(StatusCodes.Status409Conflict, "User Profile Already Exists", $"User profile already exists for user {userId}")
    {
    }
  }
}
