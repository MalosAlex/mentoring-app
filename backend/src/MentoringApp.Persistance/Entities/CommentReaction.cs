using System;

namespace MentoringApp.Persistance.Entities;

public class CommentReaction
{
    public int Id { get; set; }
    public int CommentId { get; set; }
    public PostComment Comment { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }
    public string ReactionType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
