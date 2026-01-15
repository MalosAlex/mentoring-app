using MentoringApp.Persistance.Entities;
using System.Linq;

namespace MentoringApp.Core.Models;

internal static class PostExtensions
{
    public static PostResponse ToModel(this Post entity, int? currentUserId = null)
    {
        var allComments = entity.Comments ?? new List<PostComment>();
        
        return new PostResponse
        {
            Id = entity.Id,
            CommunityId = entity.CommunityId,
            UserId = entity.UserId,
            Caption = entity.Caption,
            MediaUrl = entity.MediaUrl,
            CreatedAt = DateTime.SpecifyKind(entity.CreatedAt, DateTimeKind.Utc),
            AuthorName = entity.User?.FullName ?? entity.User?.Username ?? "Unknown",
            ReactionCount = entity.Reactions?.Count ?? 0,
            IsLiked = currentUserId.HasValue && (entity.Reactions?.Any(r => r.UserId == currentUserId.Value) ?? false),
            Comments = BuildCommentTree(allComments, null, currentUserId)
        };
    }

    private static List<PostCommentDto> BuildCommentTree(List<PostComment> allComments, int? parentId, int? currentUserId)
    {
        var query = allComments.Where(c => c.ParentCommentId == parentId);
        
        if (parentId == null)
        {
            // Root level: Newest first
            return query
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => c.ToDto(allComments, currentUserId))
                .ToList();
        }
        else
        {
            // Reply level: Oldest first (conversation flow)
            return query
                .OrderBy(c => c.CreatedAt)
                .Select(c => c.ToDto(allComments, currentUserId))
                .ToList();
        }
    }

    public static PostCommentDto ToDto(this PostComment entity, List<PostComment>? allComments = null, int? currentUserId = null)
    {
        return new PostCommentDto
        {
            Id = entity.Id,
            PostId = entity.PostId,
            UserId = entity.UserId,
            Content = entity.Content,
            CreatedAt = DateTime.SpecifyKind(entity.CreatedAt, DateTimeKind.Utc),
            AuthorName = entity.User?.FullName ?? entity.User?.Username ?? "Unknown",
            ParentCommentId = entity.ParentCommentId,
            ReactionCount = entity.Reactions?.Count ?? 0,
            IsLiked = currentUserId.HasValue && (entity.Reactions?.Any(r => r.UserId == currentUserId.Value) ?? false),
            Replies = allComments != null 
                ? BuildCommentTree(allComments, entity.Id, currentUserId)
                : new List<PostCommentDto>()
        };
    }
}
