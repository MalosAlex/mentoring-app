using System;

namespace MentoringApp.Persistance.Entities;

public class PostReaction
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public Post Post { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }
    public string ReactionType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
