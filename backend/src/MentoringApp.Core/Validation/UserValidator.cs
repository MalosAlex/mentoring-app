using MentoringApp.Core.Models;
using System.Text.RegularExpressions;

namespace MentoringApp.Core.Validation;

public static class UserValidator
{
    public static void ValidateRegisterRequest(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            throw new ArgumentException("Email is required.");

        if (string.IsNullOrWhiteSpace(request.Password))
            throw new ArgumentException("Password is required.");

        if (string.IsNullOrWhiteSpace(request.FullName))
            throw new ArgumentException("Full Name is required.");

        if (string.IsNullOrWhiteSpace(request.Username))
            throw new ArgumentException("Username is required.");

        ValidateUsername(request.Username);
        ValidateEmailFormat(request.Email);
        ValidatePasswordStrength(request.Password);
    }

    private static void ValidateUsername(string username)
    {
        if (username.Any(char.IsWhiteSpace))
        {
            throw new ArgumentException("Username cannot contain spaces.");
        }

        var usernameRegex = new Regex(@"^[a-zA-Z0-9_-]+$");

        if (!usernameRegex.IsMatch(username))
        {
            throw new ArgumentException("Username contains forbidden characters. Only letters, numbers, '-', and '_' are allowed.");
        }
    }

    private static void ValidateEmailFormat(string email)
    {
        var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
        
        if (!emailRegex.IsMatch(email))
        {
            throw new ArgumentException("Invalid email format.");
        }
    }

    private static void ValidatePasswordStrength(string password)
    {
        if (password.Length < 8)
            throw new ArgumentException("Password must be at least 8 characters long.");

        if (!password.Any(char.IsUpper))
            throw new ArgumentException("Password must contain at least one uppercase letter.");

        if (!password.Any(char.IsLower))
            throw new ArgumentException("Password must contain at least one lowercase letter.");

        if (!password.Any(char.IsDigit))
            throw new ArgumentException("Password must contain at least one number.");

        if (!Regex.IsMatch(password, @"[!@#$%^&*(),.?""{}|<>]"))
            throw new ArgumentException("Password must contain at least one special character.");
    }
}