using MentoringApp.Core.Models;

namespace MentoringApp.Core.Abstractions;

public interface ICatsService
{
    Task<GetCatsResponse> GetCats(GetCatsRequest request);
}
