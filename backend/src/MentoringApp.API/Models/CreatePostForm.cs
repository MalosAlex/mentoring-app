using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace MentoringApp.API.Models;

public class CreatePostForm
{
    [Required]
    [MaxLength(500)]
    public string Caption { get; set; } = string.Empty;

    public IFormFile? Media { get; set; }
}

