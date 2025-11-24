namespace MentoringApp.Core.Models;

public class CreatePostRequest
{
    public int CommunityId { get; set; }
    public int UserId { get; set; }
    public string Caption { get; set; } = string.Empty;
    public string? MediaUrl { get; set; }
}

