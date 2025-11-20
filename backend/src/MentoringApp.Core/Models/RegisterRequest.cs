using System.ComponentModel.DataAnnotations;
using MentoringApp.Core.Validation;

namespace MentoringApp.Core.Models;

public class RegisterRequest
{
    [Required]
    public string FullName {get;set;}
    [Required]
    public string Username {get;set;}
    [Required]
    [EmailAddress]
    public string Email {get;set;}
    [Required]
    [MinLength(8, ErrorMessage ="Password must be 8 characters long")]
    [PasswordComplexity]
    public string Password {get;set;}
}