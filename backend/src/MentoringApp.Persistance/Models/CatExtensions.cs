using MentoringApp.Persistance.Entities;

namespace MentoringApp.Persistance.Models;

internal static class CatExtensions
{
    public static CatResponse ToModel(this Cat entity)
    {
        return new CatResponse
        {
            Name = entity.Name
        };
    }
}
