using MentoringApp.Core.Abstractions;
using MentoringApp.Core.Models;
using MentoringApp.Persistance.Abstractions;

namespace MentoringApp.Core.Services;

internal class CatsService : ICatsService
{
    private readonly ICatsRepository _catsRepository;

    public CatsService(ICatsRepository catsRepository)
    {
        _catsRepository = catsRepository;
    }

    public async Task<GetCatsResponse> GetCats(GetCatsRequest request)
    {
        var cats = await _catsRepository.GetCats(request.Count);

        return new GetCatsResponse
        {
            Cats = cats
        };
    }
}
