using FluentValidation;
using UGram.src.Application.DTOs;

namespace UGram.src.Application.Validators
{
  public class UserProfileRequestDtoValidator : AbstractValidator<UserProfileRequestDto>
  {
    public UserProfileRequestDtoValidator()
    {
      RuleFor(x => x.PhoneNumber)
        .Matches(@"^\d{3}-\d{3}-\d{4}$")
        .When(x => !string.IsNullOrEmpty(x.PhoneNumber))
        .WithMessage("Phone number must be in format XXX-XXX-XXXX.");
    }
  }
}
