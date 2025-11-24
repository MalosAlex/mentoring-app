using System;

namespace MentoringApp.Persistance.Entities;

public class Post
{
    public int Id { get; set; }
    public int CommunityId { get; set; }
    public Community Community { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }
    public string Caption { get; set; }
    public string? MediaUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PostReaction> Reactions { get; set; } = new();
    public List<PostComment> Comments { get; set; } = new();
}

