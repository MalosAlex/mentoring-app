using System;

namespace MentoringApp.Core.Models;

public class CommentReactionResponse
{
    public int CommentId { get; set; }
    public int UserId { get; set; }
    public string ReactionType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int TotalReactions { get; set; }
    public bool IsLiked { get; set; }
}
