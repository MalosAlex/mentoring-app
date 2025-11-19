using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace MentoringApp.Core.Validation;

public class PasswordComplexityAttribute : ValidationAttribute
{
    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        var password = value as string;

        if (string.IsNullOrEmpty(password))
        {
            return ValidationResult.Success;
        }

        var hasNumber = new Regex(@"[0-9]+");
        var hasUpperChar = new Regex(@"\p{Lu}");
        var hasLowerChar = new Regex(@"\p{Ll}");

        if (!hasLowerChar.IsMatch(password))
        {
            return new ValidationResult("Password must contain at least one lowercase letter.");
        }
        if (!hasUpperChar.IsMatch(password))
        {
            return new ValidationResult("Password must contain at least one uppercase letter.");
        }
        if (!hasNumber.IsMatch(password))
        {
            return new ValidationResult("Password must contain at least one numeric value.");
        }

        return ValidationResult.Success;
    }
}
