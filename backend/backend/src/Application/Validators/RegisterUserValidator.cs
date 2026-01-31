using backend.src.Application.DTOs;
using FluentValidation;

namespace backend.src.Application.Validators
{
  public class RegisterUserValidator : AbstractValidator<RegisterDto>
  {
    public RegisterUserValidator()
    {
      RuleFor(x => x.Email)
        .NotEmpty().WithMessage("Email is required.")
        .EmailAddress().WithMessage("A valid email is required.");

      RuleFor(x => x.Password)
        .NotEmpty().WithMessage("Password is required.");
    }
  }
}
