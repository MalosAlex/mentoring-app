using MentoringApp.Persistance.Entities;

namespace MentoringApp.Core.Models;

internal static class CommunityExtensions
{
    public static CommunityResponse ToModel(this Community entity, int? currentUserId = null)
    {
        return new CommunityResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            MemberCount = entity.Users?.Count ?? 0,
            IsJoined = currentUserId.HasValue && (entity.Users?.Any(u => u.Id == currentUserId.Value) ?? false)
        };
    }
}
