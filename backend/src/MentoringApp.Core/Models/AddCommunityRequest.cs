using System.ComponentModel.DataAnnotations;

namespace MentoringApp.Core.Models;

public class AddCommunityRequest
{
    [Required]
    [RegularExpression("^[a-zA-Z0-9/#$&]{3,}$",
        ErrorMessage = "Title must be at least 3 characters and use only letters, numbers, / # $ &.")]
    public string Name { get; set; }

    [Required]
    [RegularExpression("^[a-zA-Z0-9]{100,1000}$",
        ErrorMessage = "Description must be 100–1000 characters of letters and numbers only.")]
    public string Description { get; set; }
}
