using System.ComponentModel.DataAnnotations;
using MentoringApp.Core.Validation;

namespace MentoringApp.Core.Models;

public class RegisterRequest
{
    public string FullName {get;set;}
    public string Username {get;set;}
    public string Email {get;set;}
    public string Password {get;set;}
}