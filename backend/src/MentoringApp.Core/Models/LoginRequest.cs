using System.ComponentModel.DataAnnotations;

namespace MentoringApp.Core.Models;

public class LoginRequest
{
    public string Identifier{get; set;}

    public string Password{get;set;}
}