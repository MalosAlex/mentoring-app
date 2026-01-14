using MentoringApp.Persistance.Entities;
using System.Linq;

namespace MentoringApp.Core.Models;

internal static class PostExtensions
{
    public static PostResponse ToModel(this Post entity, int? currentUserId = null)
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
            IsLiked = currentUserId.HasValue && entity.Reactions?.Any(r => r.UserId == currentUserId.Value) == true,
            Comments = entity.Comments?.Select(c => new PostCommentDto
            {
                Id = c.Id,
                PostId = c.PostId,
                UserId = c.UserId,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                AuthorName = c.User?.FullName ?? c.User?.Username ?? "Unknown",
                ReactionCount = c.Reactions?.Count ?? 0,
                IsLiked = currentUserId.HasValue && c.Reactions?.Any(r => r.UserId == currentUserId.Value) == true
            }).OrderByDescending(c => c.CreatedAt).ToList() ?? new List<PostCommentDto>()
        };
    }
}

