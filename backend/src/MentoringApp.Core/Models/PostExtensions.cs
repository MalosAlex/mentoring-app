using MentoringApp.Persistance.Entities;
using System.Linq;

namespace MentoringApp.Core.Models;

internal static class PostExtensions
{
    public static PostResponse ToModel(this Post entity)
    {
        return new PostResponse
        {
            Id = entity.Id,
            CommunityId = entity.CommunityId,
            UserId = entity.UserId,
            Caption = entity.Caption,
            MediaUrl = entity.MediaUrl,
            CreatedAt = entity.CreatedAt,
            AuthorName = entity.User?.FullName ?? entity.User?.Username ?? "Unknown",
            ReactionCount = entity.Reactions?.Count ?? 0,
            Comments = entity.Comments?.Select(c => new PostCommentDto
            {
                Id = c.Id,
                PostId = c.PostId,
                UserId = c.UserId,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                AuthorName = c.User?.FullName ?? c.User?.Username ?? "Unknown"
            }).OrderByDescending(c => c.CreatedAt).ToList() ?? new List<PostCommentDto>()
        };
    }
}

