using MentoringApp.Persistance.Entities;

namespace MentoringApp.Core.Models;

internal static class CommunityExtensions
{
    public static CommunityResponse ToModel(this Community entity)
    {
        return new CommunityResponse
        {
            Name = entity.Name,
            Description = entity.Description,
        };
    }
}
