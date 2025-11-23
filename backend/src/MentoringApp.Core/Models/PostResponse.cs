using System;
using System.Collections.Generic;
namespace MentoringApp.Core.Models;

public class PostResponse
{
    public int Id { get; set; }
    public int CommunityId { get; set; }
    public int UserId { get; set; }
    public string Caption { get; set; } = string.Empty;
    public string? MediaUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public int ReactionCount { get; set; }
    public List<PostCommentDto> Comments { get; set; } = new();
}

