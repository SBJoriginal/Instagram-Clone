using UGram.src.Application.DTOs;
using FluentValidation;

namespace UGram.src.Application.Validators
{
  public class RegisterUserValidator : AbstractValidator<RegisterDto>
  {
    public RegisterUserValidator()
    {
      RuleFor(x => x.Email)
        .NotEmpty().WithMessage("Email is required.")
        .EmailAddress().WithMessage("A valid email is required.");

      RuleFor(x => x.Password)
        .NotEmpty().WithMessage("Password is required.")
        .MinimumLength(6).WithMessage("Password must be at least 6 characters long.")
        .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
        .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
        .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character.");
    }
  }
}
