using System;

namespace MentoringApp.Persistance.Entities;

public class PostComment
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public Post Post { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int? ParentCommentId { get; set; }
    public PostComment? ParentComment { get; set; }
    public List<PostComment> Replies { get; set; } = new();
    public List<CommentReaction> Reactions { get; set; } = new();
}

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
