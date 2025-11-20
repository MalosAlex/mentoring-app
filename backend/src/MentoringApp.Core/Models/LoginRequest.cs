using System.ComponentModel.DataAnnotations;

namespace MentoringApp.Core.Models;

public class LoginRequest
{
    [Required]
    public string Identifier{get; set;}

    [Required]
    public string Password{get;set;}
}