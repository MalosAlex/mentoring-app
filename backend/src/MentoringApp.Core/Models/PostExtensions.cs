using MentoringApp.Persistance.Entities;

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
            AuthorName = entity.User?.FullName ?? entity.User?.Username ?? "Unknown"
        };
    }
}

