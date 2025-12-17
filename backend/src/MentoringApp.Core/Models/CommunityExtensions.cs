using MentoringApp.Persistance.Entities;

namespace MentoringApp.Core.Models;

internal static class CommunityExtensions
{
    public static CommunityResponse ToModel(this Community entity, int userId)
    {
        return new CommunityResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            IsJoined = entity.Users.Any(u => u.Id == userId),
            memberCount = entity.Users.Count()
        };
    }
}
