using System;

namespace MentoringApp.Core.Models;

public class PostReactionResponse
{
    public int PostId { get; set; }
    public int UserId { get; set; }
    public string ReactionType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int TotalReactions { get; set; }
}
