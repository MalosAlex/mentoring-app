using System;

namespace MentoringApp.Core.Models;

public class PostCommentDto
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public int UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string AuthorName { get; set; } = string.Empty;
}
