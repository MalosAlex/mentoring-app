namespace MentoringApp.Core.Models;

public class PostReactionResponse
{
    public int PostId { get; set; }
    public string Type { get; set; } = string.Empty;
    public int TotalReactions { get; set; }
}